// test/substrate/content-validator.test.js
// Unit tests for src/substrate/content-validator.js.
// Covers §5.1 content rules — advisory diagnostics surface.
//
// Scope (WO-312.5a):
//   IMPLEMENTED tests: argument validation; Order/Turn dual-frame;
//     up_next verb-shape; canonical-manifests smoke test.
//   PENDING tests (it.todo): frame-sealing; in_code operations-not-frameworks.
//     These two rules require vocabulary-canon artifacts not yet authored
//     as locked specs. A successor WO fills them once the canon is ratified.

import { describe, it, expect } from 'vitest';
import { validateContent } from '../../src/substrate/content-validator.js';
import { STATES } from '../../src/substrate/state-machine.js';
import { manifests } from '../../src/substrate/manifests/index.js';

// Minimal clean manifest fixture — passes both implemented rules.
function cleanManifest(overrides = {}) {
  return {
    restaurant_label: 'Take the order',
    technology_label: 'Send the request',
    animation_asset: null,
    plain_english: 'The Runner carries your order to the Pass.',
    in_code: 'POST /converse over HTTPS to the Pass',
    just_finished: '← Just finished: Contemplating order',
    up_next:
      'Next: Brief the Chef — the Expediter prepares a briefing.',
    ...overrides,
  };
}

describe('validateContent — argument validation', () => {
  it('throws TypeError when manifest is null', () => {
    expect(() => validateContent(null, 'take_the_order')).toThrow(TypeError);
  });

  it('throws TypeError when manifest is an array', () => {
    expect(() => validateContent([], 'take_the_order')).toThrow(TypeError);
  });

  it('throws TypeError when manifest is a non-object primitive', () => {
    expect(() => validateContent('not a manifest', 'take_the_order')).toThrow(
      TypeError,
    );
  });

  it('throws TypeError when stepId is missing', () => {
    expect(() => validateContent(cleanManifest())).toThrow(TypeError);
  });

  it('throws TypeError when stepId is an empty string', () => {
    expect(() => validateContent(cleanManifest(), '')).toThrow(TypeError);
  });
});

describe('validateContent — Order/Turn dual-frame rule', () => {
  it('flags "turn" in a Restaurant-frame field (restaurant_label)', () => {
    const m = cleanManifest({ restaurant_label: 'Wait for your turn' });
    const diagnostics = validateContent(m, 'at_the_table');
    const orderTurnDiagnostics = diagnostics.filter(
      (d) => d.rule === 'order-turn-dual-frame',
    );
    expect(orderTurnDiagnostics).toHaveLength(1);
    expect(orderTurnDiagnostics[0].field).toBe('restaurant_label');
    expect(orderTurnDiagnostics[0].stepId).toBe('at_the_table');
  });

  it('flags "turn" in a Restaurant-frame field (just_finished)', () => {
    const m = cleanManifest({ just_finished: '← The last turn' });
    const diagnostics = validateContent(m, 'take_the_order');
    expect(
      diagnostics.some(
        (d) =>
          d.rule === 'order-turn-dual-frame' && d.field === 'just_finished',
      ),
    ).toBe(true);
  });

  it('flags "order" in a technology-frame field (technology_label)', () => {
    const m = cleanManifest({ technology_label: 'Send the order' });
    const diagnostics = validateContent(m, 'take_the_order');
    const orderTurnDiagnostics = diagnostics.filter(
      (d) => d.rule === 'order-turn-dual-frame',
    );
    expect(orderTurnDiagnostics).toHaveLength(1);
    expect(orderTurnDiagnostics[0].field).toBe('technology_label');
  });

  it('flags "order" in a technology-frame field (in_code)', () => {
    const m = cleanManifest({ in_code: 'Persist the order to the database' });
    const diagnostics = validateContent(m, 'stock_the_pantry');
    expect(
      diagnostics.some(
        (d) => d.rule === 'order-turn-dual-frame' && d.field === 'in_code',
      ),
    ).toBe(true);
  });

  it('does NOT flag plain_english as a Restaurant-frame field (it is a bridge field)', () => {
    const m = cleanManifest({
      plain_english:
        "The waiter takes your order; the backend posts the turn to the API.",
    });
    const diagnostics = validateContent(m, 'take_the_order');
    expect(
      diagnostics.filter((d) => d.rule === 'order-turn-dual-frame'),
    ).toHaveLength(0);
  });

  it('matches "turn" case-insensitively', () => {
    const m = cleanManifest({ restaurant_label: 'Wait Your TURN' });
    const diagnostics = validateContent(m, 'at_the_table');
    expect(
      diagnostics.some((d) => d.rule === 'order-turn-dual-frame'),
    ).toBe(true);
  });

  it('respects word boundaries (does NOT flag "turnover" or "ordering")', () => {
    const m = cleanManifest({
      restaurant_label: 'High turnover at the bar',
      technology_label: 'Ordering operations',
    });
    const diagnostics = validateContent(m, 'at_the_table');
    expect(
      diagnostics.filter((d) => d.rule === 'order-turn-dual-frame'),
    ).toHaveLength(0);
  });
});

describe('validateContent — up_next verb-shape rule', () => {
  it('accepts the canonical "Next: <Verb> ... — ..." form', () => {
    const m = cleanManifest({
      up_next:
        'Next: Take the order — your order travels to the Pass.',
    });
    const diagnostics = validateContent(m, 'at_the_table');
    expect(
      diagnostics.filter((d) => d.rule === 'up-next-verb-shape'),
    ).toHaveLength(0);
  });

  it('accepts all six action-state imperative verbs', () => {
    const verbs = ['Take', 'Brief', 'Plate', 'Read', 'Serve', 'Stock'];
    for (const verb of verbs) {
      const m = cleanManifest({
        up_next: `Next: ${verb} the thing — because reasons.`,
      });
      const diagnostics = validateContent(m, 'test_state');
      expect(
        diagnostics.filter((d) => d.rule === 'up-next-verb-shape'),
      ).toHaveLength(0);
    }
  });

  it('accepts the idle-state gerund "Contemplating"', () => {
    const m = cleanManifest({
      up_next:
        'Next: Contemplating order — the table awaits the next order.',
    });
    const diagnostics = validateContent(m, 'stock_the_pantry');
    expect(
      diagnostics.filter((d) => d.rule === 'up-next-verb-shape'),
    ).toHaveLength(0);
  });

  it('flags up_next missing the "Next:" prefix', () => {
    const m = cleanManifest({
      up_next: 'Take the order — your order travels to the Pass.',
    });
    const diagnostics = validateContent(m, 'at_the_table');
    expect(
      diagnostics.some((d) => d.rule === 'up-next-verb-shape'),
    ).toBe(true);
  });

  it('flags up_next using a disallowed verb', () => {
    const m = cleanManifest({
      up_next: 'Next: Process the order — something happens.',
    });
    const diagnostics = validateContent(m, 'at_the_table');
    expect(
      diagnostics.some((d) => d.rule === 'up-next-verb-shape'),
    ).toBe(true);
  });

  it('flags up_next missing the em-dash separator', () => {
    const m = cleanManifest({
      up_next: 'Next: Take the order, then go to the Pass.',
    });
    const diagnostics = validateContent(m, 'at_the_table');
    const emDashDiagnostics = diagnostics.filter(
      (d) =>
        d.rule === 'up-next-verb-shape' && /em-dash/.test(d.message),
    );
    expect(emDashDiagnostics).toHaveLength(1);
  });
});

describe('validateContent — frame-sealing rule', () => {
  it.todo(
    'flags frame-foreign vocabulary per §5.1 — pending vocabulary canon (Restaurant-frame allowlist + technology-frame allowlist + deck-canon elevation list); successor WO',
  );
});

describe('validateContent — in_code operations-not-frameworks rule', () => {
  it.todo(
    'flags framework names in in_code per §5.1 — pending vocabulary canon (framework denylist); successor WO',
  );
});

describe('validateContent — canonical-manifests smoke test', () => {
  for (const stateId of Object.values(STATES)) {
    it(`returns no diagnostics for the canonical "${stateId}" manifest`, () => {
      const manifest = manifests[stateId];
      const diagnostics = validateContent(manifest, stateId);
      expect(diagnostics).toEqual([]);
    });
  }
});
