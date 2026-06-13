// The Dining Room — message rendering.
//
// Per intake-triager-gold-vision.md v1.5:
//   §4 Restaurant map  — Transcript.jsx is part of the Dining Room
//   §10 item 4         — output sanitization is React's default escaping;
//                        no dangerouslySetInnerHTML anywhere in this file
//
// Pure presentational. Receives a messages array; iterates; renders.
// No state, no effects, no fetch.

const ROLE_LABEL = {
  user: 'You',
  assistant: 'Taylor',
};

export default function Transcript({ messages, hideLatestAssistant = false }) {
  // During a Manual pattern-in-motion walk, the just-arrived assistant reply
  // is withheld from the transcript until the visitor reaches Step 05, where
  // the overlay shows the prose (D-WS2-13). The composition asserts
  // `hideLatestAssistant` for that window; the reply joins history when it
  // clears. Generic + dormant — the pure clone never sets it.
  const lastIndex = messages.length - 1;
  const visible =
    hideLatestAssistant &&
    lastIndex >= 0 &&
    messages[lastIndex].role === 'assistant'
      ? messages.slice(0, lastIndex)
      : messages;

  return (
    <div className="transcript">
      {visible.map((message, index) => (
        <div
          key={index}
          className={`message message-${message.role}`}
        >
          <div className="message-role">
            {ROLE_LABEL[message.role] ?? message.role}
          </div>
          <div className="message-content">{message.content}</div>
        </div>
      ))}
    </div>
  );
}
