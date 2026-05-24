// POST /api/demo/issue-link — handler for magic-link issuance.
//
// Per WO-310.9a D.7. Mounted in src/backend/app.js with rateLimit and
// a path-scoped CORS middleware. Defense-in-depth additions (captcha,
// disposable-email block-list) are deferred to WO-310.9b; this handler
// accepts and ignores any extra fields on the request body.
//
// Generic response posture: malformed email returns 200 {ok: true};
// successful issuance returns 200 {ok: true}. The caller cannot tell
// from the response whether an email was actually sent.

import { randomBytes } from 'node:crypto';
import { insertDemoLink } from './pantry-demo.js';
import { hashToken, signToken } from './token.js';
import { sendMagicLink } from '../email/send-magic-link.js';
import { log } from '../observability.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EXPIRES_IN_MINUTES = 15;
const GENERIC_MESSAGE =
  'we had a problem recording this — please try again';
const DEFAULT_BASE_URL = 'https://intake-triager.onrender.com';

function getBaseUrl() {
  return process.env.PUBLIC_BASE_URL || DEFAULT_BASE_URL;
}

export default async function issueLinkHandler(req, res) {
  const body = req.body || {};
  const email = typeof body.email === 'string' ? body.email.trim() : '';

  // Generic-response gate: invalid email → 200 {ok: true} with no DB
  // write, no email send. The visitor cannot probe for validation.
  if (!EMAIL_RE.test(email)) {
    return res.status(200).json({ ok: true });
  }

  try {
    const rawToken = randomBytes(32).toString('base64url');
    const token_hash = hashToken(rawToken);
    const expires_at = new Date(Date.now() + EXPIRES_IN_MINUTES * 60 * 1000);
    const owner_id = process.env.OWNER_ID;
    const ip_at_issue = req.ip ?? null;

    const linkRow = await insertDemoLink({
      owner_id,
      email,
      token_hash,
      expires_at,
      ip_at_issue,
    });

    const signedLinkId = signToken(linkRow.id);
    const magicLinkUrl =
      `${getBaseUrl()}/api/demo/verify?token=${signedLinkId}.${rawToken}`;

    await sendMagicLink({
      to: email,
      magicLinkUrl,
      expiresInMinutes: EXPIRES_IN_MINUTES,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    log({
      level: 'error',
      event: 'issue_link_failed',
      error: err.message,
    });
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: GENERIC_MESSAGE },
    });
  }
}
