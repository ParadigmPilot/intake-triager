// src/substrate/manifest-loader.js
// Per-state manifest loader resolving the seven-field content shape per
// station-architecture-scoping-document.md v1.2 D-WS1-6.
//
// Pure function — does not read from disk. Host code (or a future
// content-loading WO) provides the manifests dict keyed by stepId; the loader
// validates structure and returns a frozen copy of the resolved manifest.
//
// Seven fields per D-WS1-6:
//   - restaurant_label
//   - technology_label
//   - animation_asset
//   - plain_english
//   - in_code
//   - just_finished
//   - up_next
//
// Validation scope: STRUCTURAL only — all seven fields present and stepId
// known. Content rules per scoping-doc §5.1 (frame-sealing, up_next
// verb-what-why form, Order/Turn dual-frame, in_code names operations) are
// authoring/review rules, NOT enforced here. They land in a future
// content-validation WO.

const REQUIRED_FIELDS = Object.freeze([
  'restaurant_label',
  'technology_label',
  'animation_asset',
  'plain_english',
  'in_code',
  'just_finished',
  'up_next',
]);

export function loadManifest(stepId, manifests) {
  if (typeof stepId !== 'string' || stepId.length === 0) {
    throw new Error('loadManifest: stepId must be a non-empty string');
  }
  if (!manifests || typeof manifests !== 'object') {
    throw new Error(
      'loadManifest: manifests must be an object keyed by stepId',
    );
  }
  if (!Object.prototype.hasOwnProperty.call(manifests, stepId)) {
    const available = Object.keys(manifests).join(', ') || '(none)';
    throw new Error(
      `loadManifest: unknown stepId "${stepId}". Available: ${available}`,
    );
  }

  const manifest = manifests[stepId];
  if (!manifest || typeof manifest !== 'object') {
    throw new Error(
      `loadManifest: manifest for "${stepId}" must be an object; ` +
        `received ${typeof manifest}`,
    );
  }

  const missing = REQUIRED_FIELDS.filter(
    (field) => !Object.prototype.hasOwnProperty.call(manifest, field),
  );
  if (missing.length > 0) {
    throw new Error(
      `loadManifest: manifest for "${stepId}" missing required field(s): ` +
        `${missing.join(', ')}. Required: ${REQUIRED_FIELDS.join(', ')}`,
    );
  }

  return Object.freeze({ ...manifest });
}
