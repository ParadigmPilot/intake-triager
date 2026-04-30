// The Pass — Express bootstrap.
//
// Per intake-triager-gold-vision.md v1.5:
//   §4 Restaurant map        — "The Pass — bootstrap"
//   §4 Repo structure        — src/backend/app.js
//   §4 HTTP API contract     — POST /converse is the only external route
//   §10 items 3, 7, 9        — input validation, rate limit, CORS as
//                              Express middleware
//   §10 item 11              — identity stub (req.user shim) lives here
//
// Mount order (outermost → innermost): cors, rateLimit, express.json,
// inputValidation, identityStub. CORS first so error responses also
// carry the headers. rateLimit before express.json so rate-limited
// requests reject before body-parse cost. inputValidation requires the
// parsed body. The identity stub runs last so it sees only requests
// that passed every earlier gate.
//
// /health is intentionally absent. Gold vision §4 closes with "this is
// the only external HTTP contract this repo defines" — the Phase 0
// /health stub did not survive Phase 6 (build-discovery D10).

import express from 'express';

import { corsMiddleware } from './security/cors.js';
import { rateLimit } from './security/rate-limit.js';
import { inputValidation } from './security/input-validation.js';
import converse from './converse.js';

const DEMO_OWNER_ID = '00000000-0000-0000-0000-000000000001';

function identityStub(req, res, next) {
  req.user = { id: DEMO_OWNER_ID };
  next();
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(corsMiddleware());

app.post(
  '/converse',
  rateLimit,
  express.json(),
  inputValidation,
  identityStub,
  converse
);

app.listen(PORT, () => {
  console.log(`[backend] listening on port ${PORT}`);
});

export default app;
