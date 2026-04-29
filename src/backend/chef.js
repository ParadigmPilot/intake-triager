// Chef — SDK bridge to api.anthropic.com (The Line)
//
// Per intake-triager-gold-vision.md v1.5 §4 *Chef public API*.
// Single-call wrapper around @anthropic-ai/sdk Messages API.
// Non-streaming. Reads MODEL from env (default claude-sonnet-4-20250514).
// Takes the array from assemblePrompt; returns {text, usage}.
//
// Briefing array shape: [{role: 'system', content}, {role, content}, ...]
// SDK call shape: messages.create({model, max_tokens, system, messages})
// Chef reshapes Briefing → SDK; pulls the system message out, passes the
// rest as `messages`.

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();
const MODEL = process.env.MODEL ?? 'claude-sonnet-4-20250514';
const MAX_TOKENS = 4096;

export async function cook(briefing) {
  const systemMessage = briefing.find((m) => m.role === 'system');
  const messages = briefing.filter((m) => m.role !== 'system');

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemMessage?.content,
    messages,
  });

  const text = response.content[0].text;
  const usage = {
    input_tokens: response.usage.input_tokens,
    output_tokens: response.usage.output_tokens,
  };
  return { text, usage };
}

export default { cook };
