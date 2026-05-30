// test/substrate/state-machine.test.js
// Unit tests for src/substrate/state-machine.js.
// Covers D-WS1-2 (seven states), D-WS1-4 (set-of-active-steps), D-WS1-5 (idle).

import { describe, it, expect } from 'vitest';
import { createStateMachine, STATES } from '../../src/substrate/state-machine.js';

describe('state-machine', () => {
  it('initial state has only at_the_table active', () => {
    const sm = createStateMachine();
    const active = sm.getActiveSteps();
    expect(active.size).toBe(1);
    expect(active.has(STATES.AT_THE_TABLE)).toBe(true);
    expect(sm.isActive(STATES.AT_THE_TABLE)).toBe(true);
    expect(sm.isActive(STATES.TAKE_THE_ORDER)).toBe(false);
  });

  it('starting a Service step removes at_the_table and adds the step', () => {
    const sm = createStateMachine();
    sm.startStep(STATES.TAKE_THE_ORDER);
    const active = sm.getActiveSteps();
    expect(active.size).toBe(1);
    expect(active.has(STATES.AT_THE_TABLE)).toBe(false);
    expect(active.has(STATES.TAKE_THE_ORDER)).toBe(true);
  });

  it('permits a set of active steps concurrently (D-WS1-4)', () => {
    const sm = createStateMachine();
    sm.startStep(STATES.TAKE_THE_ORDER);
    sm.startStep(STATES.BRIEF_THE_CHEF);
    sm.startStep(STATES.PLATE_THE_DISH);
    const active = sm.getActiveSteps();
    expect(active.size).toBe(3);
    expect(active.has(STATES.TAKE_THE_ORDER)).toBe(true);
    expect(active.has(STATES.BRIEF_THE_CHEF)).toBe(true);
    expect(active.has(STATES.PLATE_THE_DISH)).toBe(true);
    expect(active.has(STATES.AT_THE_TABLE)).toBe(false);
  });

  it('ending the last active Service step returns to at_the_table (D-WS1-5)', () => {
    const sm = createStateMachine();
    sm.startStep(STATES.TAKE_THE_ORDER);
    sm.startStep(STATES.BRIEF_THE_CHEF);
    sm.endStep(STATES.TAKE_THE_ORDER);
    // Still one Service step active — at_the_table stays out.
    expect(sm.getActiveSteps().has(STATES.AT_THE_TABLE)).toBe(false);
    sm.endStep(STATES.BRIEF_THE_CHEF);
    // Now the last Service step ended — at_the_table returns.
    const active = sm.getActiveSteps();
    expect(active.size).toBe(1);
    expect(active.has(STATES.AT_THE_TABLE)).toBe(true);
  });

  it('Step 03 and Step 06 can overlap (D-WS1-4 rationale: Slide 27)', () => {
    const sm = createStateMachine();
    // Plate the dish starts.
    sm.startStep(STATES.PLATE_THE_DISH);
    // Stock the pantry starts before plate ends (the Slide 27 pattern).
    sm.startStep(STATES.STOCK_THE_PANTRY);
    const active = sm.getActiveSteps();
    expect(active.has(STATES.PLATE_THE_DISH)).toBe(true);
    expect(active.has(STATES.STOCK_THE_PANTRY)).toBe(true);
  });

  it('starting an unknown step throws', () => {
    const sm = createStateMachine();
    expect(() => sm.startStep('not_a_real_step')).toThrow(/unknown step id/);
  });

  it('ending a non-active step throws', () => {
    const sm = createStateMachine();
    expect(() => sm.endStep(STATES.TAKE_THE_ORDER)).toThrow(/not currently active/);
  });

  it('starting at_the_table directly throws (it is implicit)', () => {
    const sm = createStateMachine();
    expect(() => sm.startStep(STATES.AT_THE_TABLE)).toThrow(/implicit idle state/);
  });
});
