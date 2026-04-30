// Vitest unit suite for src/backend/converse.js — POST /converse handler.
//
// All collaborators are mocked. The suite covers eight behaviors per
// gold vision §4 + §10:
//   1. First turn (no conversation_id) — mints a UUID
//   2. Continuation — reuses provided id
//   3. Cost-ceiling breach — 429 TOKEN_CEILING_EXCEEDED before Chef
//   4. Successful turn (no markers) — assistant append + empty dispatch
//   5. Successful turn (TRIAGE_RECORD) — status flips to 'complete'
//   6. Handler exception inside transaction — 500 INTERNAL_ERROR
//   7. Prompt-injection isolation applied to history before assembly
//   8. Trusted-context placeholders {TODAY, ORG_NAME, CRISIS_LINE}
//
// The "assistant append rolled back" property of test 6 is a real-DB
// consequence of pantry.transaction's BEGIN/ROLLBACK; here we assert
// the handler-side observable: 500 + INTERNAL_ERROR + log.

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/backend/pantry.js', () => ({
  default: {
    insertConversation: vi.fn(),
    appendMessage: vi.fn(),
    loadMessages: vi.fn(),
    transaction: vi.fn(),
  },
}));

vi.mock('../src/backend/chef.js', () => ({
  cook: vi.fn(),
}));

vi.mock('../src/backend/expediter.js', () => ({
  parse: vi.fn(),
  dispatch: vi.fn(),
}));

vi.mock('../src/backend/prompt-assembler.js', () => ({
  assemblePrompt: vi.fn(),
}));

vi.mock('../src/backend/security/prompt-injection.js', () => ({
  isolateHistory: vi.fn(),
}));

vi.mock('../src/backend/security/cost-ceiling.js', () => ({
  checkCostCeiling: vi.fn(),
}));

import pantry from '../src/backend/pantry.js';
import { cook } from '../src/backend/chef.js';
import { parse, dispatch } from '../src/backend/expediter.js';
import { assemblePrompt } from '../src/backend/prompt-assembler.js';
import { isolateHistory } from '../src/backend/security/prompt-injection.js';
import { checkCostCeiling } from '../src/backend/security/cost-ceiling.js';
import converse from '../src/backend/converse.js';

const OWNER_ID = '00000000-0000-0000-0000-000000000001';

function makeReq(body = {}) {
  return { user: { id: OWNER_ID }, body };
}

function makeRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  res.headersSent = false;
  return res;
}

function setHappyPath() {
  pantry.insertConversation.mockResolvedValue({ id: 'minted-conv-id' });
  pantry.appendMessage.mockResolvedValue();
  pantry.loadMessages.mockResolvedValue([]);
  pantry.transaction.mockImplementation(async (cb) => {
    const tx = {
      query: vi.fn().mockResolvedValue({ rows: [{ status: 'active' }] }),
    };
    return await cb(tx);
  });
  checkCostCeiling.mockResolvedValue({
    sum: 0,
    ceiling: 200000,
    exceeded: false,
  });
  isolateHistory.mockImplementation((h) => h);
  assemblePrompt.mockReturnValue([{ role: 'system', content: 'sys' }]);
  cook.mockResolvedValue({
    text: 'hello back',
    usage: { input_tokens: 5, output_tokens: 10 },
  });
  parse.mockReturnValue({ prose: 'hello back', markers: [] });
  dispatch.mockResolvedValue();
}

describe('converse handler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setHappyPath();
    process.env.ORG_NAME = 'TestOrg';
    process.env.CRISIS_LINE = '988';
  });

  it('first turn — mints conversation_id and returns it in the response', async () => {
    const req = makeReq({ content: 'hi' });
    const res = makeRes();
    await converse(req, res);

    expect(pantry.insertConversation).toHaveBeenCalledTimes(1);
    expect(pantry.insertConversation).toHaveBeenCalledWith(OWNER_ID);
    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.conversation_id).toBe('minted-conv-id');
    expect(body.status).toBe('active');
    expect(body.reply).toEqual({ role: 'assistant', content: 'hello back' });
  });

  it('continuation — reuses the provided conversation_id; insertConversation not called', async () => {
    const req = makeReq({ content: 'follow-up', conversation_id: 'existing-id' });
    const res = makeRes();
    await converse(req, res);

    expect(pantry.insertConversation).not.toHaveBeenCalled();
    expect(pantry.loadMessages).toHaveBeenCalledWith('existing-id', OWNER_ID);
    const body = res.json.mock.calls[0][0];
    expect(body.conversation_id).toBe('existing-id');
  });

  it('cost-ceiling breach — 429 TOKEN_CEILING_EXCEEDED; cook + transaction skipped', async () => {
    checkCostCeiling.mockResolvedValue({
      sum: 200000,
      ceiling: 200000,
      exceeded: true,
    });
    const req = makeReq({ content: 'hi', conversation_id: 'existing-id' });
    const res = makeRes();
    await converse(req, res);

    expect(cook).not.toHaveBeenCalled();
    expect(pantry.transaction).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'TOKEN_CEILING_EXCEEDED', message: expect.any(String) },
    });
  });

  it('successful turn (no markers) — appends assistant with token_usage; dispatch called with []; status active', async () => {
    const req = makeReq({ content: 'hi', conversation_id: 'existing-id' });
    const res = makeRes();
    await converse(req, res);

    expect(pantry.appendMessage).toHaveBeenCalledTimes(2);
    const assistantCall = pantry.appendMessage.mock.calls.find(
      (c) => c[0].role === 'assistant'
    );
    expect(assistantCall[0]).toMatchObject({
      conversation_id: 'existing-id',
      role: 'assistant',
      content: 'hello back',
      token_usage: { input_tokens: 5, output_tokens: 10 },
      owner_id: OWNER_ID,
    });

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        conversation_id: 'existing-id',
        owner_id: OWNER_ID,
      })
    );

    const body = res.json.mock.calls[0][0];
    expect(body.status).toBe('active');
  });

  it('TRIAGE_RECORD marker — dispatch fires; response carries flipped status', async () => {
    const marker = { type: 'TRIAGE_RECORD', payload: { severity: 'high' } };
    parse.mockReturnValue({ prose: 'thanks', markers: [marker] });
    pantry.transaction.mockImplementation(async (cb) => {
      const tx = {
        query: vi.fn().mockResolvedValue({ rows: [{ status: 'complete' }] }),
      };
      return await cb(tx);
    });

    const req = makeReq({ content: 'reporting', conversation_id: 'existing-id' });
    const res = makeRes();
    await converse(req, res);

    expect(dispatch).toHaveBeenCalledWith(
      [marker],
      expect.objectContaining({ conversation_id: 'existing-id' })
    );
    const body = res.json.mock.calls[0][0];
    expect(body.status).toBe('complete');
  });

  it('handler exception inside transaction — 500 INTERNAL_ERROR; error logged', async () => {
    dispatch.mockImplementationOnce(() =>
      Promise.resolve().then(() => {
        throw new Error('handler boom');
      })
    );
    pantry.transaction.mockImplementation(async (cb) => {
      const tx = {
        query: vi.fn().mockResolvedValue({ rows: [{ status: 'active' }] }),
      };
      return await cb(tx);
    });
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const req = makeReq({ content: 'hi', conversation_id: 'existing-id' });
    const res = makeRes();
    await converse(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'INTERNAL_ERROR', message: expect.any(String) },
    });
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('prompt-injection isolation — assemblePrompt receives isolateHistory output as history', async () => {
    const raw = [
      { role: 'user', content: 'raw-user' },
      { role: 'assistant', content: 'raw-asst' },
    ];
    const isolated = [
      { role: 'user', content: '<user_message>\nraw-user\n</user_message>' },
      { role: 'assistant', content: 'raw-asst' },
    ];
    pantry.loadMessages.mockResolvedValue(raw);
    isolateHistory.mockReturnValue(isolated);

    const req = makeReq({ content: 'raw-user', conversation_id: 'existing-id' });
    const res = makeRes();
    await converse(req, res);

    expect(isolateHistory).toHaveBeenCalledWith(raw);
    expect(assemblePrompt).toHaveBeenCalledWith(
      expect.objectContaining({ history: isolated })
    );
  });

  it('trusted-context placeholders — TODAY (UTC YYYY-MM-DD), ORG_NAME, CRISIS_LINE from env', async () => {
    process.env.ORG_NAME = 'Acme Corp';
    process.env.CRISIS_LINE = '988';

    const req = makeReq({ content: 'hi', conversation_id: 'existing-id' });
    const res = makeRes();
    await converse(req, res);

    expect(assemblePrompt).toHaveBeenCalledWith(
      expect.objectContaining({
        placeholders: expect.objectContaining({
          TODAY: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          ORG_NAME: 'Acme Corp',
          CRISIS_LINE: '988',
        }),
      })
    );
  });
});
