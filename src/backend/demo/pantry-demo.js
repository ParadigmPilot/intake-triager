// Pantry (demo) — PostgreSQL access layer for the magic-link demo
// auth flow.
//
// Per WO-310.9a D.5. Follows the existing pantry.js idiom:
//   • Shared pool, named imports, optional final `tx` parameter.
//   • _runner(tx) routes through tx when present, pool when absent.
//   • Every read/write filters by owner_id where applicable
//     (intake-triager-gold-vision.md v1.5 §10 item 10 pattern).
//
// Tables touched (defined in src/db/schema.sql per WO-310.9a D.1):
//   demo_links    — one row per magic-link issuance
//   demo_sessions — one row per verified click

import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function _runner(tx) {
  return tx || pool;
}

/**
 * Insert a new magic-link row.
 * @returns {Promise<{id: string}>}
 */
async function insertDemoLink(
  { owner_id, email, token_hash, expires_at, ip_at_issue },
  tx = null
) {
  const result = await _runner(tx).query(
    `INSERT INTO demo_links
       (owner_id, email, token_hash, expires_at, ip_at_issue)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [owner_id, email, token_hash, expires_at, ip_at_issue ?? null]
  );
  return { id: result.rows[0].id };
}

/**
 * Look up a link by its token_hash. Returns null if not found.
 * @returns {Promise<object | null>}
 */
async function getDemoLinkByTokenHash(token_hash, tx = null) {
  const result = await _runner(tx).query(
    `SELECT id, owner_id, email, token_hash, issued_at, expires_at,
            used_at, ip_at_issue
       FROM demo_links
      WHERE token_hash = $1`,
    [token_hash]
  );
  return result.rows[0] ?? null;
}

/**
 * Atomically mark a link as used. Returns the updated row, or null if
 * the row was already used (used_at IS NOT NULL on read). The race
 * window between getDemoLinkByTokenHash and this UPDATE is closed by
 * the `WHERE used_at IS NULL` predicate: at most one caller wins.
 * @returns {Promise<object | null>}
 */
async function markDemoLinkUsed(id, tx = null) {
  const result = await _runner(tx).query(
    `UPDATE demo_links
        SET used_at = now()
      WHERE id = $1 AND used_at IS NULL
      RETURNING id, owner_id, email, token_hash, issued_at, expires_at,
                used_at, ip_at_issue`,
    [id]
  );
  return result.rows[0] ?? null;
}

/**
 * Insert a new demo session row tied to a verified link.
 * @returns {Promise<{id: string}>}
 */
async function insertDemoSession(
  { owner_id, demo_link_id, turn_budget, expires_at },
  tx = null
) {
  const result = await _runner(tx).query(
    `INSERT INTO demo_sessions
       (owner_id, demo_link_id, turn_budget, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [owner_id, demo_link_id, turn_budget, expires_at]
  );
  return { id: result.rows[0].id };
}

/**
 * Look up a demo session by its id. Returns null if not found.
 * Expiry and terminal_at filtering lives in the middleware (D.9), not
 * here — keeping this method a plain lookup matches the pantry idiom.
 * @returns {Promise<object | null>}
 */
async function getDemoSessionById(id, tx = null) {
  const result = await _runner(tx).query(
    `SELECT id, owner_id, demo_link_id, turn_budget, turns_used,
            created_at, expires_at, terminal_at
       FROM demo_sessions
      WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

/**
 * Atomic per-session turn increment. Increments turns_used; if reaching
 * turn_budget, also sets terminal_at = now(). Returns the updated row.
 *
 * Used in the same transaction as the assistant-message insert in the
 * /converse handler — no drift between message and session state.
 *
 * Per WO-310.9c §D.4.
 * @param {string} id — demo_sessions.id
 * @param {object} tx — pg transaction handle
 * @returns {Promise<{turns_used: number, turn_budget: number, terminal_at: string | null}>}
 */
async function incrementSessionTurns(id, tx) {
  const result = await _runner(tx).query(
    `UPDATE demo_sessions
        SET turns_used = turns_used + 1,
            terminal_at = CASE
              WHEN turns_used + 1 >= turn_budget THEN now()
              ELSE terminal_at
            END
      WHERE id = $1
      RETURNING turns_used, turn_budget, terminal_at`,
    [id]
  );
  return result.rows[0];
}

/**
 * Total turns consumed across all demo sessions created in the current
 * UTC day. Used by cost-protection-middleware for the global daily cap.
 *
 * The index `idx_demo_sessions_created_at` (added in WO-310.9c §D.4)
 * supports the range scan.
 *
 * Per WO-310.9c §D.4.
 * @param {object | null} tx
 * @returns {Promise<number>}
 */
async function getGlobalDailyTurnCount(tx = null) {
  const result = await _runner(tx).query(
    `SELECT COALESCE(SUM(turns_used), 0)::INT AS total
       FROM demo_sessions
      WHERE created_at >= date_trunc('day', now())`
  );
  return result.rows[0].total;
}

export {
  insertDemoLink,
  getDemoLinkByTokenHash,
  markDemoLinkUsed,
  insertDemoSession,
  getDemoSessionById,
  incrementSessionTurns,
  getGlobalDailyTurnCount,
};

export default {
  insertDemoLink,
  getDemoLinkByTokenHash,
  markDemoLinkUsed,
  insertDemoSession,
  getDemoSessionById,
  incrementSessionTurns,
  getGlobalDailyTurnCount,
};
