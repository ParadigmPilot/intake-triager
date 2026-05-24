// Schema bootstrap — applies src/db/schema.sql to the database on every
// boot. schema.sql is fully idempotent (every CREATE uses IF NOT EXISTS),
// so re-application is a no-op when the schema is already present.
//
// Per intake-triager-gold-vision.md v1.5:
//   §9  Data contract — schema.sql is the canonical schema source.
//   §11 Non-goals      — *Migration tooling* (versioned application,
//                        ordering, rollback) is deferred to the future
//                        *Implementing Standards for LLM Apps* product.
//                        This module is bootstrap, not migration: a
//                        single-shot apply of schema.sql with no version
//                        table, no ordering, no rollback.
//
// Per WO-310.9a D.2: the previous conversations-presence check was
// removed. Schema gained two new tables (demo_links, demo_sessions) on
// existing Render Postgres instances that already had the original three
// tables; the presence check would have short-circuited and the new
// tables would never appear. With every statement now idempotent, the
// safest path is unconditional apply.
//
// Boot-time call lives in src/backend/server.js, between required-env
// validation and app.listen().

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

/**
 * Apply schema.sql to the database. Returns a plain object the caller
 * can log:
 *   { applied: true, reason: 'idempotent_apply' }   — schema applied
 *
 * Throws on connection or apply failure; the caller (server.js) catches
 * and exits non-zero with a structured log entry.
 */
export async function bootstrapSchema() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  try {
    const schema = await readFile(SCHEMA_PATH, 'utf8');
    await client.query(schema);
    return { applied: true, reason: 'idempotent_apply' };
  } finally {
    await client.end();
  }
}
