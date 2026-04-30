// The Dining Room — root component.
//
// Per intake-triager-gold-vision.md v1.5:
//   §4 Restaurant map     — App.jsx + Transcript.jsx render the Dining Room
//   §4 HTTP API contract  — POST /converse request/response shapes
//   §6 Behavior contract  — crisis-end "may" disable input; we do NOT
//                           detect crisis-end here (status stays 'active'
//                           on crisis; Taylor's [RULES] refuses further
//                           turns at the prompt level)
//   §9 Status transitions — terminal states are 'complete' and 'escalated'
//   §10 item 4            — React's default escaping handles all rendering
//
// BACKEND_URL is hardcoded for the teaching artifact. In production, this
// would come from a Vite env var (VITE_BACKEND_URL) or be eliminated by
// reverse-proxying the API behind the same origin.

import { useState } from 'react';
import Transcript from './Transcript.jsx';
import MessageInput from './MessageInput.jsx';

const BACKEND_URL = 'http://localhost:3000/converse';
const GENERIC_ERROR = 'we had a problem recording this — please try again';

export default function App() {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [terminal, setTerminal] = useState(false);
  const [terminalReason, setTerminalReason] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  async function handleSend(content) {
    // Optimistic append — the server inserts the user row before any
    // error gate, so optimistic state matches server state even on 4xx/5xx.
    setMessages((prev) => [...prev, { role: 'user', content }]);
    setPending(true);
    setError(null);

    const body = conversationId
      ? { conversation_id: conversationId, content }
      : { content };

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error?.message ?? GENERIC_ERROR);
        return;
      }

      setConversationId(data.conversation_id);
      setMessages((prev) => [...prev, data.reply]);

      if (data.status === 'complete' || data.status === 'escalated') {
        setTerminal(true);
        setTerminalReason(data.status);
      }
    } catch {
      setError(GENERIC_ERROR);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {terminal && (
        <div className="banner banner-status">
          Conversation {terminalReason}.
        </div>
      )}
      {error && <div className="banner banner-error">{error}</div>}
      <Transcript messages={messages} />
      <MessageInput onSend={handleSend} terminal={terminal} pending={pending} />
    </>
  );
}
