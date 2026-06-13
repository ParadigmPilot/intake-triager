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
// BACKEND_URL is a relative path. In production (Express serves the built
// SPA + API from one origin per WO-310.8a), this resolves to same-origin
// — no CORS preflight on the hot path. In development (Vite at :5173 +
// Express at :3000), vite.config.js server.proxy routes /converse to the
// Express port (WO-310.8c).

import { useState, useRef } from 'react';
import Transcript from './Transcript.jsx';
import MessageInput from './MessageInput.jsx';
import { createStateMachine, createEventStream } from '../../substrate/index.js';

const BACKEND_URL = '/converse';
const GENERIC_ERROR = 'we had a problem recording this — please try again';

export default function App({
  substrate,
  onTurnSubmitted,
  onTurnResponded,
  onTurnFailed,
  controlsLocked,
  onLockedSend,
  hideLatestAssistant,
} = {}) {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [terminal, setTerminal] = useState(false);
  const [terminalReason, setTerminalReason] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  // Pattern-in-Motion substrate (WO-315.3a). App owns its substrate event
  // stream — injected by mountApp, or self-constructed for a bare <App />
  // (clone-safe). Constructed once via the lazy-ref pattern so it survives
  // re-renders and StrictMode. Held here for the turn-driver (successor WO)
  // to advance; exposed to the overlay only via mountApp's return at the
  // hopper publish layer. intake-triager never imports the overlay.
  const substrateRef = useRef(null);
  if (substrateRef.current === null) {
    substrateRef.current = substrate ?? createEventStream(createStateMachine());
  }

  async function handleSend(content) {
    // Optimistic append — the server inserts the user row before any
    // error gate, so optimistic state matches server state even on 4xx/5xx.
    setMessages((prev) => [...prev, { role: 'user', content }]);
    setPending(true);
    setError(null);

    // Generic lifecycle announcement (WO-315.3b): the turn has begun. A
    // composition (overlay side) starts the pattern-in-motion walk from
    // here. No-op when no consumer is attached (pure clone). intake-triager
    // knows nothing of the overlay, the gate, or the six Service steps.
    onTurnSubmitted?.();

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
        onTurnFailed?.();
        return;
      }

      setConversationId(data.conversation_id);
      setMessages((prev) => [...prev, data.reply]);

      // The reply prose for the Step-05 overlay→prose swap. The substrate
      // event stream is sealed to events-only (A2 contract carries no
      // payload), so the prose is announced out of band, here.
      onTurnResponded?.(data.reply.content);

      if (data.status === 'complete' || data.status === 'escalated') {
        setTerminal(true);
        setTerminalReason(data.status);
      }
    } catch {
      setError(GENERIC_ERROR);
      onTurnFailed?.();
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
      <Transcript messages={messages} hideLatestAssistant={hideLatestAssistant} />
      <MessageInput
        onSend={handleSend}
        terminal={terminal}
        pending={pending}
        controlsLocked={controlsLocked}
        onLockedSend={onLockedSend}
      />
    </>
  );
}
