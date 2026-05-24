// Schema bootstrap — applies src/db/schema.sql to the database when the
// canonical `conversations` table is absent. Idempotent: no-ops when the
// schema is already present.
//
// Per intake-triager-gold-vision.md v1.5:
//   §9  Data contract — schema.sql is the canonical schema source.
//   §11 Non-goals      — *Migration tooling* (versioned application,
//                        ordering, rollback) is deferred to the future
//                        *Implementing Standards for LLM Apps* product.
//                        This module is bootstrap, not migration: a
//                        single-shot apply of schema.sql guarded by an
//                        existence check. No version table, no ordering,
//                        no rollback.
//
// Boot-time call lives in src/backend/server.js, between required-env
// validation and app.listen(). D39 reconciliation (WO-310.8d).

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

/**
 * Apply schema.sql to the database if the `conversations` table is absent.
 * Returns a plain object the caller can log:
 *   { applied: true }                                 — schema applied this call
 *   { applied: false, reason: 'schema_already_applied' } — no-op; already present
 *
 * Throws on connection or apply failure; the caller (server.js) exits
 * non-zero with a structured log entry.
 */
export async function bootstrapSchema() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  try {
    const { rows } = await client.query(
      "SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversations'"
    );
    if (rows.length > 0) {
      return { applied: false, reason: 'schema_already_applied' };
    }
    const schema = await readFile(SCHEMA_PATH, 'utf8');
    await client.query(schema);
    return { applied: true };
  } finally {
    await client.end();
  }
}
