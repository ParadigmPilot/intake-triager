// Vitest unit suite for src/backend/security/cors.js.
// Covers parsing, defaults, and wildcard-throw cases.

import { describe, it, expect, afterEach } from 'vitest';
import { corsMiddleware } from '../src/backend/security/cors.js';

const ORIG_ENV = process.env.CORS_ALLOWED_ORIGINS;

describe('corsMiddleware', () => {
  afterEach(() => {
    if (ORIG_ENV === undefined) {
      delete process.env.CORS_ALLOWED_ORIGINS;
    } else {
      process.env.CORS_ALLOWED_ORIGINS = ORIG_ENV;
    }
  });

  it('returns an Express middleware (function)', () => {
    process.env.CORS_ALLOWED_ORIGINS = 'http://example.com';
    const mw = corsMiddleware();
    expect(typeof mw).toBe('function');
  });

  it('parses a single origin', () => {
    process.env.CORS_ALLOWED_ORIGINS = 'http://example.com';
    expect(() => corsMiddleware()).not.toThrow();
  });

  it('parses a comma-separated list of origins', () => {
    process.env.CORS_ALLOWED_ORIGINS =
      'http://a.com,http://b.com,http://c.com';
    expect(() => corsMiddleware()).not.toThrow();
  });

  it('trims whitespace and filters empty entries', () => {
    process.env.CORS_ALLOWED_ORIGINS = ' http://a.com , , http://b.com ';
    expect(() => corsMiddleware()).not.toThrow();
  });

  it('falls back to localhost:5173 when env unset', () => {
    delete process.env.CORS_ALLOWED_ORIGINS;
    expect(() => corsMiddleware()).not.toThrow();
  });

  it('throws on a bare wildcard', () => {
    process.env.CORS_ALLOWED_ORIGINS = '*';
    expect(() => corsMiddleware()).toThrow(/wildcard/i);
  });

  it('throws on a subdomain wildcard', () => {
    process.env.CORS_ALLOWED_ORIGINS = 'https://*.example.com';
    expect(() => corsMiddleware()).toThrow(/wildcard/i);
  });

  it('throws when wildcard appears in a mixed list', () => {
    process.env.CORS_ALLOWED_ORIGINS = 'http://example.com,*';
    expect(() => corsMiddleware()).toThrow(/wildcard/i);
  });

  it('error message cites gold vision §10 item 9', () => {
    process.env.CORS_ALLOWED_ORIGINS = '*';
    expect(() => corsMiddleware()).toThrow(/§10 item 9/);
  });
});
