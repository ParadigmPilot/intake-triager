// Briefing unit tests
//
// Per intake-triager-build-plan.md §Phase 3 *Gate*: "Assembler
// substitutes placeholders correctly in isolation (unit test passes)."
// Per gold vision §11: test/prompt-assembler.test.js is in-scope.

import { describe, it, expect } from 'vitest';
import { assemblePrompt } from '../src/backend/prompt-assembler.js';

const placeholders = {
  TODAY: '2026-04-29',
  ORG_NAME: 'Acme Corp',
  CRISIS_LINE: '988',
};

describe('assemblePrompt', () => {
  it('returns an array starting with a system message', () => {
    const result = assemblePrompt({ placeholders, history: [] });
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].role).toBe('system');
    expect(typeof result[0].content).toBe('string');
  });

  it('substitutes {{TODAY}}, {{ORG_NAME}}, {{CRISIS_LINE}} placeholders', () => {
    const result = assemblePrompt({ placeholders, history: [] });
    const systemContent = result[0].content;
    expect(systemContent).toContain('2026-04-29');
    expect(systemContent).toContain('Acme Corp');
    expect(systemContent).toContain('988');
    expect(systemContent).not.toContain('{{TODAY}}');
    expect(systemContent).not.toContain('{{ORG_NAME}}');
    expect(systemContent).not.toContain('{{CRISIS_LINE}}');
  });

  it('leaves unknown placeholders in place', () => {
    const result = assemblePrompt({
      placeholders: { TODAY: '2026-04-29' },
      history: [],
    });
    const systemContent = result[0].content;
    expect(systemContent).toContain('{{ORG_NAME}}');
    expect(systemContent).toContain('{{CRISIS_LINE}}');
  });

  it('appends history after the system message in order', () => {
    const history = [
      { role: 'user', content: 'Hello.' },
      { role: 'assistant', content: 'Hi, how can I help?' },
      { role: 'user', content: 'I need to report something.' },
    ];
    const result = assemblePrompt({ placeholders, history });
    expect(result.length).toBe(4);
    expect(result[1]).toEqual({ role: 'user', content: 'Hello.' });
    expect(result[2]).toEqual({ role: 'assistant', content: 'Hi, how can I help?' });
    expect(result[3]).toEqual({ role: 'user', content: 'I need to report something.' });
  });

  it('strips extra fields from history rows (keeps only role + content)', () => {
    const history = [
      { id: 1, role: 'user', content: 'Hi.', token_usage: null, created_at: new Date() },
    ];
    const result = assemblePrompt({ placeholders, history });
    expect(result[1]).toEqual({ role: 'user', content: 'Hi.' });
    expect(Object.keys(result[1]).sort()).toEqual(['content', 'role']);
  });

  it('handles empty history without error', () => {
    const result = assemblePrompt({ placeholders, history: [] });
    expect(result.length).toBe(1);
    expect(result[0].role).toBe('system');
  });
});
