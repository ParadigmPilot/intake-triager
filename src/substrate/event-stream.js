// src/substrate/event-stream.js
// Event stream emitting `step_started` / `step_ended` event pairs per
// station-architecture-scoping-document.md v1.2 D-WS1-3 + D-WS1-4.
//
// Event shape:
//   { type: 'step_started' | 'step_ended', stepId: <one of seven>, timestamp: <ms epoch> }
//
// Subscribers consume the stream via the public hook contract surface
// (see ./index.js and ./README.md). No introspection into intake-triager.
//
// Implementation deferred to a later WO in OBJ-2 component #1.

export function createEventStream() {
  throw new Error('Not yet implemented');
}
