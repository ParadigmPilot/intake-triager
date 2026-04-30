// Pantry — PostgreSQL access layer
//
// Per intake-triager-gold-vision.md v1.5 §4 *Pantry public API*.
// Seven public methods over the schema in src/db/schema.sql. Every public
// method (except `transaction` and `query`) takes a final optional `tx`
// parameter and routes through `tx` when present, the pool when absent.
// Every read/write that touches user-scoped data filters by `owner_id`
// per §10 item 10 (pattern, not enforcement).
//
// `query` is the lone exception — locked to migration code, no `tx`,
// no `owner_id`.

import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Internal: select tx (if present) or pool. Both expose .query(sql, params).
function _runner(tx) {
  return tx || pool;
}

async function insertConversation(owner_id, tx = null) {
  const result = await _runner(tx).query(
    `INSERT INTO conversations (owner_id) VALUES ($1) RETURNING id`,
    [owner_id]
  );
  return { id: result.rows[0].id };
}

async function appendMessage(
  { conversation_id, role, content, token_usage, owner_id },
  tx = null
) {
  await _runner(tx).query(
    `INSERT INTO messages (conversation_id, role, content, token_usage, owner_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [conversation_id, role, content, token_usage ?? null, owner_id]
  );
}

async function loadMessages(conversation_id, owner_id, tx = null) {
  const result = await _runner(tx).query(
    `SELECT id, role, content, token_usage, created_at
       FROM messages
      WHERE conversation_id = $1 AND owner_id = $2
      ORDER BY created_at ASC`,
    [conversation_id, owner_id]
  );
  return result.rows;
}

async function insertTriageRecord(record, tx = null) {
  const {
    conversation_id,
    owner_id,
    severity,
    category,
    suggested_owner,
    required_timeline,
    summary,
    escalation_flag,
    confidentiality_level,
    anonymous,
    raw_marker,
  } = record;
  await _runner(tx).query(
    `INSERT INTO triage_records (
       conversation_id, owner_id, severity, category, suggested_owner,
       required_timeline, summary, escalation_flag, confidentiality_level,
       anonymous, raw_marker
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      conversation_id,
      owner_id,
      severity,
      category,
      suggested_owner,
      required_timeline,
      summary,
      escalation_flag,
      confidentiality_level,
      anonymous,
      raw_marker,
    ]
  );
}

async function setConversationStatus(conversation_id, status, owner_id, tx = null) {
  await _runner(tx).query(
    `UPDATE conversations
        SET status = $1, updated_at = now()
      WHERE id = $2 AND owner_id = $3`,
    [status, conversation_id, owner_id]
  );
}

async function sumConversationOutputTokens(conversation_id, owner_id, tx = null) {
  const result = await _runner(tx).query(
    `SELECT COALESCE(SUM((token_usage->>'output_tokens')::int), 0) AS total
       FROM messages
      WHERE conversation_id = $1
        AND owner_id = $2
        AND role = 'assistant'
        AND token_usage IS NOT NULL`,
    [conversation_id, owner_id]
  );
  return parseInt(result.rows[0].total, 10);
}

async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function query(sql, params) {
  return pool.query(sql, params);
}

export default {
  insertConversation,
  appendMessage,
  loadMessages,
  insertTriageRecord,
  setConversationStatus,
  sumConversationOutputTokens,
  transaction,
  query,
};
