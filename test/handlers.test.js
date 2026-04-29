// TRIAGE_RECORD handler unit tests
//
// Per intake-triager-build-plan.md §Phase 4 *Gate*:
//   • handler persists a record + flips status atomically
// Per gold vision §11: test/handlers.test.js is in-scope.
//
// pantry is mocked: real pantry imports pg and opens a Pool at module
// load. Mocking keeps this a pure unit test. Atomicity (the same tx
// reaching both Pantry calls) is asserted by checking the tx argument.

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/backend/pantry.js', () => ({
  default: {
    insertTriageRecord: vi.fn(),
    setConversationStatus: vi.fn(),
  },
}));

import pantry from '../src/backend/pantry.js';
import triageRecord from '../src/backend/handlers/triage-record.js';

const validPayload = {
  severity: 'medium',
  category: 'interpersonal_conflict',
  suggested_owner: 'HR_Partner',
  required_timeline: '1_week',
  summary: 'Coworker dispute over project ownership.',
  escalation_flag: false,
  confidentiality_level: 'standard',
  anonymous: false,
};

const ctx = {
  conversation_id: '00000000-0000-0000-0000-00000000000a',
  owner_id: '00000000-0000-0000-0000-000000000001',
  tx: { _sentinel: 'tx-handle' },
};

describe('triage-record handler — happy path', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('persists the record with all eight schema fields plus raw_marker', async () => {
    await triageRecord(validPayload, ctx);
    expect(pantry.insertTriageRecord).toHaveBeenCalledTimes(1);
    const [record, txArg] = pantry.insertTriageRecord.mock.calls[0];
    expect(record).toMatchObject({
      conversation_id: ctx.conversation_id,
      owner_id: ctx.owner_id,
      severity: 'medium',
      category: 'interpersonal_conflict',
      suggested_owner: 'HR_Partner',
      required_timeline: '1_week',
      summary: validPayload.summary,
      escalation_flag: false,
      confidentiality_level: 'standard',
      anonymous: false,
    });
    expect(record.raw_marker).toBe(JSON.stringify(validPayload));
    expect(txArg).toBe(ctx.tx);
  });

  it('flips conversation status to complete when escalation_flag=false', async () => {
    await triageRecord(validPayload, ctx);
    expect(pantry.setConversationStatus).toHaveBeenCalledTimes(1);
    expect(pantry.setConversationStatus).toHaveBeenCalledWith(
      ctx.conversation_id,
      'complete',
      ctx.owner_id,
      ctx.tx
    );
  });

  it('flips status to complete even when escalation_flag=true (ESCALATION_IS_TERMINAL=false)', async () => {
    await triageRecord({ ...validPayload, escalation_flag: true }, ctx);
    expect(pantry.setConversationStatus).toHaveBeenCalledWith(
      ctx.conversation_id,
      'complete',
      ctx.owner_id,
      ctx.tx
    );
  });

  it('passes the same tx to both Pantry calls (atomicity contract)', async () => {
    await triageRecord(validPayload, ctx);
    const insertTx = pantry.insertTriageRecord.mock.calls[0][1];
    const statusTx = pantry.setConversationStatus.mock.calls[0][3];
    expect(insertTx).toBe(ctx.tx);
    expect(statusTx).toBe(ctx.tx);
    expect(insertTx).toBe(statusTx);
  });
});

describe('triage-record handler — validation failures', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws on invalid severity', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(
      triageRecord({ ...validPayload, severity: 'bogus' }, ctx)
    ).rejects.toThrow('TRIAGE_RECORD validation failed');
    expect(pantry.insertTriageRecord).not.toHaveBeenCalled();
    expect(pantry.setConversationStatus).not.toHaveBeenCalled();
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('throws on invalid category', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(
      triageRecord({ ...validPayload, category: 'unknown_thing' }, ctx)
    ).rejects.toThrow();
    errSpy.mockRestore();
  });

  it('throws when summary exceeds 160 chars', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(
      triageRecord({ ...validPayload, summary: 'x'.repeat(161) }, ctx)
    ).rejects.toThrow();
    expect(pantry.insertTriageRecord).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('throws when a required field is missing', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { severity, ...incomplete } = validPayload;
    await expect(triageRecord(incomplete, ctx)).rejects.toThrow();
    errSpy.mockRestore();
  });

  it('throws when escalation_flag is not a boolean', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(
      triageRecord({ ...validPayload, escalation_flag: 'true' }, ctx)
    ).rejects.toThrow();
    errSpy.mockRestore();
  });

  it('throws when payload is null', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(triageRecord(null, ctx)).rejects.toThrow();
    errSpy.mockRestore();
  });
});
