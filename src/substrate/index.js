// src/substrate/index.js
// Public entry point for the pattern-in-motion substrate.
// Consumers import from this module; never reach into internal files.
//
// Public hook contract (per reference-implementation-vs-overlay-scoping-document.md v1.0 §4):
//   - subscription mechanism emitting `step_started` / `step_ended` events
//   - each event carries step ID (one of seven states per D-WS1-2) + timestamp
//   - no introspection into intake-triager internals
//
// See ./README.md for the contract spec and consumer orientation.

export { createStateMachine } from './state-machine.js';
export { createEventStream } from './event-stream.js';
export { loadManifest } from './manifest-loader.js';
