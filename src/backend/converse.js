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
// guard → load history → isolate → assemble → cook → parse → atomic
// (assistant-append + dispatch + status read) → respond.
//
// The user message append (step 3) is intentionally OUTSIDE the
// transaction. The user said something — that fact is recorded even if
// the turn fails. Only the assistant append + handler dispatch are
// transactional, so a handler exception rolls back the assistant row
// without losing the user row.
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

const GENERIC = 'we had a problem recording this — please try again';
const ASSISTANT_ROLE = 'assistant';
const USER_ROLE = 'user';

export default async function converse(req, res) {
  let conversation_id;
  try {
    const owner_id = req.user.id;
    const { content, conversation_id: providedId } = req.body;

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
    const { text, usage } = await cook(briefing);
    const { prose, markers } = parse(text);

    const finalStatus = await pantry.transaction(async (tx) => {
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
      const result = await tx.query(
        `SELECT status FROM conversations
           WHERE id = $1 AND owner_id = $2`,
        [conversation_id, owner_id]
      );
      return result.rows[0].status;
    });

    return res.status(200).json({
      conversation_id,
      reply: { role: ASSISTANT_ROLE, content: prose },
      status: finalStatus,
    });
  } catch (err) {
    console.error(
      `converse handler error (conversation_id=${conversation_id ?? 'unknown'}): ${err.message}`
    );
    if (!res.headersSent) {
      return res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: GENERIC },
      });
    }
  }
}
