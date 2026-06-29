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

// The per-session turn budget is spent — the demo session is used up and a new
// session is the only way forward. Two backend paths report this, both
// unambiguous (neither fires on a transient failure): session-middleware 401s
// with DEMO_SESSION_TERMINAL once terminal_at is set (the normal path —
// pantry-demo's incrementSessionTurns writes terminal_at when turns_used
// reaches turn_budget, never on conversation complete/escalated), and
// cost-protection 403s with TURN_BUDGET_EXCEEDED on the defensive boundary
// before terminal_at is written. Every other non-OK response stays generic.
function isDemoLimitReached(status, code) {
  return (
    (status === 401 && code === 'DEMO_SESSION_TERMINAL') ||
    (status === 403 && code === 'TURN_BUDGET_EXCEEDED')
  );
}

export default function App({
  substrate,
  onTurnSubmitted,
  onTurnResponded,
  onTurnFailed,
  controlsLocked,
  onLockedSend,
  hideLatestAssistant,
  onReset,
  children,
  formClassName = '',
  inputClassName = '',
} = {}) {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [terminal, setTerminal] = useState(false);
  const [terminalReason, setTerminalReason] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  // Distinct terminal state for a spent demo session (WO-317.4d / BL-15) — kept
  // separate from `terminal` (normal conversation end) and `error` (transient):
  // it disables the input and points the user to a fresh session, no retry.
  const [limitReached, setLimitReached] = useState(false);

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
        // A spent demo session is its own terminal state (clear message + a
        // link to a new session, input disabled); every other non-OK response
        // keeps the generic, retry-able error.
        if (isDemoLimitReached(response.status, data?.error?.code)) {
          setLimitReached(true);
        } else {
          setError(data?.error?.message ?? GENERIC_ERROR);
        }
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

  // New-conversation reset (WO-317.4c / BL-14). Clears App's own conversation
  // state, then fires the optional onReset so a composer can clear its host
  // walk state too. onReset is absent on a bare <App /> — the clone still
  // restarts from its own state alone (clone-safe). The next handleSend sees a
  // null conversationId and opens a fresh backend conversation.
  function handleReset() {
    setConversationId(null);
    setMessages([]);
    setTerminal(false);
    setTerminalReason(null);
    setError(null);
    setLimitReached(false);
    setPending(false);
    onReset?.();
  }

  // Composition parts (WO-317.2a). App owns conversation state (gold-vision §4);
  // it exposes its render parts so a composer can place them in its own layout
  // zones — banners + transcript in a scroll region, the input in a pinned
  // footer — without App taking on any layout class itself.
  const banners = (
    <>
      {terminal && (
        <div className="banner banner-status">
          Conversation {terminalReason}.
        </div>
      )}
      {error && <div className="banner banner-error">{error}</div>}
    </>
  );

  const transcript = (
    <Transcript messages={messages} hideLatestAssistant={hideLatestAssistant} />
  );

  const footer = (
    <MessageInput
      onSend={handleSend}
      onNewConversation={handleReset}
      limitReached={limitReached}
      terminal={terminal}
      pending={pending}
      controlsLocked={controlsLocked}
      onLockedSend={onLockedSend}
      formClassName={formClassName}
      inputClassName={inputClassName}
    />
  );

  // Render-prop seam: a function child means a composer owns layout (it places
  // banners / transcript / footer into its zones). The bare clone passes no
  // children and renders the default flat fragment — DOM-identical to the
  // pre-317.2 clone, so the cloneable host stays overlay-free (P-9 / A2).
  if (typeof children === 'function') {
    return children({ banners, transcript, footer });
  }

  return (
    <>
      {banners}
      {transcript}
      {footer}
    </>
  );
}
