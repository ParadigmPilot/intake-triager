// Vitest unit suite for src/backend/security/cost-ceiling.js.
// Mocks pantry to isolate checkCostCeiling's arithmetic and env handling.

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/backend/pantry.js', () => ({
  default: {
    sumConversationOutputTokens: vi.fn(),
  },
}));

import pantry from '../src/backend/pantry.js';
import { checkCostCeiling } from '../src/backend/security/cost-ceiling.js';

const CONV_ID = '00000000-0000-0000-0000-000000000aaa';
const OWNER_ID = '00000000-0000-0000-0000-000000000001';

describe('checkCostCeiling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CONVERSATION_TOKEN_CEILING = '1000';
  });

  it('returns exceeded=false when sum is below the ceiling', async () => {
    pantry.sumConversationOutputTokens.mockResolvedValue(500);
    const result = await checkCostCeiling({
      conversation_id: CONV_ID,
      owner_id: OWNER_ID,
    });
    expect(result).toEqual({ sum: 500, ceiling: 1000, exceeded: false });
  });

  it('returns exceeded=true when sum equals the ceiling (boundary)', async () => {
    pantry.sumConversationOutputTokens.mockResolvedValue(1000);
    const result = await checkCostCeiling({
      conversation_id: CONV_ID,
      owner_id: OWNER_ID,
    });
    expect(result.exceeded).toBe(true);
  });

  it('returns exceeded=true when sum exceeds the ceiling', async () => {
    pantry.sumConversationOutputTokens.mockResolvedValue(1500);
    const result = await checkCostCeiling({
      conversation_id: CONV_ID,
      owner_id: OWNER_ID,
    });
    expect(result.exceeded).toBe(true);
  });

  it('returns exceeded=false for empty conversations (sum=0)', async () => {
    pantry.sumConversationOutputTokens.mockResolvedValue(0);
    const result = await checkCostCeiling({
      conversation_id: CONV_ID,
      owner_id: OWNER_ID,
    });
    expect(result).toEqual({ sum: 0, ceiling: 1000, exceeded: false });
  });

  it('uses default ceiling (200000) when env var unset', async () => {
    delete process.env.CONVERSATION_TOKEN_CEILING;
    pantry.sumConversationOutputTokens.mockResolvedValue(199999);
    const below = await checkCostCeiling({
      conversation_id: CONV_ID,
      owner_id: OWNER_ID,
    });
    expect(below).toEqual({ sum: 199999, ceiling: 200000, exceeded: false });

    pantry.sumConversationOutputTokens.mockResolvedValue(200000);
    const at = await checkCostCeiling({
      conversation_id: CONV_ID,
      owner_id: OWNER_ID,
    });
    expect(at.exceeded).toBe(true);
  });

  it('falls back to default when env var is invalid', async () => {
    process.env.CONVERSATION_TOKEN_CEILING = 'not-a-number';
    pantry.sumConversationOutputTokens.mockResolvedValue(199999);
    const result = await checkCostCeiling({
      conversation_id: CONV_ID,
      owner_id: OWNER_ID,
    });
    expect(result.ceiling).toBe(200000);
    expect(result.exceeded).toBe(false);
  });

  it('forwards conversation_id, owner_id, and tx to pantry', async () => {
    pantry.sumConversationOutputTokens.mockResolvedValue(0);
    const fakeTx = { _marker: 'tx' };
    await checkCostCeiling({
      conversation_id: CONV_ID,
      owner_id: OWNER_ID,
      tx: fakeTx,
    });
    expect(pantry.sumConversationOutputTokens).toHaveBeenCalledWith(
      CONV_ID,
      OWNER_ID,
      fakeTx
    );
  });

  it('passes tx=null to pantry when tx is omitted', async () => {
    pantry.sumConversationOutputTokens.mockResolvedValue(0);
    await checkCostCeiling({
      conversation_id: CONV_ID,
      owner_id: OWNER_ID,
    });
    expect(pantry.sumConversationOutputTokens).toHaveBeenCalledWith(
      CONV_ID,
      OWNER_ID,
      null
    );
  });
});
