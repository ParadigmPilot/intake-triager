---
# === IDENTITY FIELDS ===
name: Intake Triager Backlog Index
path: products/intake-triager/product-management/backlog/backlog-_index.md
project: Hopper

# === CLASSIFICATION FIELDS ===
doctype: _Index
level: Operational
status: Active
quality: TBD
alignment: Partial

# === VERSIONING FIELDS ===
version: "1.1"
created: "2026-06-15"
updated: "2026-06-15"
owner: Sam R. Harkreader

# === DESCRIPTION FIELDS ===
purpose: Central index for intake-triager backlog items

# === RELATIONSHIP FIELDS ===
depends_on:
  - products/hopper/engineering/foundation/document-schemas/backlog-composite/backlog-item/backlog-_item-archetype.md
related: []

# === INDEX EXTENSION FIELDS ===
next_id: 3
total_count: 2
collection_type: backlog   # lowercase per ai-practice Anti-Pattern 6
---

# Intake Triager Backlog

**Total Items:** 2  
**Next ID:** BL-3  
**Last Updated:** 2026-06-15

> Index created at **session 315.8** from the first live-Render OBJ-1 validation
> pass. Item names are recorded as **rows**; individual item files are not yet
> created (overlay-backlog precedent, breakout 314.4.a). BL IDs are assigned in
> **implementation order** (BL-1 first), matching the overlay-backlog convention.
>
> **v1.0 (2026-06-15):** captured BL-1 (live "recording" error) + BL-2 (overlay
> not in deployed build) when the deployed `intake-triager` Web Service
> (`https://intake-triager.onrender.com`, Node + Postgres 18) was driven with a
> real intake for the first time — the turn errored and the overlay did not render.
>
> **v1.1 (2026-06-15):** session-315.8 live diagnosis + fix.
> **BL-1 → Complete.** Root cause was **not** the DB write path (the initial
> hypothesis): the Render logs showed `404 not_found_error` on the `MODEL` env
> var `claude-sonnet-4-20250514`, which **retired from the Claude API on
> 2026-06-15** (today). The turn failed at the LLM call, before any record write —
> the "recording" wording was a red herring. Fixed by setting
> `MODEL=claude-sonnet-4-6` (current Sonnet) + redeploy; **confirmed live** (real
> intake → assistant "TAYLOR" responded, no error). **BL-2** sharpened to the
> net-new **host-mount build** (per overlay `README.md` / `CONTRACT.md`): the
> composed view exists only in the overlay's `/example` harness; the host repo has
> no overlay dependency and no mount code. **BL-2 is now unblocked** (BL-1 done —
> turns complete) and carried to **Cycle 316** as the OBJ-1-closing build.
> Captured 2→1; Complete 0→1. `next_id`/total unchanged (3 / 2). (Cross-ref:
> overlay `backlog-_index` records OBJ-1 as **Partial**; the deploy/integration
> fixes live here.)

---

## Summary by Status

| Status | Count |
|--------|-------|
| Captured | 1 |
| Triaged | 0 |
| Ready | 0 |
| Scheduled | 0 |
| Complete | 1 |
| Rejected | 0 |
| **Total** | **2** |

---

## Captured

| ID | Name | Priority | Source |
|----|------|----------|--------|
| BL-2 | Compose the overlay into the deployed intake-triager — **net-new host-mount build** (per overlay `README.md` / `CONTRACT.md`): add `@paradigmpilot/pattern-in-motion-overlay` as a host dependency (or build-time install at a pinned ref in `render.yaml`, mechanism (d) per 315.3); construct a **real substrate adapter** (`{ subscribe, loadManifest }`) bound to the live `step_started` / `step_ended` stream; and assemble the composed view — which today exists **only in the overlay's `/example` harness** — into intake-triager's own frontend tree. Live deploy renders **bare** intake-triager (no `with Pattern in Motion · Preview` header, no six pills); localhost (overlay `/example`) renders the full walk. **Unblocked** (BL-1 resolved — turns now complete). Carried to **Cycle 316** as the OBJ-1-closing build | High | Cycle 315.8 (live Render validation) |

---

## Triaged

| ID | Name | Priority | Estimate | Owner |
|----|------|----------|----------|-------|
| — | No items yet | — | — | — |

---

## Ready

| ID | Name | Priority | Estimate | Owner |
|----|------|----------|----------|-------|
| — | No items ready | — | — | — |

---

## Scheduled

| ID | Name | Priority | Cycle | Owner |
|----|------|----------|-------|-------|
| — | No items scheduled | — | — | — |

---

## Complete

| ID | Name | Completed | Cycle |
|----|------|-----------|-------|
| BL-1 | Live "we had a problem recording this — please try again" error on real submit. **Root cause:** the `MODEL` env var pointed at `claude-sonnet-4-20250514`, **retired from the Claude API 2026-06-15**; the API returned `404 not_found_error` and the turn handler threw at the LLM call, before any DB write (the "recording" wording was a red herring — not a Postgres fault). **Fix:** set `MODEL=claude-sonnet-4-6` (current Sonnet) + redeploy. **Confirmed live** — real intake → assistant "TAYLOR" replied, no error | 315.8 | 315 |

---

## Rejected

| ID | Name | Reason |
|----|------|--------|
| — | No items rejected | — |

---

_Index maintained by: Sam R. Harkreader_  
_Last updated: 2026-06-15_
