// Single producer of structured backend logs per gold vision §10.
//
// JSON one-line-per-event to stdout. Required fields per §10:
//   timestamp, level, event, conversation_id (when applicable),
//   owner_id (when applicable), error (when level is 'error').
//
// Caller passes { level, event, ...fields }. timestamp is added here in
// ISO-8601 UTC. Caller is responsible for including conversation_id and
// owner_id where applicable, and error on error-level events.
//
// All levels write to stdout (not stderr) per gold vision §10. There is
// no level filter; single-instance teaching code emits everything the
// code calls log() for. Production-grade observability — metrics,
// tracing, log aggregation — is taught in *Implementing Standards for
// LLM Apps* per §11 *Non-goals*.
//
// Discipline: this module is the SINGLE producer of structured backend
// logs. Anything else writing to stdout violates §10 and is a candidate
// for the broader §4 *Repo structure* sweep tracked in build-discovery
// D15 / Phase 9.D.

export function log({ level, event, ...fields }) {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...fields,
  });
  process.stdout.write(line + '\n');
}
