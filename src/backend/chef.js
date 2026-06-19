// Chef — SDK bridge to api.anthropic.com (The Line)
//
// Per intake-triager-gold-vision.md v1.5 §4 *Chef public API*.
// Single-call wrapper around @anthropic-ai/sdk Messages API, with bounded
// retry on transient upstream failures (WO-316.5b — "Premature close").
// Streamed via messages.stream().finalMessage() (WO-316.5c): bytes flow
// continuously so a long, otherwise-silent request is not dropped mid-body by an
// idle-connection timeout in the network path ("Premature close"). Resolves to
// the same complete Message → unchanged {text, usage}. Reads MODEL from env
// (default claude-sonnet-4-20250514).
// Takes the array from assemblePrompt; returns {text, usage}.
//
// Briefing array shape: [{role: 'system', content}, {role, content}, ...]
// SDK call shape: messages.create({model, max_tokens, system, messages})
// Chef reshapes Briefing → SDK; pulls the system message out, passes the
// rest as `messages`.

import Anthropic from '@anthropic-ai/sdk';
import { log } from './observability.js';

// maxRetries: 0 — Chef owns retry explicitly (the loop in cook below) so retry
// behavior is deterministic and observable, rather than split between the SDK's
// built-in retry and ours. The SDK does NOT retry a response whose body closes
// mid-read — a 200 was received, then the socket dropped ("Premature close") —
// which is the transient that fails turns on the free instance (WO-316.5b).
const client = new Anthropic({ maxRetries: 0 });
const MODEL = process.env.MODEL ?? 'claude-sonnet-4-20250514';
const MAX_TOKENS = 4096;

// Bounded retry for transient upstream failures. The free Render instance drops
// the Anthropic connection mid-body intermittently; a single retry almost always
// succeeds. Retry ONLY transient faults — never 4xx client errors (bad request,
// auth), which will not change on a retry.
const MAX_ATTEMPTS = 3;
const RETRY_BACKOFF_MS = 500;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isTransient(err) {
  const status = err?.status;
  if (status === 429 || (status >= 500 && status <= 599)) return true;
  const message = `${err?.message ?? ''} ${err?.cause?.message ?? ''}`.toLowerCase();
  return [
    'premature close',
    'econnreset',
    'socket hang up',
    'terminated',
    'fetch failed',
    'etimedout',
    'timeout',
  ].some((needle) => message.includes(needle));
}
const E2E_TEMPERATURE = process.env.E2E_TEMPERATURE !== undefined
  ? Number(process.env.E2E_TEMPERATURE)
  : undefined;

export async function cook(briefing) {
  const systemMessage = briefing.find((m) => m.role === 'system');
  const messages = briefing.filter((m) => m.role !== 'system');

  const request = {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemMessage?.content,
    messages,
  };
  if (E2E_TEMPERATURE !== undefined) request.temperature = E2E_TEMPERATURE;

  let response;
  for (let attempt = 1; ; attempt += 1) {
    try {
      response = await client.messages.stream(request).finalMessage();
      break;
    } catch (err) {
      if (attempt >= MAX_ATTEMPTS || !isTransient(err)) throw err;
      log({
        level: 'warn',
        event: 'anthropic_retry',
        attempt,
        error: err.message,
      });
      await sleep(RETRY_BACKOFF_MS * attempt);
    }
  }

  const text = response.content[0].text;
  const usage = {
    input_tokens: response.usage.input_tokens,
    output_tokens: response.usage.output_tokens,
  };
  return { text, usage };
}

export default { cook };
