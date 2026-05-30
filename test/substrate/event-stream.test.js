// test/substrate/event-stream.test.js
// Unit tests for src/substrate/event-stream.js.
// Covers D-WS1-3 (step_started / step_ended event pairs) and the
// no-host-introspection contract.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { createStateMachine, STATES } from '../../src/substrate/state-machine.js';
import { createEventStream } from '../../src/substrate/event-stream.js';

describe('event-stream', () => {
  it('emits step_started with stepId and timestamp', () => {
    const events = [];
    const stream = createEventStream(createStateMachine());
    stream.subscribe((event) => events.push(event));

    const before = Date.now();
    stream.startStep(STATES.TAKE_THE_ORDER);
    const after = Date.now();

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('step_started');
    expect(events[0].stepId).toBe(STATES.TAKE_THE_ORDER);
    expect(typeof events[0].timestamp).toBe('number');
    expect(events[0].timestamp).toBeGreaterThanOrEqual(before);
    expect(events[0].timestamp).toBeLessThanOrEqual(after);
  });

  it('emits step_ended with stepId and timestamp', () => {
    const events = [];
    const stream = createEventStream(createStateMachine());
    stream.subscribe((event) => events.push(event));

    stream.startStep(STATES.BRIEF_THE_CHEF);
    const before = Date.now();
    stream.endStep(STATES.BRIEF_THE_CHEF);
    const after = Date.now();

    expect(events).toHaveLength(2);
    expect(events[1].type).toBe('step_ended');
    expect(events[1].stepId).toBe(STATES.BRIEF_THE_CHEF);
    expect(typeof events[1].timestamp).toBe('number');
    expect(events[1].timestamp).toBeGreaterThanOrEqual(before);
    expect(events[1].timestamp).toBeLessThanOrEqual(after);
  });

  it('supports multiple subscribers', () => {
    const stream = createEventStream(createStateMachine());
    const eventsA = [];
    const eventsB = [];
    const unsubscribeA = stream.subscribe((event) => eventsA.push(event));
    stream.subscribe((event) => eventsB.push(event));

    stream.startStep(STATES.PLATE_THE_DISH);
    stream.endStep(STATES.PLATE_THE_DISH);

    expect(eventsA).toHaveLength(2);
    expect(eventsB).toHaveLength(2);

    // Unsubscribe A; B should still receive subsequent events.
    unsubscribeA();
    stream.startStep(STATES.READ_THE_TICKET);

    expect(eventsA).toHaveLength(2);
    expect(eventsB).toHaveLength(3);
  });

  it('does not introspect host application internals', () => {
    const sourcePath = fileURLToPath(
      new URL('../../src/substrate/event-stream.js', import.meta.url),
    );
    const source = readFileSync(sourcePath, 'utf-8');

    // No relative imports reaching into host application packages.
    expect(source).not.toMatch(/from\s+['"]\.\.\/(backend|frontend|db)\b/);
    expect(source).not.toMatch(/require\s*\(\s*['"]\.\.\/(backend|frontend|db)\b/);
  });
});
