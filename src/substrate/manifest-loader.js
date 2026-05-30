// src/substrate/manifest-loader.js
// Per-state manifest loader resolving the seven-field content shape per
// station-architecture-scoping-document.md v1.2 D-WS1-6 + §WS-3 + §5.1.
//
// Seven fields (per state):
//   - restaurant_label
//   - technology_label
//   - animation_asset
//   - plain_english
//   - in_code
//   - just_finished
//   - up_next            (authored per §5.1 "up_next standard": verb + what + why; Restaurant frame)
//
// Manifest content files live at ./manifests/ and land in WO-312.2c+.
// Implementation deferred to OBJ-2 component #1 close (state-machine session)
// and OBJ-2 component #2 (schema validation).

export function loadManifest() {
  throw new Error('Not yet implemented');
}
