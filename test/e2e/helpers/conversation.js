// Multi-turn /converse driver for Phase 8 E2E (per WO-304.2.a).
// runConversation posts user messages one at a time against the running
// test server, capturing Taylor's replies and the response status. Stops
// when:
//   - response.status is non-'active' (terminal: 'complete' or 'escalated')
//   - userMessages array is exhausted
//
// Test authors bound the turn count by limiting userMessages.length
// (typically <= 10). If Taylor stays 'active' through the entire array,
// lastStatus === 'active' and the test's terminal-status assertion fails
// explicitly — that is the design.
//
// Returns { conversationId, turns, lastReply, lastStatus }.
//   - conversationId: UUID returned by the first turn, reused on subsequent turns
//   - turns:          [{ user, reply, status }] for diagnostics on test failure
//   - lastReply:      Taylor's final assistant content (string)
//   - lastStatus:     'active' | 'complete' | 'escalated' from the final response
//
// Per WO-310.9a: /converse is now gated by demoSessionMiddleware. Before
// posting the first turn, runConversation mints a demo_sessions row
// directly against the test DB (skipping the Resend issuance flow and
// the HMAC-signed verify URL) and threads the cookie through every
// subsequent fetch. The synthesized session is scoped to DEMO_OWNER_ID
// so the identityStub-derived req.user.id matches the session's
// owner_id. demo_links/demo_sessions rows accumulate across runs; this
// is acceptable for the isolated test DB and is not cleaned up by
// deleteByOwner (follow-up will extend that helper).

import { randomUUID } from 'node:crypto';
import { getPool } from './db.js';

const DEMO_OWNER_ID = '00000000-0000-0000-0000-000000000001';

async function mintDemoSession() {
  const pool = getPool();
  // demo_sessions has FK on demo_link_id; mint a parent link row first.
  // token_hash needs only uniqueness in tests, never gets verified.
  const linkRes = await pool.query(
    `INSERT INTO demo_links
       (owner_id, email, token_hash, expires_at, used_at)
     VALUES ($1, $2, $3, now() + interval '1 hour', now())
     RETURNING id`,
    [DEMO_OWNER_ID, `e2e+${randomUUID()}@example.com`, `e2e-${randomUUID()}`]
  );
  // turn_budget set high enough not to matter for E2E paths (turn-
  // budget enforcement at /converse arrives in WO-310.9c; the column
  // is read only by future code).
  const sessionRes = await pool.query(
    `INSERT INTO demo_sessions
       (owner_id, demo_link_id, turn_budget, expires_at)
     VALUES ($1, $2, 1000, now() + interval '1 hour')
     RETURNING id`,
    [DEMO_OWNER_ID, linkRes.rows[0].id]
  );
  return sessionRes.rows[0].id;
}

export async function runConversation(baseUrl, userMessages) {
  const sessionId = await mintDemoSession();
  const cookieHeader = `demo_session=${sessionId}`;

  let conversationId = null;
  const turns = [];
  let lastReply = null;
  let lastStatus = null;

  for (let i = 0; i < userMessages.length; i++) {
    const body = { content: userMessages[i] };
    if (conversationId) body.conversation_id = conversationId;

    const response = await fetch(`${baseUrl}/converse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `[runConversation] turn ${i + 1} HTTP ${response.status}: ${text}`
      );
    }

    const data = await response.json();
    conversationId = data.conversation_id;
    lastReply = data.reply.content;
    lastStatus = data.status;
    turns.push({ user: userMessages[i], reply: lastReply, status: lastStatus });

    if (lastStatus !== 'active') break;
  }

  return { conversationId, turns, lastReply, lastStatus };
}
