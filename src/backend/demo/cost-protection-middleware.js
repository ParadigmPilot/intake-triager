// Cost-protection middleware — pre-flight checks before /converse hits
// the Anthropic API.
//
// Per restaurant-pattern-commercial-model-memo §7 Decision 2 (per-user
// turn budget + global daily cap + circuit breaker). Mounts AFTER
// demoSessionMiddleware (which populates req.demoSession) and BEFORE
// the existing /converse handler.
//
// Order of checks (fail-fast: cheapest first):
//   1. Per-session turn budget — req.demoSession in-memory; no I/O.
//   2. Circuit-breaker state — module-level state; no I/O.
//   3. Global daily turn cap — one indexed DB read.
//
// Each check emits a distinct error code mapped to §7 Failure UX.

import { getState as getBreakerState } from './circuit-breaker.js';
import pantryDemo from './pantry-demo.js';
import { log } from '../observability.js';

const DEFAULT_DAILY_CAP = 100;

function getDailyCap() {
  const raw = process.env.DEMO_GLOBAL_DAILY_TURN_CAP;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_DAILY_CAP;
}

export async function costProtectionMiddleware(req, res, next) {
  // 1. Per-session turn budget. Session-middleware already 401'd on
  //    terminal sessions; this check is for the boundary case where
  //    a request reaches /converse with turns_used === turn_budget
  //    but terminal_at hasn't been set yet (shouldn't happen post-D.4
  //    but defensive).
  const session = req.demoSession;
  if (session.turns_used >= session.turn_budget) {
    return res.status(403).json({
      error: { code: 'TURN_BUDGET_EXCEEDED', message: 'Session turn budget reached.' },
    });
  }

  // 2. Circuit-breaker state.
  const breaker = getBreakerState();
  if (!breaker.allowsCall) {
    if (breaker.tripMode === 'workspace_cap') {
      return res.status(503).json({
        error: {
          code: 'WORKSPACE_CAP_REACHED',
          message: 'The demo is taking a break — try again tomorrow.',
        },
      });
    }
    return res.status(503).json({
      error: {
        code: 'SERVICE_TEMPORARILY_UNAVAILABLE',
        message: "We're having a temporary problem; please try again in a few minutes.",
      },
    });
  }

  // 3. Global daily turn cap.
  let dailyCount;
  try {
    dailyCount = await pantryDemo.getGlobalDailyTurnCount();
  } catch (err) {
    log({ level: 'error', event: 'daily_cap_query_failed', error: err.message });
    return res.status(500).json({
      error: {
        code: 'COST_PROTECTION_QUERY_FAILED',
        message: 'we had a problem recording this — please try again',
      },
    });
  }
  if (dailyCount >= getDailyCap()) {
    return res.status(503).json({
      error: {
        code: 'GLOBAL_DAILY_CAP_REACHED',
        message: 'The demo is busy today; try again tomorrow.',
      },
    });
  }

  next();
}

export default costProtectionMiddleware;
