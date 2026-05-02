// Test DB helpers for Phase 8 E2E.
// Owner-scoped — never truncates the table; deletes only rows matching
// the given owner_id. Path tests share DEMO_OWNER_ID (per gold vision
// §10 item 11; build plan §Phase 8); afterEach calls deleteByOwner to
// purge that owner's rows from the isolated test database. Serial
// test-file execution is enforced by vitest.e2e.config.js
// (fileParallelism: false) since shared owner_id rules out parallel
// cleanup.

import pg from 'pg';

const { Pool } = pg;

let pool;

export function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export async function deleteByOwner(ownerId) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    // Delete order: triage_records first (FK to conversations, no CASCADE),
    // then messages (FK CASCADE on conversations.id but we delete by
    // owner_id directly for explicit scope), then conversations.
    await client.query('DELETE FROM triage_records WHERE owner_id = $1', [ownerId]);
    await client.query('DELETE FROM messages WHERE owner_id = $1', [ownerId]);
    await client.query('DELETE FROM conversations WHERE owner_id = $1', [ownerId]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
