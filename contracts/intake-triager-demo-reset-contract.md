# Intake-Triager — Demo Turn-Budget Reset Contract

> **STATUS: DRAFT v2 — for Sam's review. Not ratified, not committed.**
> Governance frontmatter (doctype / inherits / archetype conformance) is provisional.
> The `contracts/` folder is net-new, so it likely needs a contract archetype
> established (or this inherits the memo/scoping-doc pattern) — an owner call before commit.
> Content is the review surface.

**Purpose:** Define the two-tier demo turn-budget reset for `intake-triager`.
**Canonical parent:** `restaurant-pattern-commercial-model-memo §7 Decision 2`
(per-user turn budget + global daily cap + circuit breaker).
**Home:** `products/intake-triager/contracts/` (code-repo → branch + PR + merge, D13).

---

## §1 Scope

Today a demo visitor who exhausts `turn_budget` goes terminal (`terminal_at` set)
and is locked out permanently — no reset path exists. This contract defines that
path in two tiers:

- **Admin tier** — unlimited resets, no cooldown.
- **Public tier** — reset allowed only after a cooldown window has elapsed since
  the visitor's last reset, keyed to their magic-link **email**.

Reset revives a **terminal** (budget-exhausted) session. It does not revive an
**expired** (past `expires_at`) session — an expired cookie means a fresh magic link.

---

## §2 Funnel reconciliation (parent-memo §5 / §7)

The commercial-model-memo makes budget-exhaustion the deliberate conversion
trigger (§5 principle 3; §7 Failure UX -> session-end CTA). This contract preserves
that: **exhaustion still fires the session-end training CTA first**; the reset is a
*timed second chance* that only becomes available after the cooldown, not an escape
from the pause. The conversion moment fires before any reset is possible, and the
email-keyed cooldown + workspace cap keep total spend bounded. The reset prevents
*permanent* lockout of a curious visitor; it does not remove the §5 pause.

_This §2 note is the "reconciliation note" recorded per Sam's 319.1 decision
("Public reset + note"). The parent memo is `mutability: record` / Final and is not
amended._

---

## §3 Tiers & identity

Identity source is the magic-link **email** on the session's `demo_links` row
(`demo_sessions.demo_link_id -> demo_links.email`).

- **Admin** = the session's email appears in the `DEMO_ADMIN_EMAILS` allowlist (§7).
  Resets without cooldown.
- **Public** = every other verified session. Cooldown gated per §4.

`DEMO_ADMIN_EMAILS` is **operational config** (deploy-time allowlist gating one op —
same category as the CORS list), **not** in-app RBAC. This stays clear of
gold-vision §11's "RBAC out of scope" and is consistent with commercial-model-memo
§2 (RBAC treated as training-product material). Portable: a forker self-admins by
putting their own email in their own `.env`, zero code change.

---

## §4 HTTP API contract

**Endpoint:** `POST /api/demo/reset` (matches the `/api/demo/*` convention).

**Identity:** the `demo_session` cookie, via a **reset-specific session load** —
NOT `demoSessionMiddleware`, which 401s terminal sessions. Reset must accept
`terminal_at != null`; it still rejects absent / invalid / expired sessions.

**Public cooldown check** (email-keyed — closes the new-link bypass):

```sql
SELECT MAX(ds.last_reset_at)
  FROM demo_sessions ds
  JOIN demo_links dl ON ds.demo_link_id = dl.id
 WHERE dl.email = :email;
-- deny if now() - MAX(last_reset_at) < DEMO_RESET_COOLDOWN_MINUTES
```

Supported by existing indexes (`idx_demo_links_email_issued`,
`idx_demo_sessions_demo_link`). No new schema beyond §5's column.

**Responses:**

| Status | error.code | When |
| ------ | ---------- | ---- |
| `200`  | -- | Reset applied. Body: `{ reset: true, tier, turns_used: 0, turn_budget }` |
| `401`  | `DEMO_SESSION_REQUIRED` | No / unreadable / unknown cookie |
| `401`  | `DEMO_SESSION_EXPIRED` | Session past `expires_at` |
| `429`  | `RESET_COOLDOWN_ACTIVE` | Public tier, inside cooldown. Body: `retry_after_seconds` |
| `503`  | `WORKSPACE_CAP_REACHED` | Circuit breaker `workspace_cap`-tripped (D-2: **refuse**) |

Error envelope matches `/converse`: `{ error: { code, message } }`, patron-safe message.

---

## §5 Data contract

`demo_sessions` gains one column:

```sql
ALTER TABLE demo_sessions ADD COLUMN IF NOT EXISTS last_reset_at TIMESTAMPTZ;
```

Appended to `src/db/schema.sql`; `bootstrap-schema.js` applies it idempotently on
next boot (existing Render table + fresh DBs both gain it). No manual live-DB ALTER,
no migration runner. `NULL` = never reset. **Migrations folder untouched**;
`001-initial.sql` stays the frozen initial-state seed.

---

## §6 Reset semantics

On an allowed reset, one transaction:

- `turns_used -> 0`
- `terminal_at -> NULL`
- `last_reset_at -> now()`
- `turn_budget` unchanged
- No `messages` / `conversations` rows deleted (refills budget, keeps transcript).

---

## §7 Configuration

New CONFIG keys, with the existing `DEMO_*` block:

```
# Admin allowlist for unlimited demo reset (comma-separated emails). Default: empty.
DEMO_ADMIN_EMAILS=

# Public-tier reset cooldown, in minutes. Default: 15.
DEMO_RESET_COOLDOWN_MINUTES=15
```

Read from env per call with defaulting, matching `getThreshold()` / `getDailyCap()`.

---

## §8 Invariants

1. **Reset never bypasses the workspace hard cap.** Reset makes no model call and
   only refills the session counter; the breaker independently gates `/converse`.
2. **Fail-closed (D-2).** Reset is refused while the breaker is `workspace_cap`-tripped
   — no reviving a session that immediately can't converse.
3. **Cooldown enforced server-side** from `last_reset_at` vs `now()`, never client-trusted.

---

## §9 Canon touch (gold-vision — needs Q3(b) approval)

The §5 `ALTER` breaks the byte-match asserted in **two** gold-vision clauses:
**§9** ("byte-for-byte identical to schema.sql") and **§11** ("an initial migration
matching schema.sql"). One-line amendment to each: `schema.sql` now carries
idempotent post-initial `ALTER`s applied by bootstrap; `001-initial.sql` remains the
frozen initial-state seed. No stopgap `002-*.sql`.

_Separate item (not this contract): the broader gold-vision staleness vs the 310.9
demo layer (§4 "single route," §9 "three tables," §10 "nine keys") is filed as its
own reconciliation, not folded here._

---

## §10 Resolved decisions (319.1)

| Ref | Decision |
| --- | -------- |
| Q1  | Cooldown keyed to **email** (loophole-closed) |
| Q2  | `POST /api/demo/reset` |
| Q3a | Home: `products/intake-triager/contracts/` (branch+PR) |
| Funnel | **Public reset + reconciliation note** (§2) |
| Q3b | Gold-vision §9 + §11 byte-match amendment — _pending final yes_ |
| D-2 | **Refuse** reset during workspace-cap shutdown |
| RBAC | `DEMO_ADMIN_EMAILS` = **ops-config**, not RBAC |

---

_Draft v2 authored by: Bob (AI-Coordinator) for Sam R. Harkreader — Cycle 319 OBJ-1_
