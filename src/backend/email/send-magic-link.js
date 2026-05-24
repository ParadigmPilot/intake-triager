// Outbound magic-link email — thin Resend wrapper.
//
// Per WO-310.9a D.10. Mockable in tests because getResend() is a
// per-call factory (no module-load singleton); test code can vi.mock
// the entire module or stub process.env.RESEND_API_KEY between cases.
//
// HTML body is intentionally deferred to WO-310.9d (the Astro intro
// page on restaurant-pattern-site will own the template). Plain-text
// is sufficient for 310.9a and removes the HTML-injection surface.
//
// Observability: success and failure are logged via observability.log.
// The raw email never appears in logs — only a 12-char SHA-256 prefix
// (hashEmailForLog), per the security floor's no-PII-in-logs posture.

import { createHash } from 'node:crypto';
import { Resend } from 'resend';
import { log } from '../observability.js';

const SUBJECT = 'Your Restaurant Pattern demo link';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function hashEmailForLog(email) {
  // SHA-256 hex prefix for log-only identification.
  return createHash('sha256').update(String(email)).digest('hex').slice(0, 12);
}

/**
 * Send the magic-link email.
 * @param {object} params
 * @param {string} params.to
 * @param {string} params.magicLinkUrl
 * @param {number} params.expiresInMinutes
 */
export async function sendMagicLink({ to, magicLinkUrl, expiresInMinutes }) {
  const text = [
    'Welcome to the Restaurant Pattern demo.',
    '',
    `Click this link to enter (expires in ${expiresInMinutes} minutes):`,
    magicLinkUrl,
    '',
    'If you did not request this link, you can safely ignore this email.',
  ].join('\n');

  const result = await getResend().emails.send({
    from: process.env.RESEND_FROM_ADDRESS,
    to,
    subject: SUBJECT,
    text,
  });

  if (result.error) {
    log({
      level: 'error',
      event: 'magic_link_send_failed',
      error: result.error.message,
    });
    throw new Error(result.error.message);
  }

  log({
    level: 'info',
    event: 'magic_link_sent',
    to_hash: hashEmailForLog(to),
  });
}

export default sendMagicLink;
