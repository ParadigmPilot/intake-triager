// Rate limit — per-IP request count over a 60-second sliding window.
//
// Per intake-triager-gold-vision.md v1.5:
//   §10 item 7  — Rate limit on /converse: per-IP from
//     RATE_LIMIT_PER_IP_PER_MINUTE env var (default 20).
//   §10 Configuration — RATE_LIMIT_PER_IP_PER_MINUTE default 20.
//   §4  HTTP API contract — 429 with error.code 'RATE_LIMITED'.
//
// Strategy. In-memory Map<ip, {count, windowStart}> keyed by req.ip.
// On each request: if no entry exists or the window has expired, start
// a fresh window with count=1 and pass through. Otherwise increment
// count and compare to the threshold. Threshold is read from the env
// on each call so tests can mutate the env between cases.
//
// Single-instance teaching code per gold vision §7. Production-grade
// rate limiting (cluster-aware store, Redis backend) is out of scope
// per §11 — taught in *Implementing Standards for LLM Apps*.
//
// Per-conversation cost ceiling lives in security/cost-ceiling.js per
// the WO-303.6 split — see build-discovery D8.

const WINDOW_MS = 60 * 1000;
const DEFAULT_THRESHOLD = 20;

const GENERIC_MESSAGE =
  'we had a problem recording this — please try again';

function getThreshold() {
  const raw = process.env.RATE_LIMIT_PER_IP_PER_MINUTE;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_THRESHOLD;
}

// Internal: shared in-memory store. Exposed for test reset only.
const store = new Map();

export function _resetStore() {
  store.clear();
}

export function rateLimit(req, res, next) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const threshold = getThreshold();

  const entry = store.get(ip);
  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    store.set(ip, { count: 1, windowStart: now });
    return next();
  }

  entry.count += 1;

  if (entry.count > threshold) {
    return res.status(429).json({
      error: { code: 'RATE_LIMITED', message: GENERIC_MESSAGE },
    });
  }

  next();
}

export default rateLimit;
