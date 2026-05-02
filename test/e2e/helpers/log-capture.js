// Stdout log capture for Phase 8 E2E observability assertion (per WO-304.2.a).
// Patches process.stdout.write to a buffer; stop() returns captured non-empty
// lines and reverts the patch. Used to verify gold vision §10 — JSON
// one-line-per-event with timestamp, level, event, conversation_id, owner_id —
// emitted by src/backend/observability.js (per WO-304.2.0).
//
// Process-singleton patch: safe because vitest.e2e.config.js sets
// fileParallelism: false (per WO Design Decision 2 — serial test-file execution).
//
// Usage:
//   const capture = startLogCapture();
//   // ... run code that emits logs ...
//   const lines = capture.stop();
//   const events = lines
//     .map((line) => { try { return JSON.parse(line); } catch { return null; } })
//     .filter(Boolean);
//   expect(events.some((e) => e.timestamp && e.level && e.event)).toBe(true);

export function startLogCapture() {
  const lines = [];
  const original = process.stdout.write.bind(process.stdout);

  process.stdout.write = (chunk, encoding, callback) => {
    const str =
      typeof chunk === 'string' ? chunk : chunk.toString(encoding || 'utf8');
    str.split('\n').forEach((line) => {
      if (line.trim().length > 0) lines.push(line);
    });
    return original(chunk, encoding, callback);
  };

  return {
    stop() {
      process.stdout.write = original;
      return lines.slice();
    },
  };
}
