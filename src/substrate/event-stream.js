// src/substrate/event-stream.js
// Event stream emitting `step_started` / `step_ended` event pairs per
// station-architecture-scoping-document.md v1.2 D-WS1-3 + D-WS1-4.
//
// Event shape:
//   { type: 'step_started' | 'step_ended', stepId: <one of seven>, timestamp: <ms epoch> }
//
// Wraps a state machine (from ./state-machine.js). The wrapped facade exposes
// startStep / endStep that update the underlying state machine and emit a
// corresponding event on success. Subscribers register via subscribe(callback)
// and receive every emitted event. subscribe returns an unsubscribe function.
//
// Emission ordering: state machine update first, event emission second. If the
// underlying state machine throws (e.g., starting an already-active step), no
// event is emitted and the error propagates. This preserves the invariant that
// every emitted event corresponds to a successful state transition.
//
// No introspection into intake-triager. This module imports only from
// ./state-machine.js (and nothing from ../backend, ../frontend, or ../db).

/**
 * Event emitted by {@link EventStream} on every successful state transition.
 * Per `reference-implementation-vs-overlay-scoping-document.md` v1.0 §4 and
 * `station-architecture-scoping-document.md` v1.2 D-WS1-3.
 *
 * @typedef {Object} StepEvent
 * @property {'step_started' | 'step_ended'} type - The transition kind.
 * @property {string} stepId - One of the seven step IDs (see STATES in state-machine.js).
 * @property {number} timestamp - Milliseconds since the Unix epoch at emission time.
 */

/**
 * Facade object returned by {@link createEventStream}. Wraps a state machine
 * with event emission and a subscription mechanism.
 *
 * @typedef {Object} EventStream
 * @property {(stepId: string) => void} startStep - Begin a Service step. Updates the underlying state machine first; emits a `step_started` {@link StepEvent} on success. If the state machine throws, no event is emitted and the error propagates.
 * @property {(stepId: string) => void} endStep - End a Service step. Updates the underlying state machine first; emits a `step_ended` {@link StepEvent} on success. Same error semantics as startStep.
 * @property {(callback: (event: StepEvent) => void) => (() => void)} subscribe - Register a callback for every emitted event. Returns an unsubscribe function; call it to detach (well-suited as a React `useEffect` cleanup).
 */

/**
 * Constructs an event stream that wraps a state machine with `step_started`
 * and `step_ended` event emission per the classifier-to-renderer protocol.
 *
 * Emission ordering: the underlying state machine is updated first, the
 * corresponding event is emitted second. This preserves the invariant that
 * every emitted event corresponds to a successful state transition.
 *
 * No introspection into intake-triager internals. The four exports of this
 * package are the entire public surface.
 *
 * @param {import('./state-machine.js').StateMachine} stateMachine - The state machine to wrap.
 * @returns {EventStream} A frozen facade exposing the public surface.
 * @throws {Error} If `stateMachine` is missing or does not expose `startStep` and `endStep` methods.
 * @throws {Error} If `subscribe` is called with a non-function callback.
 *
 * @see ./HOOK_CONTRACT.md
 */
export function createEventStream(stateMachine) {
  if (
    !stateMachine ||
    typeof stateMachine.startStep !== 'function' ||
    typeof stateMachine.endStep !== 'function'
  ) {
    throw new Error(
      'createEventStream: requires a state machine with startStep and endStep methods',
    );
  }

  const subscribers = new Set();

  function emit(event) {
    for (const callback of subscribers) {
      callback(event);
    }
  }

  function startStep(stepId) {
    stateMachine.startStep(stepId);
    emit({ type: 'step_started', stepId, timestamp: Date.now() });
  }

  function endStep(stepId) {
    stateMachine.endStep(stepId);
    emit({ type: 'step_ended', stepId, timestamp: Date.now() });
  }

  function subscribe(callback) {
    if (typeof callback !== 'function') {
      throw new Error('subscribe: callback must be a function');
    }
    subscribers.add(callback);
    return function unsubscribe() {
      subscribers.delete(callback);
    };
  }

  return Object.freeze({
    startStep,
    endStep,
    subscribe,
  });
}
