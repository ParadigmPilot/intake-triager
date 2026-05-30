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
// Event pairing: every step emits `step_started` then `step_ended` (D-WS1-3).
//
// WO-312.2c implements this stub.

export function createStateMachine() {
  throw new Error('Not yet implemented (WO-312.2c)');
}
