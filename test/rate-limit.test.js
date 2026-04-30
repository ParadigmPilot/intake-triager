// Vitest unit suite for src/backend/security/rate-limit.js.
// Covers under-threshold, over-threshold, IP isolation, window reset,
// default threshold, invalid threshold, and missing-IP fallback.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  rateLimit,
  _resetStore,
} from '../src/backend/security/rate-limit.js';

function makeReq(ip = '1.2.3.4') {
  return { ip };
}

function makeRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe('rateLimit', () => {
  beforeEach(() => {
    _resetStore();
    process.env.RATE_LIMIT_PER_IP_PER_MINUTE = '3';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests at and under the threshold', () => {
    const next = vi.fn();
    const ip = '10.0.0.1';
    for (let i = 0; i < 3; i++) {
      const res = makeRes();
      rateLimit(makeReq(ip), res, next);
      expect(res.status).not.toHaveBeenCalled();
    }
    expect(next).toHaveBeenCalledTimes(3);
  });

  it('rejects the request over the threshold with 429 RATE_LIMITED', () => {
    const next = vi.fn();
    const ip = '10.0.0.2';
    for (let i = 0; i < 3; i++) {
      rateLimit(makeReq(ip), makeRes(), next);
    }
    const res = makeRes();
    rateLimit(makeReq(ip), res, next);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'RATE_LIMITED',
        message: expect.any(String),
      },
    });
    expect(next).toHaveBeenCalledTimes(3);
  });

  it('isolates counters per IP', () => {
    const next = vi.fn();
    for (let i = 0; i < 3; i++) {
      rateLimit(makeReq('10.0.0.3'), makeRes(), next);
    }
    const res = makeRes();
    rateLimit(makeReq('10.0.0.4'), res, next);
    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(4);
  });

  it('resets the window after 60 seconds', () => {
    const ip = '10.0.0.5';
    const next = vi.fn();

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-30T12:00:00Z'));
    for (let i = 0; i < 3; i++) {
      rateLimit(makeReq(ip), makeRes(), next);
    }

    vi.setSystemTime(new Date('2026-04-30T12:01:01Z'));
    const res = makeRes();
    rateLimit(makeReq(ip), res, next);
    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(4);
  });

  it('uses default threshold (20) when env var unset', () => {
    delete process.env.RATE_LIMIT_PER_IP_PER_MINUTE;
    const ip = '10.0.0.6';
    const next = vi.fn();
    for (let i = 0; i < 20; i++) {
      rateLimit(makeReq(ip), makeRes(), next);
    }
    expect(next).toHaveBeenCalledTimes(20);
    const res = makeRes();
    rateLimit(makeReq(ip), res, next);
    expect(res.status).toHaveBeenCalledWith(429);
  });

  it('falls back to default when env var is invalid', () => {
    process.env.RATE_LIMIT_PER_IP_PER_MINUTE = 'not-a-number';
    const ip = '10.0.0.7';
    const next = vi.fn();
    for (let i = 0; i < 20; i++) {
      rateLimit(makeReq(ip), makeRes(), next);
    }
    expect(next).toHaveBeenCalledTimes(20);
  });

  it('handles missing req.ip with sentinel "unknown" key', () => {
    const next = vi.fn();
    const res = makeRes();
    rateLimit({}, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
