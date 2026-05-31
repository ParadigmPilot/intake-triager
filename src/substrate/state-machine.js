// src/substrate/state-machine.js
// Seven-state machine per station-architecture-scoping-document.md v1.2 D-WS1-2.
//
// States (six Service steps + at_the_table idle):
//   - at_the_table          (idle; initial; returned-to after Step 06)
//   - take_the_order        (Step 01)
//   - brief_the_chef        (Step 02)
//   - plate_the_dish        (Step 03)
//   - read_the_ticket       (Step 04)
//   - serve_by_type         (Step 05)
//   - stock_the_pantry      (Step 06)
//
// Concurrency: set-of-active-steps (D-WS1-4), not single-active-step.
// Event pairing: every step starts then ends (D-WS1-3). Event EMISSION is
// the responsibility of ./event-stream.js (next WO); this module only tracks
// the active set.

/**
 * Facade object returned by {@link createStateMachine}.
 *
 * @typedef {Object} StateMachine
 * @property {(stepId: string) => void} startStep - Begin a Service step. Adds stepId to the active set. Removes 'at_the_table' if it was present.
 * @property {(stepId: string) => void} endStep - End a Service step. Removes stepId from the active set. Restores 'at_the_table' when no Service steps remain active.
 * @property {() => Set<string>} getActiveSteps - Returns a frozen snapshot of the currently active step IDs.
 * @property {(stepId: string) => boolean} isActive - True if the given stepId is in the active set.
 * @property {() => void} reset - Returns the machine to the initial state (only 'at_the_table' active).
 */

/**
 * The canonical seven-state set: six Service steps plus the `at_the_table`
 * idle/initial state. Frozen at module load.
 *
 * @see ./HOOK_CONTRACT.md
 */
export const STATES = Object.freeze({
  AT_THE_TABLE:     'at_the_table',
  TAKE_THE_ORDER:   'take_the_order',
  BRIEF_THE_CHEF:   'brief_the_chef',
  PLATE_THE_DISH:   'plate_the_dish',
  READ_THE_TICKET:  'read_the_ticket',
  SERVE_BY_TYPE:    'serve_by_type',
  STOCK_THE_PANTRY: 'stock_the_pantry',
});

const ALL_STATE_IDS = Object.freeze(new Set(Object.values(STATES)));
const SERVICE_STEP_IDS = Object.freeze(
  new Set(Object.values(STATES).filter((id) => id !== STATES.AT_THE_TABLE)),
);

function frozenSet(source) {
  const s = new Set(source);
  s.add = () => { throw new Error('frozen Set: add() not permitted'); };
  s.delete = () => { throw new Error('frozen Set: delete() not permitted'); };
  s.clear = () => { throw new Error('frozen Set: clear() not permitted'); };
  return Object.freeze(s);
}

/**
 * Constructs a new state machine instance tracking the set of currently
 * active Service steps. Initial active set: only `at_the_table`.
 *
 * Concurrency model: set-of-active-steps (D-WS1-4). Multiple Service steps
 * may be active simultaneously. Event emission is the responsibility of
 * {@link createEventStream}; this module only tracks state.
 *
 * @returns {StateMachine} A frozen facade exposing the public surface.
 * @throws {Error} If startStep is called for an unknown step ID, an
 *   already-active step ID, or 'at_the_table' (which is implicit-idle, not
 *   a step that can be started).
 * @throws {Error} If endStep is called for an unknown step ID, an inactive
 *   step ID, or 'at_the_table'.
 *
 * @see ./HOOK_CONTRACT.md
 */
export function createStateMachine() {
  // Initial active set: only at_the_table (D-WS1-5).
  let active = new Set([STATES.AT_THE_TABLE]);

  function assertKnownStep(stepId) {
    if (!ALL_STATE_IDS.has(stepId)) {
      throw new Error(
        `state-machine: unknown step id "${stepId}". ` +
        `Valid: ${[...ALL_STATE_IDS].join(', ')}`,
      );
    }
  }

  function assertServiceStep(stepId, op) {
    if (stepId === STATES.AT_THE_TABLE) {
      throw new Error(
        `state-machine: ${op}('at_the_table') is not permitted. ` +
        `at_the_table is the implicit idle state (D-WS1-5).`,
      );
    }
  }

  function startStep(stepId) {
    assertKnownStep(stepId);
    assertServiceStep(stepId, 'startStep');
    if (active.has(stepId)) {
      throw new Error(
        `state-machine: step "${stepId}" is already active. ` +
        `Call endStep first or check isActive() before starting.`,
      );
    }
    // Any Service step starting removes at_the_table from the active set.
    if (active.has(STATES.AT_THE_TABLE)) {
      active.delete(STATES.AT_THE_TABLE);
    }
    active.add(stepId);
  }

  function endStep(stepId) {
    assertKnownStep(stepId);
    assertServiceStep(stepId, 'endStep');
    if (!active.has(stepId)) {
      throw new Error(
        `state-machine: step "${stepId}" is not currently active. ` +
        `Call startStep first or check isActive() before ending.`,
      );
    }
    active.delete(stepId);
    // When all Service steps have ended, return to at_the_table (D-WS1-5).
    const anyServiceStillActive = [...active].some((id) =>
      SERVICE_STEP_IDS.has(id),
    );
    if (!anyServiceStillActive) {
      active.add(STATES.AT_THE_TABLE);
    }
  }

  function getActiveSteps() {
    return frozenSet(active);
  }

  function isActive(stepId) {
    assertKnownStep(stepId);
    return active.has(stepId);
  }

  function reset() {
    active = new Set([STATES.AT_THE_TABLE]);
  }

  return Object.freeze({
    startStep,
    endStep,
    getActiveSteps,
    isActive,
    reset,
  });
}
