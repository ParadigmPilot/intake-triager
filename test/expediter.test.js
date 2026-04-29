// Expediter unit tests
//
// Per intake-triager-build-plan.md §Phase 4 *Gate*:
//   • marker stripped from prose
//   • two-marker reply yields one accepted + one logged
//   • malformed JSON returns the generic error (verified at route layer
//     in Phase 6; here we verify parse drops the marker and logs)
// Per gold vision §11: test/expediter.test.js is in-scope.
//
// Handler module is mocked to keep this a pure unit test (the real
// handler imports pantry, which opens a pg Pool at module load).

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockHandler = vi.fn();
vi.mock('../src/backend/handlers/triage-record.js', () => ({
  default: (...args) => mockHandler(...args),
}));

import { parse, dispatch } from '../src/backend/expediter.js';

const validMarker = `<!-- TRIAGE_RECORD:{"severity":"medium","category":"interpersonal_conflict","suggested_owner":"HR_Partner","required_timeline":"1_week","summary":"Coworker dispute","escalation_flag":false,"confidentiality_level":"standard","anonymous":false} -->`;

describe('parse', () => {
  it('returns an object with prose and markers properties', () => {
    const r = parse('Hello world');
    expect(r).toHaveProperty('prose');
    expect(r).toHaveProperty('markers');
    expect(Array.isArray(r.markers)).toBe(true);
  });

  it('returns prose unchanged and markers empty when no marker present', () => {
    const r = parse('Hello world. This is just prose.');
    expect(r.prose).toBe('Hello world. This is just prose.');
    expect(r.markers).toEqual([]);
  });

  it('strips the marker from prose and extracts the TRIAGE_RECORD payload', () => {
    const reply = `Sure, I'll log that.\n${validMarker}`;
    const r = parse(reply);
    expect(r.prose).not.toContain('TRIAGE_RECORD');
    expect(r.prose).not.toContain('<!--');
    expect(r.prose).toContain("Sure, I'll log that.");
    expect(r.markers).toHaveLength(1);
    expect(r.markers[0].type).toBe('TRIAGE_RECORD');
    expect(r.markers[0].payload.severity).toBe('medium');
    expect(r.markers[0].payload.category).toBe('interpersonal_conflict');
  });

  it('tolerates whitespace and newlines inside the JSON body', () => {
    const reply = `<!-- TRIAGE_RECORD:{
      "severity": "high",
      "category": "harassment_or_discrimination",
      "suggested_owner": "Legal",
      "required_timeline": "immediate",
      "summary": "test",
      "escalation_flag": true,
      "confidentiality_level": "sensitive",
      "anonymous": false
    } -->`;
    const r = parse(reply);
    expect(r.markers).toHaveLength(1);
    expect(r.markers[0].payload.severity).toBe('high');
    expect(r.markers[0].payload.escalation_flag).toBe(true);
  });

  it('logs and drops the marker when JSON is malformed', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const reply = `Some prose. <!-- TRIAGE_RECORD:{not valid json} --> trailing.`;
    const r = parse(reply);
    expect(r.markers).toHaveLength(0);
    expect(r.prose).not.toContain('TRIAGE_RECORD');
    expect(r.prose).not.toContain('<!--');
    expect(errSpy).toHaveBeenCalled();
    expect(errSpy.mock.calls[0][0]).toMatch(/malformed JSON/);
    errSpy.mockRestore();
  });

  it('accepts the first marker and logs duplicates of the same type', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const reply = `${validMarker}\n${validMarker}`;
    const r = parse(reply);
    expect(r.markers).toHaveLength(1);
    expect(warnSpy).toHaveBeenCalled();
    expect(warnSpy.mock.calls[0][0]).toMatch(/duplicate marker type/);
    warnSpy.mockRestore();
  });
});

describe('dispatch', () => {
  beforeEach(() => mockHandler.mockReset());

  it('routes a TRIAGE_RECORD marker to its handler with payload + ctx', async () => {
    const payload = { severity: 'low' };
    const ctx = { conversation_id: 'c1', owner_id: 'o1', tx: null };
    await dispatch([{ type: 'TRIAGE_RECORD', payload }], ctx);
    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledWith(payload, ctx);
  });

  it('resolves when all handlers complete', async () => {
    mockHandler.mockResolvedValue(undefined);
    const ctx = { conversation_id: 'c1', owner_id: 'o1', tx: null };
    await expect(
      dispatch([{ type: 'TRIAGE_RECORD', payload: {} }], ctx)
    ).resolves.toBeUndefined();
  });

  it('throws when a handler throws', async () => {
    mockHandler.mockImplementationOnce(() =>
      Promise.resolve().then(() => {
        throw new Error('handler boom');
      })
    );
    const ctx = { conversation_id: 'c1', owner_id: 'o1', tx: null };
    const promise = dispatch(
      [{ type: 'TRIAGE_RECORD', payload: {} }],
      ctx
    );
    await expect(promise).rejects.toThrow('handler boom');
  });

  it('logs and skips markers with no registered handler', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const ctx = { conversation_id: 'c1', owner_id: 'o1', tx: null };
    await dispatch([{ type: 'UNKNOWN_TYPE', payload: {} }], ctx);
    expect(mockHandler).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    expect(warnSpy.mock.calls[0][0]).toMatch(/no handler registered/);
    warnSpy.mockRestore();
  });

  it('does nothing when markers is empty', async () => {
    const ctx = { conversation_id: 'c1', owner_id: 'o1', tx: null };
    await dispatch([], ctx);
    expect(mockHandler).not.toHaveBeenCalled();
  });
});
