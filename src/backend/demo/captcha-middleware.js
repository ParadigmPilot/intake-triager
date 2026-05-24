// Captcha middleware — verifies Cloudflare Turnstile token on issuance.
//
// Per restaurant-pattern-commercial-model-memo §7 Decision 2 (defense-
// in-depth layers). Captcha is one of three layers; the other two are
// per-IP rate limit (rate-limit.js, shipped 310.9a) and disposable-email
// block-list (disposable-email-middleware.js, this WO).
//
// Cloudflare contract: POST application/json to
//   https://challenges.cloudflare.com/turnstile/v0/siteverify
// with { secret, response, remoteip? }. Response is JSON with
// { success: boolean, 'error-codes': string[], ... }.
//
// Secret read from process.env at call time (test mutability per the
// existing rate-limit.js / cost-ceiling.js idiom).

import { log } from '../observability.js';

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const GENERIC_MESSAGE = 'we had a problem recording this — please try again';
const TOKEN_FIELD = 'cf-turnstile-response';

function getSecret() {
  return process.env.TURNSTILE_SECRET_KEY;
}

export async function captchaMiddleware(req, res, next) {
  const token = req.body && req.body[TOKEN_FIELD];

  if (!token || typeof token !== 'string') {
    return res.status(400).json({
      error: { code: 'CAPTCHA_REQUIRED', message: GENERIC_MESSAGE },
    });
  }

  let verifyResult;
  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: getSecret(),
        response: token,
        remoteip: req.ip,
      }),
    });
    verifyResult = await response.json();
  } catch (err) {
    log({ level: 'error', event: 'captcha_verify_network_error', error: err.message });
    return res.status(500).json({
      error: { code: 'CAPTCHA_VERIFY_FAILED', message: GENERIC_MESSAGE },
    });
  }

  if (!verifyResult || verifyResult.success !== true) {
    log({
      level: 'warn',
      event: 'captcha_verify_failed',
      error_codes: verifyResult && verifyResult['error-codes'],
    });
    return res.status(400).json({
      error: { code: 'CAPTCHA_FAILED', message: GENERIC_MESSAGE },
    });
  }

  next();
}

export default captchaMiddleware;
