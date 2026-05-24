// Disposable-email middleware — rejects throw-away email providers
// before magic-link issuance.
//
// Per restaurant-pattern-commercial-model-memo §7 Decision 2 (defense-
// in-depth layers) and §7 Failure UX:
//   "on disposable-email block, a 'please use a permanent email
//   address' inline message — never an error page".
//
// Block-list source: `disposable-email-domains` npm package, refreshed
// on each `npm update` cycle. ~3,500+ domains as of 2026.

// The `disposable-email-domains` package ships its block-list as
// index.json (per package.json `"main": "./index.json"`). Node ESM
// requires the `with { type: 'json' }` import attribute for JSON
// modules — without it, the import throws ERR_IMPORT_ATTRIBUTE_MISSING.
// The default export is a flat array of lowercase domain strings
// (~120k entries as of the 1.0.62 release this repo pins).
import disposableDomains from 'disposable-email-domains' with { type: 'json' };
import { log } from '../observability.js';

// Build a Set once at module load for O(1) lookup at request time.
const BLOCK_SET = new Set(disposableDomains);

export function disposableEmailMiddleware(req, res, next) {
  const email = req.body && req.body.email;

  if (typeof email !== 'string') {
    // Email validity is the issue-link handler's job; pass through
    // and let the handler return its generic 200 for missing/invalid
    // email shape. Only block when email IS a string and IS disposable.
    return next();
  }

  const atIndex = email.lastIndexOf('@');
  if (atIndex < 0 || atIndex === email.length - 1) {
    return next();
  }

  const domain = email.slice(atIndex + 1).toLowerCase().trim();

  if (BLOCK_SET.has(domain)) {
    log({ level: 'info', event: 'disposable_email_blocked', domain });
    return res.status(400).json({
      error: {
        code: 'EMAIL_NOT_ACCEPTED',
        message: 'Please use a permanent email address.',
      },
    });
  }

  next();
}

export default disposableEmailMiddleware;
