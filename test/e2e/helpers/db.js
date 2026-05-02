// Test DB helpers for Phase 8 E2E (per WO-304.1.a).
// Owner-scoped — never truncates the table; deletes only rows matching
// the test's unique owner_id. Each test gets a fresh UUID via
// helpers/owner.js so concurrent test rows never collide.

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
