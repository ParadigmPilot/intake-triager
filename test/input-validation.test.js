// Vitest unit suite for src/backend/security/input-validation.js.
// Covers the eight validation paths declared by gold vision §10 item 3
// and §4 HTTP API contract.

import { describe, it, expect, vi } from 'vitest';
import { inputValidation } from '../src/backend/security/input-validation.js';

function makeReq({ contentType = 'application/json', body = {} } = {}) {
  return {
    headers: { 'content-type': contentType },
    body,
  };
}

function makeRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe('inputValidation', () => {
  it('passes through valid application/json with content string', () => {
    const req = makeReq({ body: { content: 'hello' } });
    const res = makeRes();
    const next = vi.fn();
    inputValidation(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rejects multipart/form-data with 400 VALIDATION_FAILED', () => {
    const req = makeReq({
      contentType: 'multipart/form-data; boundary=---',
      body: { content: 'hello' },
    });
    const res = makeRes();
    const next = vi.fn();
    inputValidation(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'VALIDATION_FAILED',
        message: expect.any(String),
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects non-JSON Content-Type with 400', () => {
    const req = makeReq({
      contentType: 'text/plain',
      body: { content: 'hello' },
    });
    const res = makeRes();
    const next = vi.fn();
    inputValidation(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects missing Content-Type with 400', () => {
    const req = { headers: {}, body: { content: 'hello' } };
    const res = makeRes();
    const next = vi.fn();
    inputValidation(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects body without content string with 400', () => {
    const req = makeReq({ body: {} });
    const res = makeRes();
    const next = vi.fn();
    inputValidation(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects content longer than 8000 chars with 400', () => {
    const req = makeReq({ body: { content: 'a'.repeat(8001) } });
    const res = makeRes();
    const next = vi.fn();
    inputValidation(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('accepts content exactly at 8000 chars (boundary)', () => {
    const req = makeReq({ body: { content: 'a'.repeat(8000) } });
    const res = makeRes();
    const next = vi.fn();
    inputValidation(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('accepts valid string conversation_id', () => {
    const req = makeReq({
      body: {
        conversation_id: '00000000-0000-0000-0000-000000000001',
        content: 'hi',
      },
    });
    const res = makeRes();
    const next = vi.fn();
    inputValidation(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('rejects non-string conversation_id with 400', () => {
    const req = makeReq({ body: { conversation_id: 123, content: 'hi' } });
    const res = makeRes();
    const next = vi.fn();
    inputValidation(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});
