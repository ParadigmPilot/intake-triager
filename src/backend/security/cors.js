// CORS — cross-origin request configuration.
//
// Per intake-triager-gold-vision.md v1.5:
//   §10 item 9       — CORS: configured to known origins; wildcards
//                      forbidden. Allowed origins from
//                      CORS_ALLOWED_ORIGINS env var (comma-separated list).
//   §10 Configuration — default `http://localhost:5173`.
//   §4  Required dependencies — `cors` package available.
//
// Shape. Factory function returns a configured `cors` middleware. Origins
// parsed from env on each call: split on commas, trim whitespace, filter
// empty entries. Any entry containing a literal `*` raises Error —
// fail-fast at startup matches the enforcement posture of §10 items 1-9
// (in contrast to the pattern items 10-11).
//
// Canon. File path is canon-silent — see build-discovery D4 (gold vision
// §4 Repo structure lists three files under security/; this is the fourth).

import cors from 'cors';

const DEFAULT_ORIGINS = 'http://localhost:5173';

function parseOrigins() {
  const raw = process.env.CORS_ALLOWED_ORIGINS || DEFAULT_ORIGINS;
  const origins = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (origins.some((o) => o.includes('*'))) {
    throw new Error(
      'CORS_ALLOWED_ORIGINS contains a wildcard ("*"). Wildcards are ' +
        'forbidden per intake-triager-gold-vision.md §10 item 9. Set ' +
        'explicit origins (comma-separated).'
    );
  }

  return origins;
}

export function corsMiddleware() {
  return cors({ origin: parseOrigins() });
}

export default corsMiddleware;
