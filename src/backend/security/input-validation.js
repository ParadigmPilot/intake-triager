// Input validation — Express middleware enforcing the door's contract.
//
// Per intake-triager-gold-vision.md v1.5:
//   §10 item 3 — Input validation at the door:
//     • message length cap
//     • Content-Type checks (multipart/form-data rejected; conversation
//       surface is text only)
//   §4 HTTP API contract — failures return 400 with
//     error.code: 'VALIDATION_FAILED' and a generic Patron-safe message.
//
// Mount before /converse in src/backend/app.js (Phase 6). Express must
// have already parsed the JSON body (express.json()) before this
// middleware runs.

const MAX_CONTENT_LENGTH = 8000; // chars; canon-silent — see build-discovery D6

const GENERIC_MESSAGE =
  'we had a problem recording this — please try again';

function fail(res) {
  return res.status(400).json({
    error: { code: 'VALIDATION_FAILED', message: GENERIC_MESSAGE },
  });
}

export function inputValidation(req, res, next) {
  const contentType = req.headers['content-type'] || '';

  // Reject multipart/form-data outright (text-only conversation surface).
  if (contentType.includes('multipart/form-data')) {
    return fail(res);
  }

  // Require application/json.
  if (!contentType.includes('application/json')) {
    return fail(res);
  }

  const body = req.body || {};

  // content is required and must be a string.
  if (typeof body.content !== 'string') {
    return fail(res);
  }

  // Length cap.
  if (body.content.length > MAX_CONTENT_LENGTH) {
    return fail(res);
  }

  // conversation_id is optional; when present, must be a string.
  if (body.conversation_id !== undefined && body.conversation_id !== null) {
    if (typeof body.conversation_id !== 'string') {
      return fail(res);
    }
  }

  next();
}

export default inputValidation;
