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

export async function runConversation(baseUrl, userMessages) {
  let conversationId = null;
  const turns = [];
  let lastReply = null;
  let lastStatus = null;

  for (let i = 0; i < userMessages.length; i++) {
    const body = { content: userMessages[i] };
    if (conversationId) body.conversation_id = conversationId;

    const response = await fetch(`${baseUrl}/converse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
