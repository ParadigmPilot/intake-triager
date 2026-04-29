// Expediter — response parser, marker extractor, dispatcher
//
// Per intake-triager-gold-vision.md v1.5:
//   §4 Expediter public API — parse, dispatch, handler registry
//   §9 TRIAGE_RECORD marker — literal syntax <!-- TRIAGE_RECORD:{...} -->,
//      whitespace and line breaks inside JSON tolerated
//   §9 Chef-output failure modes — three modes:
//      • no marker → strip nothing, return prose, conversation stays active
//      • marker emitted but JSON malformed → strip marker, log, do not
//        include in markers array; route layer surfaces generic error
//      • two or more markers in one reply → first-of-type wins; subsequent
//        same-type markers logged as anomalies and skipped
//   §9 Marker protocol is extensible — new types register in `handlers`
//      below + add a [MARKER PROTOCOL] clause to system.md.

import triageRecord from './handlers/triage-record.js';

// Handler registry. Add new marker types here.
const handlers = {
  TRIAGE_RECORD: triageRecord,
};

// Match <!-- TYPE:JSON --> where TYPE is uppercase alphanumeric + underscore.
// [\s\S]*? tolerates whitespace and newlines inside the JSON per §9.
// Lazy match ensures multiple markers in one reply do not merge.
const MARKER_RE = /<!--\s*([A-Z][A-Z0-9_]*)\s*:\s*([\s\S]*?)\s*-->/g;

export function parse(reply) {
  const markers = [];
  const seenTypes = new Set();
  let prose = reply;

  const matches = [...reply.matchAll(MARKER_RE)];

  for (const match of matches) {
    const [fullMatch, type, jsonText] = match;

    // Always strip marker bytes from prose, regardless of parse success.
    prose = prose.replace(fullMatch, '');

    // Multi-marker rule: first-of-type wins; log subsequent anomalies.
    if (seenTypes.has(type)) {
      console.warn(
        `Expediter: duplicate marker type ${type} ignored. Raw: ${fullMatch}`
      );
      continue;
    }
    seenTypes.add(type);

    // Attempt JSON parse. Malformed → log, do not include in markers.
    let payload;
    try {
      payload = JSON.parse(jsonText);
    } catch (err) {
      console.error(
        `Expediter: malformed JSON for marker ${type}. ` +
        `Error: ${err.message}. Raw: ${fullMatch}`
      );
      continue;
    }

    markers.push({ type, payload });
  }

  return { prose: prose.trim(), markers };
}

export async function dispatch(markers, ctx) {
  for (const marker of markers) {
    const handler = handlers[marker.type];
    if (!handler) {
      console.warn(
        `Expediter: no handler registered for marker type ${marker.type}`
      );
      continue;
    }
    await handler(marker.payload, ctx);
  }
}

export default { parse, dispatch };
