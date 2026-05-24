// demoSessionMiddleware — Express middleware gating /converse behind
// a verified magic-link session.
//
// Per WO-310.9a D.9. Reads the demo_session cookie, validates against
// the demo_sessions table, attaches req.demoSession on success, and
// 401s on absence / invalidity / expiry. Does NOT increment turns_used
// — that is WO-310.9c's responsibility at the /converse handler so
// turn-budget enforcement can fail closed inside the same transaction
// that records the assistant turn.
//
// Error envelope matches the existing /converse contract: 401 JSON
// `{ error: { code, message } }` with the generic patron-safe message.

import { getDemoSessionById } from './pantry-demo.js';

const GENERIC_MESSAGE =
  'we had a problem recording this — please try again';

function deny(res, code) {
  return res.status(401).json({
    error: { code, message: GENERIC_MESSAGE },
  });
}

export default async function demoSessionMiddleware(req, res, next) {
  const cookieId = req.cookies?.demo_session;
  if (!cookieId) {
    return deny(res, 'DEMO_SESSION_REQUIRED');
  }

  let sessionRow;
  try {
    sessionRow = await getDemoSessionById(cookieId);
  } catch {
    return deny(res, 'DEMO_SESSION_REQUIRED');
  }

  if (!sessionRow) {
    return deny(res, 'DEMO_SESSION_REQUIRED');
  }

  if (new Date() > new Date(sessionRow.expires_at)) {
    return deny(res, 'DEMO_SESSION_EXPIRED');
  }

  if (sessionRow.terminal_at !== null && sessionRow.terminal_at !== undefined) {
    return deny(res, 'DEMO_SESSION_TERMINAL');
  }

  req.demoSession = sessionRow;
  next();
}
