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
// Per WO-310.9a D.4: two new public routes — POST /api/demo/issue-link
// (magic-link issuance) and GET /api/demo/verify (magic-link click) —
// land alongside /converse. The /converse route is now gated by
// demoSessionMiddleware which reads the demo_session cookie and 401s on
// absence/invalidity/expiry. cookie-parser is mounted globally so the
// gate has cookies available. /api/demo/issue-link carries its own
// path-scoped CORS allowing the public marketing site to POST without
// credentials; this is in addition to the global CORS configured from
// CORS_ALLOWED_ORIGINS.
//
// /health is intentionally absent. Gold vision §4 closes with "this is
// the only external HTTP contract this repo defines" — the Phase 0
// /health stub did not survive Phase 6 (build-discovery D10).

// .env loaded into process.env before any module that reads it (build-discovery D12).
import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { corsMiddleware } from './security/cors.js';
import { rateLimit } from './security/rate-limit.js';
import { inputValidation } from './security/input-validation.js';
import converse from './converse.js';
import issueLinkHandler from './demo/issue-link.js';
import verifyHandler from './demo/verify.js';
import demoSessionMiddleware from './demo/session-middleware.js';
import captchaMiddleware from './demo/captcha-middleware.js';
import disposableEmailMiddleware from './demo/disposable-email-middleware.js';
import costProtectionMiddleware from './demo/cost-protection-middleware.js';

// ESM __dirname shim — repo lacks CommonJS __dirname; resolved at module load.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vite builds the React frontend to <repo-root>/dist/. From src/backend/, that
// is two levels up. Resolved once at module load.
const DIST_DIR = path.resolve(__dirname, '../../dist');

// Path-scoped CORS for /api/demo/issue-link. The public marketing site
// (restaurantpattern.com, www.restaurantpattern.com) and local Astro
// dev servers POST the visitor's email here; the response carries no
// cookies and the request needs no credentials, so credentials: false.
// Restricted to this single path — the global corsMiddleware() still
// governs every other route.
const ISSUE_LINK_CORS_ORIGINS = [
  'https://restaurantpattern.com',
  'https://www.restaurantpattern.com',
  'http://localhost:4321',
  'http://localhost:5173',
];
const issueLinkCors = cors({
  origin: ISSUE_LINK_CORS_ORIGINS,
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false,
});

// Demo identity (single source of truth): the demo owner_id comes from the
// OWNER_ID env var — the same value issuance reads (issue-link.js) and that
// render.yaml pins. server.js's REQUIRED_ENV guarantees it is present at boot,
// so reading it per-request here cannot be undefined (WO-316.4a).
function identityStub(req, res, next) {
  req.user = { id: process.env.OWNER_ID };
  next();
}

const app = express();

app.use(corsMiddleware());
app.use(cookieParser());

// POST /api/demo/issue-link — magic-link issuance. Path-scoped CORS,
// rate-limited (reuses the per-IP cap that already governs /converse),
// JSON body. No demo-session gate (issuance is how visitors acquire a
// session in the first place).
//
// Per WO-310.9b: defense-in-depth at the issuance surface. Two new
// middlewares — captchaMiddleware (Cloudflare Turnstile verification)
// and disposableEmailMiddleware (block-list lookup against the
// disposable-email-domains npm package) — sit between rateLimit and
// the issueLinkHandler. Both read req.body, so express.json() runs
// ahead of them. Mount order per WO-310.9b §Success Criteria:
//   cors → body-parsing → rateLimit → captcha → disposable → handler.
app.options('/api/demo/issue-link', issueLinkCors);
app.post(
  '/api/demo/issue-link',
  issueLinkCors,
  express.json(),
  rateLimit,
  captchaMiddleware,
  disposableEmailMiddleware,
  issueLinkHandler
);

// GET /api/demo/verify — magic-link click. No rate-limit (issuance
// already enforces a per-IP cap, and clicks are bounded by the
// 15-minute link TTL). No CORS (link is opened directly from an email
// client, not via cross-origin fetch).
app.get('/api/demo/verify', verifyHandler);

// POST /converse — gated by demoSessionMiddleware. The middleware
// reads the demo_session cookie and 401s on failure; valid sessions
// proceed through the existing chain unchanged.
//
// Per WO-310.9c: costProtectionMiddleware slots immediately after
// demoSessionMiddleware (which populates req.demoSession). It enforces
// per-session turn budget, circuit-breaker state, and global daily turn
// cap before any downstream cost (body-parse, validation, Anthropic).
app.post(
  '/converse',
  demoSessionMiddleware,
  costProtectionMiddleware,
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
