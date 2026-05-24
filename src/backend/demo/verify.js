// GET /api/demo/verify — handler for magic-link click.
//
// Per WO-310.9a D.8. Mounted in src/backend/app.js without rate-limit
// (per-IP cap at issuance covers the click side). HTML responses on
// failure because the endpoint is hit directly from an email client;
// JSON would render as raw text in the browser.
//
// URL-borne token shape: `<signedLinkId>.<rawToken>`
//   • signedLinkId = signToken(demo_link_id) (verifies signature,
//     resolves to demo_link_id efficiently)
//   • rawToken     = the 32-byte secret minted at issuance; hashed
//     and constant-time-compared against demo_links.token_hash
//
// Defense in depth: the demo_link_id derived from the HMAC signature
// must match the row found by hashing rawToken. A mismatch implies a
// tampered token and is treated as invalid.

import { verifyToken, hashToken } from './token.js';
import {
  getDemoLinkByTokenHash,
  markDemoLinkUsed,
  insertDemoSession,
} from './pantry-demo.js';
import { log } from '../observability.js';

const SESSION_TTL_MS = 60 * 60 * 1000; // 60 minutes
const DEFAULT_TURN_BUDGET = 10;

const ERROR_PAGE_BACK_LINK = 'https://restaurantpattern.com/demo';

function errorPage(message) {
  // Minimal styling; the page must include a single sentence and a
  // link back to the public demo intro. WO-310.9d will deliver the
  // styled template alongside the Astro intro page.
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Demo link</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 32rem; margin: 4rem auto; padding: 0 1rem; color: #222; }
  a { color: #0a58ca; }
</style>
</head>
<body>
<p>${message}</p>
<p><a href="${ERROR_PAGE_BACK_LINK}">Return to the demo</a></p>
</body>
</html>
`;
}

function sendError(res, message) {
  res.status(400).type('html').send(errorPage(message));
}

function getTurnBudget() {
  const raw = process.env.DEMO_TURN_BUDGET;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TURN_BUDGET;
}

export default async function verifyHandler(req, res) {
  try {
    const token = typeof req.query.token === 'string' ? req.query.token : '';
    const dot = token.indexOf('.');
    if (dot <= 0 || dot === token.length - 1) {
      return sendError(res, 'This link is invalid or has expired.');
    }
    // The signed-link-id half itself contains a '.', so split on the
    // LAST dot: everything before is the signed id; everything after
    // is the raw token (base64url has no '.').
    const lastDot = token.lastIndexOf('.');
    const signedLinkId = token.slice(0, lastDot);
    const rawToken = token.slice(lastDot + 1);

    if (!signedLinkId || !rawToken) {
      return sendError(res, 'This link is invalid or has expired.');
    }

    const demo_link_id = verifyToken(signedLinkId);
    if (!demo_link_id) {
      return sendError(res, 'This link is invalid or has expired.');
    }

    const linkRow = await getDemoLinkByTokenHash(hashToken(rawToken));
    if (!linkRow) {
      return sendError(res, 'This link is invalid or has expired.');
    }

    // Defense-in-depth: signed id must match the row found by raw-
    // token hash. Mismatch implies tampering or replay across links.
    if (linkRow.id !== demo_link_id) {
      return sendError(res, 'This link is invalid or has expired.');
    }

    if (linkRow.used_at !== null && linkRow.used_at !== undefined) {
      return sendError(res, 'This link has already been used.');
    }

    if (new Date() > new Date(linkRow.expires_at)) {
      return sendError(res, 'This link has expired.');
    }

    const claimed = await markDemoLinkUsed(linkRow.id);
    if (!claimed) {
      // Race: another concurrent verify won the UPDATE.
      return sendError(res, 'This link has already been used.');
    }

    const session_expires_at = new Date(Date.now() + SESSION_TTL_MS);
    const sessionRow = await insertDemoSession({
      owner_id: linkRow.owner_id,
      demo_link_id: linkRow.id,
      turn_budget: getTurnBudget(),
      expires_at: session_expires_at,
    });

    res.cookie('demo_session', sessionRow.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: session_expires_at,
      path: '/',
    });

    log({
      level: 'info',
      event: 'demo_session_created',
      owner_id: linkRow.owner_id,
    });

    return res.redirect(302, '/');
  } catch (err) {
    log({
      level: 'error',
      event: 'verify_handler_error',
      error: err.message,
    });
    return sendError(res, 'This link is invalid or has expired.');
  }
}
