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

export default function Transcript({ messages }) {
  return (
    <div className="transcript">
      {messages.map((message, index) => (
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
