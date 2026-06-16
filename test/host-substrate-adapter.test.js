// test/host-substrate-adapter.test.js
// Smoke test for src/frontend/host-substrate-adapter.js (WO-316.1a).
//
// Proves the adapter:
//   - forwards LIVE step_started / step_ended events through subscribe,
//   - returns a working unsubscribe function,
//   - resolves a seven-field host manifest via loadManifest(stepId),
//   - guards against a missing / malformed stream.
//
// Built on the real host substrate (createEventStream(createStateMachine())),
// not a mock — this is an integration-shaped smoke test against host canon.

import { describe, it, expect, vi } from 'vitest';
import { createStateMachine } from '../src/substrate/state-machine.js';
import { createEventStream } from '../src/substrate/event-stream.js';
import { createHostSubstrate } from '../src/frontend/host-substrate-adapter.js';

// The seven D-WS1-6 fields the overlay's renderers consume.
const REQUIRED_FIELDS = [
  'restaurant_label',
  'technology_label',
  'animation_asset',
  'plain_english',
  'in_code',
  'just_finished',
  'up_next',
];

describe('host-substrate-adapter', () => {
  it('forwards live step_started / step_ended events through subscribe', () => {
    const stream = createEventStream(createStateMachine());
    const substrate = createHostSubstrate(stream);
    const spy = vi.fn();
    substrate.subscribe(spy);

    stream.startStep('take_the_order');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toMatchObject({
      type: 'step_started',
      stepId: 'take_the_order',
    });
    expect(typeof spy.mock.calls[0][0].timestamp).toBe('number');

    stream.endStep('take_the_order');
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0]).toMatchObject({
      type: 'step_ended',
      stepId: 'take_the_order',
    });
    expect(typeof spy.mock.calls[1][0].timestamp).toBe('number');
  });

  it('returns an unsubscribe function that detaches the subscriber', () => {
    const stream = createEventStream(createStateMachine());
    const substrate = createHostSubstrate(stream);
    const spy = vi.fn();
    const unsubscribe = substrate.subscribe(spy);

    stream.startStep('take_the_order');
    expect(spy).toHaveBeenCalledTimes(1);

    unsubscribe();
    stream.endStep('take_the_order');
    expect(spy).toHaveBeenCalledTimes(1); // no further delivery after unsubscribe
  });

  it('resolves a seven-field host manifest via loadManifest(stepId)', () => {
    const stream = createEventStream(createStateMachine());
    const substrate = createHostSubstrate(stream);

    const manifest = substrate.loadManifest('take_the_order');
    for (const field of REQUIRED_FIELDS) {
      expect(manifest).toHaveProperty(field);
    }
  });

  it('throws when given no stream or a stream without subscribe', () => {
    expect(() => createHostSubstrate(undefined)).toThrow();
    expect(() => createHostSubstrate({})).toThrow();
  });
});
