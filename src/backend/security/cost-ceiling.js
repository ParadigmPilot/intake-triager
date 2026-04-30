// Cost ceiling — per-conversation token cap.
//
// Per intake-triager-gold-vision.md v1.5:
//   §10 item 8  — Cost ceiling per conversation: token accounting metered
//     at the Expediter; caps enforced before the Chef is called. Threshold
//     from CONVERSATION_TOKEN_CEILING env var (default 200000). Sum of
//     output_tokens across all assistant messages in the conversation.
//   §10 Configuration — CONVERSATION_TOKEN_CEILING default 200000.
//   §4  HTTP API contract — 429 with error.code 'TOKEN_CEILING_EXCEEDED'.
//
// Shape. Inline check function, not Express middleware. §10 item 8
// constrains the location: "caps enforced before the Chef is called."
// /converse.js (Phase 6) calls checkCostCeiling after loading history
// and before chef.cook(). Returns {sum, ceiling, exceeded}; the caller
// chooses how to surface the breach (typically 429 + TOKEN_CEILING_EXCEEDED).
//
// Storage. No in-memory state — the sum lives in the messages table
// (token_usage->>'output_tokens'). Pantry exposes
// sumConversationOutputTokens for the read; see build-discovery D9 for
// the canon update that adds the row to §4's Pantry public API table.

import pantry from '../pantry.js';

const DEFAULT_CEILING = 200000;

function getCeiling() {
  const raw = process.env.CONVERSATION_TOKEN_CEILING;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_CEILING;
}

export async function checkCostCeiling({ conversation_id, owner_id, tx = null }) {
  const sum = await pantry.sumConversationOutputTokens(
    conversation_id,
    owner_id,
    tx
  );
  const ceiling = getCeiling();
  return {
    sum,
    ceiling,
    exceeded: sum >= ceiling,
  };
}

export default checkCostCeiling;
