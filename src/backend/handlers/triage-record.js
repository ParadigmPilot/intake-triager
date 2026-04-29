// TRIAGE_RECORD handler
//
// Per intake-triager-gold-vision.md v1.5:
//   §9 TRIAGE_RECORD marker — eight-field schema validation
//   §9 Conversation status transitions — atomic persist + status flip
//   §9 Tie-break — when both 'escalated' and 'complete' would fire,
//      escalated wins
//   §4 Pantry public API — insertTriageRecord(record, tx),
//      setConversationStatus(conversation_id, status, owner_id, tx)
//
// The route layer (Phase 6) wraps the dispatch call in
// pantry.transaction(async (tx) => …) and passes tx through ctx.
// This handler is transaction-aware but transaction-agnostic — both
// Pantry calls receive the tx from ctx, so persist + status flip are
// atomic when the route layer commits the transaction.

import pantry from '../pantry.js';

// Per-variant terminal constant. Default false (Employee Relations
// variant per §3). When false, escalation_flag=true does NOT terminate
// the conversation — the record persists, conversation transitions to
// 'complete'. When true, see §9 tie-break: 'escalated' wins.
const ESCALATION_IS_TERMINAL = false;

// Allowed enum values per §9 field schema.
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
const VALID_TIMELINE = ['immediate', '48_hours', '1_week', '2_weeks', 'standard'];
const VALID_CONFIDENTIALITY = ['standard', 'sensitive', 'executive_only'];

function validate(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') {
    return ['payload is not an object'];
  }
  if (!VALID_SEVERITY.includes(payload.severity)) {
    errors.push(`invalid severity: ${payload.severity}`);
  }
  if (!VALID_CATEGORY.includes(payload.category)) {
    errors.push(`invalid category: ${payload.category}`);
  }
  if (!VALID_OWNER.includes(payload.suggested_owner)) {
    errors.push(`invalid suggested_owner: ${payload.suggested_owner}`);
  }
  if (!VALID_TIMELINE.includes(payload.required_timeline)) {
    errors.push(`invalid required_timeline: ${payload.required_timeline}`);
  }
  if (typeof payload.summary !== 'string' || payload.summary.length === 0) {
    errors.push('summary missing or not a string');
  } else if (payload.summary.length > 160) {
    errors.push(`summary exceeds 160 chars (${payload.summary.length})`);
  }
  if (typeof payload.escalation_flag !== 'boolean') {
    errors.push('escalation_flag is not a boolean');
  }
  if (!VALID_CONFIDENTIALITY.includes(payload.confidentiality_level)) {
    errors.push(`invalid confidentiality_level: ${payload.confidentiality_level}`);
  }
  if (typeof payload.anonymous !== 'boolean') {
    errors.push('anonymous is not a boolean');
  }
  return errors;
}

export default async function triageRecord(payload, ctx) {
  const { conversation_id, owner_id, tx } = ctx;

  const errors = validate(payload);
  if (errors.length > 0) {
    console.error(
      `triage-record handler: validation failed for conversation ${conversation_id}. ` +
      `Errors: ${errors.join('; ')}. Raw: ${JSON.stringify(payload)}`
    );
    throw new Error('TRIAGE_RECORD validation failed');
  }

  // Tie-break per §9: 'escalated' wins when both states would fire.
  // With ESCALATION_IS_TERMINAL=false (this variant), result is always 'complete'.
  const status =
    ESCALATION_IS_TERMINAL && payload.escalation_flag ? 'escalated' : 'complete';

  await pantry.insertTriageRecord(
    {
      conversation_id,
      owner_id,
      severity: payload.severity,
      category: payload.category,
      suggested_owner: payload.suggested_owner,
      required_timeline: payload.required_timeline,
      summary: payload.summary,
      escalation_flag: payload.escalation_flag,
      confidentiality_level: payload.confidentiality_level,
      anonymous: payload.anonymous,
      raw_marker: JSON.stringify(payload),
    },
    tx
  );

  await pantry.setConversationStatus(conversation_id, status, owner_id, tx);
}
