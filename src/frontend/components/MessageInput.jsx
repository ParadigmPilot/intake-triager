// The Runner — trigger surface.
//
// Per intake-triager-gold-vision.md v1.5 §4 Restaurant map (line 116),
// the Runner is the fetch() POST associated with this file. In this
// composition, the literal fetch() lives in App.jsx's handleSend (so
// App owns conversation state); MessageInput is the controlled-input
// form that invokes handleSend on submit.
//
// Disabled when terminal (conversation 'complete' or 'escalated' per
// §9) OR when pending (a fetch is in flight). Submit additionally
// requires non-empty trimmed content.
//
// Focus restoration (D31): a disabled input cannot hold focus per the
// HTMLInputElement spec, so the browser blurs the input when pending
// flips true. When pending flips back to false, React reconciles the
// same DOM node but does not restore focus (autoFocus is mount-only).
// The useEffect below refocuses the input on the disabled→enabled
// transition so the user can type the next message without clicking.

import { useState, useEffect, useRef } from 'react';

export default function MessageInput({ onSend, terminal, pending }) {
  const [content, setContent] = useState('');
  const inputRef = useRef(null);

  const disabled = terminal || pending;
  const trimmed = content.trim();
  const canSubmit = !disabled && trimmed.length > 0;

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    onSend(trimmed);
    setContent('');
  }

  const placeholder = terminal
    ? 'Conversation ended.'
    : pending
      ? 'Sending…'
      : 'Tell me what happened.';

  return (
    <form onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus
      />
      <button type="submit" disabled={!canSubmit}>
        Send
      </button>
    </form>
  );
}