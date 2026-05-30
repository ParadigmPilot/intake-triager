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
