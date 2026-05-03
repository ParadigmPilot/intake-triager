// Phase 8 — Path 1: Standard intake (per WO-304.2.a).
//
// Drives a routine Employee Relations conversation through Taylor
// (temperature: 0 via E2E_TEMPERATURE), asserts the canonical
// active → complete happy path per gold vision §6, §9, §10, §11.
//
// Asserts:
//   - response.status flips to 'complete' on the marker-emit turn
//   - exactly one row in triage_records scoped to DEMO_OWNER_ID
//   - all eight marker fields conform to §9 enums and constraints
//   - escalation_flag === false
//   - raw_marker JSONB contains the eight fields (audit trail intact)
//   - conversations.status === 'complete'
//   - at least one stdout line is a JSON event per §10 (timestamp,
//     level, event, conversation_id, owner_id) — emitted by
//     src/backend/observability.js (WO-304.2.0)
//
// Cleanup: afterEach runs deleteByOwner(DEMO_OWNER_ID) against the
// isolated test DB (per gold vision §11; build plan §Phase 8).

import {
  describe,
  it,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  expect,
} from 'vitest';
import { startTestServer } from './helpers/server.js';
import { getPool, deleteByOwner, closePool } from './helpers/db.js';
import { runConversation } from './helpers/conversation.js';
import { startLogCapture } from './helpers/log-capture.js';

// Hardcoded in src/backend/app.js identityStub (per gold vision §10 item 11).
// Tests share this owner_id; isolation comes from the test DB and serial
// file execution (per build plan §Phase 8).
const DEMO_OWNER_ID = '00000000-0000-0000-0000-000000000001';

// Path 1 user prompt script — routine workplace concern.
// Scheduling-conflict / management issue. No protected-class trigger
// (no Rule 6); no crisis-end trigger (no Rule 7). Authored at draft time
// per build-discovery D14 (canon silent on candidate prompts).
const USER_MESSAGES = [
  "Hi. I'd like to report an ongoing issue with my manager around scheduling.",
  "I work the late shift on Thursdays — I'm off at midnight. My manager keeps scheduling our team meeting at 9am Friday morning even though he knows my shift. It's been happening for the past two months.",
  "When I bring it up he says 9am is the only time the whole team can meet. But two other teammates miss it regularly and there's never an issue raised about them.",
  "It's happened roughly eight times since early September. I've raised it directly with him in our weekly 1:1 — twice. Once in early October, once last week.",
  "No witnesses to those conversations — they were 1:1s. I do have my Slack message from October asking if we could move the meeting time.",
  "I'd like this routed so someone neutral can look at the pattern. I'm not asking for anything dramatic — just fair scheduling treatment relative to the rest of the team.",
  "Yes, my name can be on the report. I'm not asking to be anonymous.",
];

const VALID_SEVERITY = ['low', 'medium', 'high', 'urgent'];
const VALID_CATEGORY = [
  'interpersonal_conflict',
  'harassment_or_discrimination',
  'policy_violation',
  'safety_concern',
  'working_conditions',
  'management_issue',
  'retaliation',
  'other',
];
const VALID_OWNER = [
  'HR_Partner',
  'Legal',
  'Compliance',
  'Manager_Chain',
  'Executive',
];
const VALID_TIMELINE = [
  'immediate',
  '48_hours',
  '1_week',
  '2_weeks',
  'standard',
];
const VALID_CONFIDENTIALITY = ['standard', 'sensitive', 'executive_only'];

describe('Phase 8 — Path 1: Standard intake', () => {
  let server;
  let logCapture;

  beforeAll(async () => {
    server = await startTestServer();
  });

  afterAll(async () => {
    await server.close();
    await closePool();
  });

  beforeEach(() => {
    logCapture = startLogCapture();
  });

  afterEach(async () => {
    if (logCapture) {
      logCapture.stop();
      logCapture = null;
    }
    await deleteByOwner(DEMO_OWNER_ID);
  });

  it('persists one TRIAGE_RECORD with eight marker fields and flips conversation status to complete', async () => {
    const result = await runConversation(server.baseUrl, USER_MESSAGES);

    // Capture logs before any later assertion can throw.
    const capturedLines = logCapture.stop();
    logCapture = null;

    expect(result.lastStatus).toBe('complete');
    expect(result.conversationId).toBeTruthy();

    const pool = getPool();

    // Exactly one triage_records row, owner-scoped.
    const triageRows = await pool.query(
      'SELECT * FROM triage_records WHERE owner_id = $1',
      [DEMO_OWNER_ID]
    );
    expect(triageRows.rowCount).toBe(1);

    const record = triageRows.rows[0];
    expect(VALID_SEVERITY).toContain(record.severity);
    expect(VALID_CATEGORY).toContain(record.category);
    expect(VALID_OWNER).toContain(record.suggested_owner);
    expect(VALID_TIMELINE).toContain(record.required_timeline);
    expect(typeof record.summary).toBe('string');
    expect(record.summary.length).toBeGreaterThan(0);
    expect(record.summary.length).toBeLessThanOrEqual(160);
    expect(record.escalation_flag).toBe(false);
    expect(VALID_CONFIDENTIALITY).toContain(record.confidentiality_level);
    expect(typeof record.anonymous).toBe('boolean');

    // raw_marker JSONB intact — eight fields preserved as audit trail.
    expect(record.raw_marker).toMatchObject({
      severity: record.severity,
      category: record.category,
      suggested_owner: record.suggested_owner,
      required_timeline: record.required_timeline,
      summary: record.summary,
      escalation_flag: record.escalation_flag,
      confidentiality_level: record.confidentiality_level,
      anonymous: record.anonymous,
    });

    // conversations.status flipped to 'complete'.
    const convRows = await pool.query(
      'SELECT status FROM conversations WHERE id = $1 AND owner_id = $2',
      [result.conversationId, DEMO_OWNER_ID]
    );
    expect(convRows.rowCount).toBe(1);
    expect(convRows.rows[0].status).toBe('complete');

    // Gold vision §10 — JSON one-line-per-event observability.
    // At least one captured stdout line must parse as JSON and carry
    // timestamp, level, event, conversation_id, and owner_id.
    // (Emitted by src/backend/observability.js per WO-304.2.0.)
    const events = capturedLines
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    expect(
      events.some(
        (e) =>
          e.timestamp &&
          e.level &&
          e.event &&
          e.conversation_id &&
          e.owner_id
      )
    ).toBe(true);
  });
});
