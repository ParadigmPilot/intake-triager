// Circuit breaker — bounds cascading failures during Anthropic upstream
// degradation and freezes spend during workspace-cap exhaustion.
//
// Per restaurant-pattern-commercial-model-memo §7 Decision 2 (circuit
// breaker layer). State is in-memory; resets on process restart (Render
// spin-down is acceptable; the workspace-cap at Anthropic is the
// ultimate backstop).
//
// Two trip modes:
//   - 'workspace_cap': long open window (default 24h); fires on the
//     specific Anthropic 400/"workspace API usage limits" response.
//   - 'transient':     short open window (default 60s); fires after N
//     consecutive failures; transitions to half-open after the window
//     elapses; one probe; on success → closed, on failure → re-open.

import { log } from '../observability.js';

const DEFAULT_TRANSIENT_THRESHOLD = 3;
const DEFAULT_TRANSIENT_OPEN_MS = 60 * 1000;
const DEFAULT_WORKSPACE_CAP_OPEN_MS = 24 * 60 * 60 * 1000;

function getTransientThreshold() {
  const raw = process.env.CIRCUIT_BREAKER_TRANSIENT_THRESHOLD;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TRANSIENT_THRESHOLD;
}

function getTransientOpenMs() {
  const raw = process.env.CIRCUIT_BREAKER_TRANSIENT_OPEN_MS;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TRANSIENT_OPEN_MS;
}

function getWorkspaceCapOpenMs() {
  const raw = process.env.CIRCUIT_BREAKER_WORKSPACE_CAP_OPEN_MS;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_WORKSPACE_CAP_OPEN_MS;
}

// Internal state. Shape:
//   { status: 'closed' | 'open' | 'half_open',
//     tripMode: 'workspace_cap' | 'transient' | null,
//     opensUntil: number | null,     // epoch ms
//     consecutiveFailures: number }
const state = {
  status: 'closed',
  tripMode: null,
  opensUntil: null,
  consecutiveFailures: 0,
};

export function _resetState() {
  state.status = 'closed';
  state.tripMode = null;
  state.opensUntil = null;
  state.consecutiveFailures = 0;
}

/**
 * Inspect the breaker. Side-effect: transitions 'open' → 'half_open'
 * when the open window has elapsed.
 * Returns: { status, tripMode, opensUntil, allowsCall: boolean }
 */
export function getState() {
  if (state.status === 'open' && state.opensUntil !== null && Date.now() >= state.opensUntil) {
    state.status = 'half_open';
    log({ level: 'info', event: 'circuit_breaker_half_open', tripMode: state.tripMode });
  }
  return {
    status: state.status,
    tripMode: state.tripMode,
    opensUntil: state.opensUntil,
    allowsCall: state.status === 'closed' || state.status === 'half_open',
  };
}

export function recordSuccess() {
  state.consecutiveFailures = 0;
  if (state.status === 'half_open') {
    state.status = 'closed';
    state.tripMode = null;
    state.opensUntil = null;
    log({ level: 'info', event: 'circuit_breaker_closed' });
  }
}

/**
 * Record a failure and possibly trip.
 * @param {'workspace_cap' | 'transient' | 'unknown'} mode
 */
export function recordFailure(mode) {
  if (mode === 'workspace_cap') {
    state.status = 'open';
    state.tripMode = 'workspace_cap';
    state.opensUntil = Date.now() + getWorkspaceCapOpenMs();
    state.consecutiveFailures = 0;
    log({
      level: 'error',
      event: 'circuit_breaker_tripped',
      tripMode: 'workspace_cap',
      opensUntil: state.opensUntil,
    });
    return;
  }

  // Transient and unknown modes funnel through the consecutive-failures
  // counter. 'unknown' is treated as transient — a fault we can't
  // classify is still a fault that should contribute to the trip count.
  state.consecutiveFailures += 1;

  // If we're already half-open and the probe failed, re-open.
  if (state.status === 'half_open') {
    state.status = 'open';
    state.opensUntil = Date.now() + getTransientOpenMs();
    log({ level: 'warn', event: 'circuit_breaker_re_opened', tripMode: 'transient' });
    return;
  }

  // Closed → open transition when threshold met.
  if (state.consecutiveFailures >= getTransientThreshold()) {
    state.status = 'open';
    state.tripMode = 'transient';
    state.opensUntil = Date.now() + getTransientOpenMs();
    log({
      level: 'warn',
      event: 'circuit_breaker_tripped',
      tripMode: 'transient',
      opensUntil: state.opensUntil,
    });
  }
}
