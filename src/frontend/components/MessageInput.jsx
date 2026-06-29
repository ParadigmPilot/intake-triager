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

export default function MessageInput({
  onSend,
  onNewConversation,
  limitReached = false,
  terminal,
  pending,
  controlsLocked = false,
  onLockedSend,
  formClassName = '',
  inputClassName = '',
}) {
  const [content, setContent] = useState('');
  const inputRef = useRef(null);
  const advanceRef = useRef(null);

  // The text field is frozen while a turn is in progress (terminal /
  // pending / a composition-driven control lock). `controlsLocked` is the
  // generic lock the pattern-in-motion composition asserts during the walk
  // (WO-315.3b) — overlay-agnostic; the pure clone never sets it.
  const fieldDisabled = terminal || pending || controlsLocked;
  const trimmed = content.trim();
  const canSubmit = !fieldDisabled && trimmed.length > 0;

  useEffect(() => {
    if (!fieldDisabled) inputRef.current?.focus();
  }, [fieldDisabled]);

  // Keyboard advance (WO-316.2c): when the composition locks the controls for
  // the walk, move focus to the Send control so it advances on Enter — the
  // learner walks steps 02-06 without the mouse. The input is disabled while
  // locked (it cannot hold focus), so focus would otherwise fall to <body> and
  // Enter would do nothing. The unlock side (refocus the input when the lock
  // clears) is the effect above. The pure clone never sets controlsLocked, so
  // this is inert there.
  useEffect(() => {
    if (controlsLocked) advanceRef.current?.focus();
  }, [controlsLocked]);

  function handleSubmit(event) {
    event.preventDefault();
    // While locked, the single Send control advances rather than submits
    // (Send-only surface, D-WS2-23). MessageInput does not know what
    // "advance" means — it reports the locked Send press, and the
    // composition maps it (manual: step; automatic: play). Generic seam.
    if (controlsLocked) {
      onLockedSend?.();
      return;
    }
    if (!canSubmit) return;
    onSend(trimmed);
    setContent('');
  }

  // Demo session spent (WO-317.4d / BL-15; prominence WO-317.4e / BL-16): the
  // per-session turn budget is exhausted, so retrying is futile and the BL-14
  // "New conversation" button (which reuses the same spent session) would be a
  // dead end. Render a prominent amber callout — bold title, one explanatory
  // line, and a button-styled link to a fresh session — in the pinned footer
  // slot so it stays in view (the redundant top banner is removed). Highest
  // precedence: a spent budget is terminal regardless of walk/terminal state.
  if (limitReached) {
    return (
      <form onSubmit={handleSubmit} className={formClassName || undefined}>
        <div className="demo-limit">
          <p className="demo-limit__title">Demo limit reached</p>
          <p className="demo-limit__body">
            You’ve used all the turns in this demo session — start a new one to
            keep exploring.
          </p>
          <a
            className="demo-limit__action"
            href="https://restaurantpattern.com/demo"
          >
            Start a new session
          </a>
        </div>
      </form>
    );
  }

  // Terminal, walk complete (controls unlocked): the conversation is over, so
  // the dead disabled input is replaced by a single "New conversation" button
  // that restarts the host (WO-317.4c / BL-14). controlsLocked is checked first
  // so the final turn's walk still shows the advance button — the walk finishes
  // before the reset is offered. The button is classless, reusing the Send
  // button's styling (no new token); type="button" so it never submits the
  // form. onNewConversation is optional-guarded (App always wires handleReset).
  if (terminal && !controlsLocked) {
    return (
      <form onSubmit={handleSubmit} className={formClassName || undefined}>
        <button type="button" onClick={() => onNewConversation?.()}>
          New conversation
        </button>
      </form>
    );
  }

  const placeholder = terminal
    ? 'Conversation ended.'
    : pending
      ? 'Sending…'
      : controlsLocked
        ? 'Input locked.'
        : 'Tell me what happened.';

  return (
    <form onSubmit={handleSubmit} className={formClassName || undefined}>
      {!controlsLocked && (
        <input
          ref={inputRef}
          type="text"
          className={inputClassName || undefined}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={placeholder}
          disabled={fieldDisabled}
          autoFocus
        />
      )}
      <button
        ref={advanceRef}
        type="submit"
        disabled={controlsLocked ? false : !canSubmit}
      >
        {controlsLocked ? 'Next Step' : 'Send'}
      </button>
    </form>
  );
}