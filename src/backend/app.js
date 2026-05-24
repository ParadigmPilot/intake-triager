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

// .env loaded into process.env before any module that reads it (build-discovery D12).
import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { corsMiddleware } from './security/cors.js';
import { rateLimit } from './security/rate-limit.js';
import { inputValidation } from './security/input-validation.js';
import converse from './converse.js';

// ESM __dirname shim — repo lacks CommonJS __dirname; resolved at module load.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vite builds the React frontend to <repo-root>/dist/. From src/backend/, that
// is two levels up. Resolved once at module load.
const DIST_DIR = path.resolve(__dirname, '../../dist');

const DEMO_OWNER_ID = '00000000-0000-0000-0000-000000000001';

function identityStub(req, res, next) {
  req.user = { id: DEMO_OWNER_ID };
  next();
}

const app = express();

app.use(corsMiddleware());

app.post(
  '/converse',
  rateLimit,
  express.json(),
  inputValidation,
  identityStub,
  converse
);

// Production-only: serve built Vite frontend from dist/ and SPA-fallback to
// index.html for any non-API GET (so deep-links into the SPA resolve correctly).
// Mounted AFTER /converse so the API route wins on POST /converse. The static
// middleware will not intercept POST. The catch-all uses Express 4 wildcard
// syntax ('*'); Express 4 is locked in package.json (^4.21.2).
//
// In development, Vite's own dev server (port 5173) serves the frontend; this
// block is intentionally skipped so concurrently-orchestrated dev mode behaves
// as before.
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

export default app;
