// Phase 8 — Path 2: Mandatory escalation (per WO-304.2.b).
//
// Drives an Employee Relations conversation in which the employee
// mentions harassment based on a protected class (system.md Rule 6 (a)
// trigger). Verifies Taylor surfaces the escalation, emits TRIAGE_RECORD
// with escalation_flag = true, and the handler persists with
// conversations.status flipping to 'complete' per gold vision §9 (default
// ESCALATION_IS_TERMINAL = false; 'complete' transition fires
// unconditionally on persistence; 'escalated' transition does not fire
// because the variant constant is false; tie-break does not engage).
//
// Asserts:
//   - response.status flips to 'complete' on the marker-emit turn
//   - exactly one row in triage_records scoped to DEMO_OWNER_ID
//   - record.escalation_flag === true (the discriminating Path 2 assertion)
//   - all eight marker fields conform to §9 enums and constraints
//   - raw_marker JSONB contains the eight fields (audit trail intact)
//   - conversations.status === 'complete'
//
// No §10 log-capture assertion — Path 1 carries that solo per WO-304.2.a
// Design Decision 6.
//
// Cleanup: afterEach runs deleteByOwner(DEMO_OWNER_ID) against the
// isolated test DB (per gold vision §11; build plan §Phase 8).

import {
  describe,
  it,
  beforeAll,
  afterEach,
  afterAll,
  expect,
} from 'vitest';
import { startTestServer } from './helpers/server.js';
import { getPool, deleteByOwner, closePool } from './helpers/db.js';
import { runConversation } from './helpers/conversation.js';

// Hardcoded in src/backend/app.js identityStub (per gold vision §10 item 11).
// Tests share this owner_id; isolation comes from the test DB and serial
// file execution (per build plan §Phase 8).
const DEMO_OWNER_ID = '00000000-0000-0000-0000-000000000001';

// Path 2 user prompt script — protected-class harassment trigger.
// Per system.md Rule 6 (a): harassment or discrimination based on a
// protected class. Build plan §Phase 8: "mention harassment based on a
// protected class". Religion is a protected class under Title VII and
// state frameworks. The seventh turn explicitly answers Taylor's likely
// "do you want immediate escalation now?" question (per Rule 6 prose)
// so Taylor closes the intake on that turn rather than continuing to
// gather. Authored at draft time per build-discovery D14 (canon silent
// on candidate prompts).
const USER_MESSAGES = [
  "Hi. I want to report something that's been happening at work.",
  "My supervisor has been making comments about my religion. He keeps making jokes about my faith in front of the team and asking why I 'have to be so different.' It's been going on for about three months.",
  "Last week, after I asked him to stop, he told me in a private meeting that I'd be 'a better fit on a different team' if I couldn't take a joke. I think he's targeting me because I'm Muslim.",
  "Yes, two coworkers have heard the comments. One of them, Sarah, told me she was uncomfortable hearing them. The other was in the meeting last week when he made the 'better fit' remark.",
  "I have Slack messages from him in a group channel making similar comments. I can pull those up.",
  "I'd like this taken seriously. I don't want to be moved off the team — I want the comments to stop.",
  "Yes, please escalate it now. My name can be on the report — I'm not asking to be anonymous.",
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

describe('Phase 8 — Path 2: Mandatory escalation', () => {
  let server;

  beforeAll(async () => {
    server = await startTestServer();
  });

  afterAll(async () => {
    await server.close();
    await closePool();
  });

  afterEach(async () => {
    await deleteByOwner(DEMO_OWNER_ID);
  });

  it('persists one TRIAGE_RECORD with escalation_flag=true and flips conversation status to complete', async () => {
    const result = await runConversation(server.baseUrl, USER_MESSAGES);

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
    // Discriminating Path 2 assertion — Rule 6 fired.
    expect(record.escalation_flag).toBe(true);
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
    // Per gold vision §9 + handlers/triage-record.js: with
    // ESCALATION_IS_TERMINAL = false (Employee Relations variant default),
    // the active → complete transition fires unconditionally on
    // persistence; the active → escalated transition does not fire
    // because the variant constant is false; tie-break does not engage.
    const convRows = await pool.query(
      'SELECT status FROM conversations WHERE id = $1 AND owner_id = $2',
      [result.conversationId, DEMO_OWNER_ID]
    );
    expect(convRows.rowCount).toBe(1);
    expect(convRows.rows[0].status).toBe('complete');
  });
});
