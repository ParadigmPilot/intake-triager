// test/substrate/manifest-loader.test.js
// Unit tests for src/substrate/manifest-loader.js.
// Covers D-WS1-6 (seven-field manifest schema) — structural validation only.

import { describe, it, expect } from 'vitest';
import { loadManifest } from '../../src/substrate/manifest-loader.js';
import { STATES } from '../../src/substrate/state-machine.js';
import { manifests } from '../../src/substrate/manifests/index.js';

// Minimal valid manifest fixture — all seven D-WS1-6 fields present.
// Content values are illustrative; structural validation is the only contract
// this loader enforces (see scoping-doc §5.1 for content rules — out of scope
// for this WO).
function fixtureManifest(overrides = {}) {
  return {
    restaurant_label: 'Take the order',
    technology_label: 'Receive user input',
    animation_asset: 'take_the_order.svg',
    plain_english: 'The waiter takes the customer\'s order.',
    in_code: 'Capture the incoming message.',
    just_finished: 'The order was placed.',
    up_next: 'Brief the chef on what to cook for the customer.',
    ...overrides,
  };
}

describe('manifest-loader', () => {
  it('resolves the seven-field shape for a known stepId', () => {
    const manifests = {
      take_the_order: fixtureManifest(),
    };
    const result = loadManifest('take_the_order', manifests);

    // All seven D-WS1-6 fields round-trip.
    expect(result.restaurant_label).toBe('Take the order');
    expect(result.technology_label).toBe('Receive user input');
    expect(result.animation_asset).toBe('take_the_order.svg');
    expect(result.plain_english).toBe(
      'The waiter takes the customer\'s order.',
    );
    expect(result.in_code).toBe('Capture the incoming message.');
    expect(result.just_finished).toBe('The order was placed.');
    expect(result.up_next).toBe(
      'Brief the chef on what to cook for the customer.',
    );

    // Returned manifest is frozen — downstream consumers cannot mutate it.
    expect(Object.isFrozen(result)).toBe(true);
  });

  it('throws an actionable error for an unknown stepId', () => {
    const manifests = {
      take_the_order: fixtureManifest(),
    };

    expect(() => loadManifest('not_a_real_step', manifests)).toThrow(
      /unknown stepId "not_a_real_step"/,
    );
    // Error names the available stepIds for actionability.
    expect(() => loadManifest('not_a_real_step', manifests)).toThrow(
      /Available: take_the_order/,
    );
  });

  it('throws an actionable error when a required field is missing', () => {
    // Omit `up_next` from the fixture.
    const incomplete = fixtureManifest();
    delete incomplete.up_next;
    const manifests = { take_the_order: incomplete };

    expect(() => loadManifest('take_the_order', manifests)).toThrow(
      /missing required field/,
    );
    // Error names the specific missing field for actionability.
    expect(() => loadManifest('take_the_order', manifests)).toThrow(/up_next/);
  });
});

describe('manifest-loader: seven canonical states', () => {
  const requiredFields = [
    'restaurant_label',
    'technology_label',
    'animation_asset',
    'plain_english',
    'in_code',
    'just_finished',
    'up_next',
  ];

  for (const stateId of Object.values(STATES)) {
    it(`loads manifest for "${stateId}" with all seven required fields`, () => {
      const manifest = loadManifest(stateId, manifests);
      for (const field of requiredFields) {
        expect(manifest).toHaveProperty(field);
      }
    });
  }
});
