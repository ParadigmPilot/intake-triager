// The Pattern-in-Motion composition seam (WO-315.3a).
//
// Constructs intake-triager's OWN substrate (state machine + event stream),
// injects the stream into the Dining Room (App), mounts, and RETURNS the
// stream so an external composer (the hopper publish layer, or any third-party
// demo) can subscribe the overlay to it.
//
// Contract-only handover: the returned value is the frozen EventStream facade
// (subscribe / startStep / endStep) per CONTRACT.md + SIGNATURES.md. No
// intake-triager internals are exposed. intake-triager NEVER imports the
// overlay — composition lives entirely on the consumer's side of the A2
// contract (P-9: cloneable source stays overlay-free).
//
// The substrate is constructed here (once, outside React), so StrictMode's
// double-invocation in development does not double-construct it.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App.jsx';
import { createStateMachine, createEventStream } from '../substrate/index.js';

/**
 * Mount the Intake Triager Dining Room with its own substrate and return the
 * substrate's event stream for external composition.
 *
 * @param {HTMLElement} rootElement - The DOM node to mount into.
 * @returns {import('../substrate/event-stream.js').EventStream} The frozen
 *   event-stream facade (subscribe / startStep / endStep). Contract-only.
 */
export function mountApp(rootElement) {
  const stream = createEventStream(createStateMachine());

  createRoot(rootElement).render(
    <StrictMode>
      <App substrate={stream} />
    </StrictMode>
  );

  return stream;
}
