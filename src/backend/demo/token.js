// Magic-link token sign/verify — HMAC-SHA256 over a demo_links.id.
//
// Per WO-310.9a D.6. The URL-borne token has two parts joined by '.':
//   <signedLinkId>.<rawTokenBase64url>
//
// Part A (signed link id), produced by signToken(demo_link_id):
//   <demo_link_id_base64url>.<hmac_sha256(MAGIC_LINK_SECRET, demo_link_id)_base64url>
//
// signToken/verifyToken handle Part A. hashToken is used by callers on
// Part B (the raw 32-byte secret minted in issue-link.js) to compute
// the demo_links.token_hash column value.
//
// MAGIC_LINK_SECRET is read from process.env at call time (not module
// load) so tests can mutate the env between cases — matches the pattern
// in security/rate-limit.js and security/cost-ceiling.js.

import { createHmac, createHash, timingSafeEqual } from 'node:crypto';

function getSecret() {
  const secret = process.env.MAGIC_LINK_SECRET;
  if (!secret) {
    // server.js REQUIRED_ENV blocks boot when this is unset; this throw
    // protects against in-test env mutation that strips it.
    throw new Error('MAGIC_LINK_SECRET is not set');
  }
  return secret;
}

function toBase64Url(buf) {
  return buf.toString('base64url');
}

function fromBase64Url(str) {
  return Buffer.from(str, 'base64url');
}

function hmac(message) {
  return createHmac('sha256', getSecret()).update(message).digest();
}

/**
 * Sign a demo_link id. Returns the URL-safe token string of the form
 * `<id_b64url>.<sig_b64url>`. The raw demo_link_id is expected to be a
 * UUID string (as produced by Postgres gen_random_uuid()).
 *
 * @param {string} demo_link_id
 * @returns {string}
 */
export function signToken(demo_link_id) {
  const idBuf = Buffer.from(String(demo_link_id), 'utf8');
  const sig = hmac(idBuf);
  return `${toBase64Url(idBuf)}.${toBase64Url(sig)}`;
}

/**
 * Verify a signed-link-id token. Returns the demo_link_id if the
 * signature is valid, null otherwise. Constant-time comparison.
 *
 * @param {string} token
 * @returns {string | null}
 */
export function verifyToken(token) {
  if (typeof token !== 'string') return null;
  const dot = token.indexOf('.');
  if (dot <= 0 || dot === token.length - 1) return null;

  const idPart = token.slice(0, dot);
  const sigPart = token.slice(dot + 1);

  let idBuf;
  let sigBuf;
  try {
    idBuf = fromBase64Url(idPart);
    sigBuf = fromBase64Url(sigPart);
  } catch {
    return null;
  }

  const expected = hmac(idBuf);
  if (sigBuf.length !== expected.length) return null;
  if (!timingSafeEqual(sigBuf, expected)) return null;

  return idBuf.toString('utf8');
}

/**
 * SHA-256 hash of a raw token, base64url-encoded. Used as the
 * token_hash column value in demo_links so the raw token never lands
 * in the database.
 *
 * @param {string} rawToken
 * @returns {string}
 */
export function hashToken(rawToken) {
  return createHash('sha256').update(String(rawToken)).digest('base64url');
}

export default { signToken, verifyToken, hashToken };
