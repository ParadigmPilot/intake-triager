// src/substrate/content-validator.js
// Per-state manifest content validator enforcing §5.1 rules per
// station-architecture-scoping-document.md v1.2.
//
// Advisory: returns diagnostics; does NOT throw on content violations.
// TypeError is reserved for argument-shape errors (programmer errors).
//
// Scope (WO-312.5a):
//   IMPLEMENTED:
//     - Order/Turn dual-frame rule
//     - up_next verb-shape rule (verb + em-dash separator)
//   PENDING (vocabulary canon not yet authored — successor WO):
//     - frame-sealing rule (requires Restaurant-frame + technology-frame
//       allowlists + deck-canon elevation list)
//     - in_code operations-not-frameworks rule (requires framework denylist)
//
// Diagnostic shape: { rule, stepId, field, message }
//   - rule:    short identifier (e.g., 'order-turn-dual-frame')
//   - stepId:  the manifest's stepId (passed in by caller)
//   - field:   the manifest field where the violation was found
//   - message: human-readable description of the violation
//
// Empty array = clean. Non-empty array = one or more violations.

// Restaurant-frame fields: forbid the technology-frame word "turn" (§5.1).
const RESTAURANT_FRAME_FIELDS = Object.freeze([
  'restaurant_label',
  'just_finished',
  'up_next',
]);

// Technology-frame fields: forbid the Restaurant-frame word "order" (§5.1).
const TECHNOLOGY_FRAME_FIELDS = Object.freeze([
  'technology_label',
  'in_code',
]);

// up_next verb-shape allowlist — derived from disk truth at WO-312.5a
// draft time (the seven up_next values in manifests/index.js merged at
// commit 4679bcc). Six action-state imperatives + one idle-state gerund.
// The idle-state gerund (Contemplating) is the only non-action state's
// reference verb, ratified during 311.3 deck-audit per §5.1 application.
const ALLOWED_UP_NEXT_VERBS = Object.freeze([
  'Take',
  'Brief',
  'Plate',
  'Read',
  'Serve',
  'Stock',
  'Contemplating',
]);

// "—" is U+2014 EM DASH; §5.1 prescribes a space-flanked em-dash as the
// separator between the verb phrase and the "why" clause in up_next.
const UP_NEXT_EM_DASH_SEPARATOR = ' — ';

/**
 * A single content-rule violation surfaced by {@link validateContent}.
 *
 * @typedef {Object} Diagnostic
 * @property {string} rule - Short rule identifier (e.g., 'order-turn-dual-frame', 'up-next-verb-shape').
 * @property {string} stepId - The stepId the violation belongs to.
 * @property {string} field - The manifest field where the violation was found.
 * @property {string} message - Human-readable description of the violation.
 */

/**
 * Validates a manifest's content against the §5.1 content rules per
 * `station-architecture-scoping-document.md` v1.2. Advisory — returns
 * diagnostics; does NOT throw on content violations.
 *
 * Argument-shape errors (programmer errors) DO throw TypeError. This
 * distinction is intentional: content violations are recoverable authoring
 * mistakes; argument-shape errors are calling-convention bugs.
 *
 * Rules currently enforced:
 *   - Order/Turn dual-frame (Restaurant-frame fields forbid "turn"; Technology-frame fields forbid "order")
 *   - up_next verb-shape ("Next: <Verb> ... — ..." with verb from a fixed allowlist)
 *
 * Rules scaffolded as `it.todo` pending vocabulary canon:
 *   - frame-sealing (requires Restaurant-frame + technology-frame allowlists)
 *   - in_code operations-not-frameworks (requires framework denylist)
 *
 * @param {import('./manifest-loader.js').Manifest} manifest - The manifest to validate.
 * @param {string} stepId - The stepId the manifest belongs to (echoed into each Diagnostic).
 * @returns {Diagnostic[]} Empty array = clean; non-empty array = one or more content violations.
 * @throws {TypeError} If `manifest` is not a plain object (null, array, or non-object).
 * @throws {TypeError} If `stepId` is not a non-empty string.
 *
 * @see ./HOOK_CONTRACT.md
 */
export function validateContent(manifest, stepId) {
  if (
    manifest === null ||
    typeof manifest !== 'object' ||
    Array.isArray(manifest)
  ) {
    throw new TypeError(
      'validateContent: manifest must be a plain object',
    );
  }
  if (typeof stepId !== 'string' || stepId.length === 0) {
    throw new TypeError(
      'validateContent: stepId must be a non-empty string',
    );
  }

  const diagnostics = [];

  // Rule: Order/Turn dual-frame.
  // Restaurant-frame fields must not contain the word "turn".
  for (const field of RESTAURANT_FRAME_FIELDS) {
    const value = manifest[field];
    if (typeof value === 'string' && /\bturn\b/i.test(value)) {
      diagnostics.push({
        rule: 'order-turn-dual-frame',
        stepId,
        field,
        message:
          `Restaurant-frame field "${field}" contains forbidden ` +
          `technology-frame word "turn" (§5.1 Order/Turn dual-frame).`,
      });
    }
  }
  // Technology-frame fields must not contain the word "order".
  for (const field of TECHNOLOGY_FRAME_FIELDS) {
    const value = manifest[field];
    if (typeof value === 'string' && /\border\b/i.test(value)) {
      diagnostics.push({
        rule: 'order-turn-dual-frame',
        stepId,
        field,
        message:
          `Technology-frame field "${field}" contains forbidden ` +
          `Restaurant-frame word "order" (§5.1 Order/Turn dual-frame).`,
      });
    }
  }

  // Rule: up_next verb-shape.
  // Form: "Next: <Verb> ... — ..." where Verb is in the allowlist.
  const upNext = manifest.up_next;
  if (typeof upNext === 'string') {
    const verbPattern = new RegExp(
      `^Next: (${ALLOWED_UP_NEXT_VERBS.join('|')}) `,
    );
    if (!verbPattern.test(upNext)) {
      diagnostics.push({
        rule: 'up-next-verb-shape',
        stepId,
        field: 'up_next',
        message:
          `up_next must start with "Next: <Verb> " where Verb is one of ` +
          `{${ALLOWED_UP_NEXT_VERBS.join(', ')}} (§5.1 up_next standard).`,
      });
    }
    if (!upNext.includes(UP_NEXT_EM_DASH_SEPARATOR)) {
      diagnostics.push({
        rule: 'up-next-verb-shape',
        stepId,
        field: 'up_next',
        message:
          'up_next must contain a space-flanked em-dash (" — ") ' +
          'separating the verb phrase from the "why" clause ' +
          '(§5.1 up_next standard: verb + what + why).',
      });
    }
  }

  return diagnostics;
}
