// Prompt-injection hygiene — user-text isolation.
//
// Per intake-triager-gold-vision.md v1.5 §10 item 5:
//   "Prompt-injection hygiene — user text isolated from system
//    instructions; Taylor never acts on the Patron's behalf without
//    explicit confirmation handlers."
//
// This module covers the first clause: structural isolation of user text
// before it is sent to the Chef. The second clause (Taylor's behavior) is
// enforced at the prompt level by system.md's [RULES] section.
//
// Strategy. Wrap user-role messages in a static <user_message>...
// </user_message> envelope before they are passed to the Briefing. The
// wrapper signals to Claude that the wrapped content is data, not
// instructions. Defensive neutralization replaces any literal close-tag
// inside the content to prevent envelope escape.
//
// Storage. Pantry stores raw user content. The wrap is applied at
// transport time between pantry.loadMessages and Briefing.assemblePrompt
// (Phase 6 wiring). The DB remains ground-truth raw.
//
// Canon. Wrapper syntax is canon-silent — see build-discovery D7.

const OPEN_TAG = '<user_message>';
const CLOSE_TAG = '</user_message>';
const NEUTRALIZED_CLOSE_TAG = '&lt;/user_message&gt;';

export function isolateUserContent(content) {
  const text = String(content);
  const safe = text.replaceAll(CLOSE_TAG, NEUTRALIZED_CLOSE_TAG);
  return `${OPEN_TAG}\n${safe}\n${CLOSE_TAG}`;
}

export function isolateHistory(history) {
  return history.map((msg) =>
    msg.role === 'user'
      ? { ...msg, content: isolateUserContent(msg.content) }
      : msg
  );
}

export default { isolateUserContent, isolateHistory };
