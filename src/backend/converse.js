// /converse — POST handler orchestrating one Triager turn.
//
// Per intake-triager-gold-vision.md v1.5:
//   §4  HTTP API contract     — POST /converse request/response shape
//   §6  Placeholder convention — TRUSTED-CONTEXT pool {TODAY, ORG_NAME,
//                               CRISIS_LINE}; TODAY is UTC YYYY-MM-DD
//   §9  Conversation status transitions — final status read after dispatch
//                               inside the same transaction
//   §10 item 5  — user content isolated via isolateHistory before assembly
//   §10 item 8  — cost ceiling enforced before chef.cook
//   §10 item 11 — owner_id sourced from req.user (identityStub)
//
// Sequence: insert/continue conversation → append user → cost-ceiling
// guard → load history → isolate → assemble → cook (wrapped with
// circuit-breaker recording) → parse → atomic (assistant-append +
// dispatch + session-turn-increment + status read) → respond.
//
// The user message append (step 3) is intentionally OUTSIDE the
// transaction. The user said something — that fact is recorded even if
// the turn fails. Only the assistant append + handler dispatch +
// session-turn-increment are transactional, so a handler exception
// rolls back the assistant row and session-turn bump together — no
// drift between conversation state and session state.
//
// Per WO-310.9c: the demo session (populated by demoSessionMiddleware
// from WO-310.9a and validated by costProtectionMiddleware) drives an
// in-transaction increment of demo_sessions.turns_used. The Anthropic
// call is wrapped with circuit-breaker recordSuccess/recordFailure so
// upstream degradation (workspace-cap or transient 5xx/429) trips the
// breaker for subsequent requests. The response payload gains a
// `demoSession` field carrying turnsUsed/turnBudget/terminalAt for the
// frontend session-end CTA (WO-310.9d).
//
// Error envelope is generic per gold vision §4 *Error response*: no AI
// output, no schema detail, no stack trace. Failures route through one
// of four error codes: VALIDATION_FAILED (input-validation),
// RATE_LIMITED (rate-limit), TOKEN_CEILING_EXCEEDED (here, step 4),
// INTERNAL_ERROR (here, catch-all).

import pantry from './pantry.js';
import { cook } from './chef.js';
import { parse, dispatch } from './expediter.js';
import { assemblePrompt } from './prompt-assembler.js';
import { isolateHistory } from './security/prompt-injection.js';
import { checkCostCeiling } from './security/cost-ceiling.js';
import { recordSuccess, recordFailure } from './demo/circuit-breaker.js';
import classifyError from './demo/anthropic-error.js';
import pantryDemo from './demo/pantry-demo.js';
import { log } from './observability.js';

const GENERIC = 'we had a problem recording this — please try again';
const ASSISTANT_ROLE = 'assistant';
const USER_ROLE = 'user';

export default async function converse(req, res) {
  let conversation_id;
  try {
    const owner_id = req.user.id;
    const { content, conversation_id: providedId } = req.body;

    log({
      level: 'info',
      event: 'converse_turn_received',
      owner_id,
      ...(providedId ? { conversation_id: providedId } : {}),
    });

    if (!providedId) {
      const created = await pantry.insertConversation(owner_id);
      conversation_id = created.id;
    } else {
      conversation_id = providedId;
    }

    await pantry.appendMessage({
      conversation_id,
      role: USER_ROLE,
      content,
      owner_id,
    });

    const { exceeded } = await checkCostCeiling({ conversation_id, owner_id });
    if (exceeded) {
      log({
        level: 'warn',
        event: 'converse_token_ceiling_exceeded',
        conversation_id,
        owner_id,
      });
      return res.status(429).json({
        error: { code: 'TOKEN_CEILING_EXCEEDED', message: GENERIC },
      });
    }

    const history = await pantry.loadMessages(conversation_id, owner_id);
    const isolated = isolateHistory(history);

    const placeholders = {
      TODAY: new Date().toISOString().slice(0, 10),
      ORG_NAME: process.env.ORG_NAME,
      CRISIS_LINE: process.env.CRISIS_LINE,
    };

    const briefing = assemblePrompt({ placeholders, history: isolated });

    // Anthropic call wrapped with circuit-breaker recording. The breaker
    // observes upstream health across requests — successes close it,
    // failures contribute toward a trip. Classification distinguishes
    // workspace-cap (long open window) from transient 5xx/429/network
    // (short open window per WO-310.9c §D.1).
    let text;
    let usage;
    try {
      ({ text, usage } = await cook(briefing));
      recordSuccess();
    } catch (err) {
      recordFailure(classifyError(err));
      throw err;
    }

    const { prose, markers } = parse(text);

    const { status: finalStatus, sessionAfter } = await pantry.transaction(
      async (tx) => {
        await pantry.appendMessage(
          {
            conversation_id,
            role: ASSISTANT_ROLE,
            content: prose,
            token_usage: usage,
            owner_id,
          },
          tx
        );
        await dispatch(markers, { conversation_id, owner_id, tx });
        // Per WO-310.9c §D.5: increment demo_sessions.turns_used in the
        // SAME transaction as the assistant-message insert. Partial
        // commits would create drift between conversation state and
        // session state.
        const updatedSession = await pantryDemo.incrementSessionTurns(
          req.demoSession.id,
          tx
        );
        const result = await tx.query(
          `SELECT status FROM conversations
             WHERE id = $1 AND owner_id = $2`,
          [conversation_id, owner_id]
        );
        return { status: result.rows[0].status, sessionAfter: updatedSession };
      }
    );

    log({
      level: 'info',
      event: 'converse_turn_complete',
      conversation_id,
      owner_id,
      status: finalStatus,
    });

    return res.status(200).json({
      conversation_id,
      reply: { role: ASSISTANT_ROLE, content: prose },
      status: finalStatus,
      // Per-turn artifacts for the composition overlay (BL-8). TYPE ONLY —
      // the marker payload is intake content (TRIAGE_RECORD = the record
      // itself) and never leaves the server (§10). Additive field; the bare
      // clone ignores it.
      artifacts: {
        markers: markers.map((m) => ({ type: m.type })),
      },
      demoSession: {
        turnsUsed: sessionAfter.turns_used,
        turnBudget: sessionAfter.turn_budget,
        terminalAt: sessionAfter.terminal_at,
      },
    });
  } catch (err) {
    log({
      level: 'error',
      event: 'converse_handler_error',
      conversation_id: conversation_id ?? null,
      owner_id: req.user?.id ?? null,
      error: err.message,
    });
    if (!res.headersSent) {
      return res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: GENERIC },
      });
    }
  }
}
