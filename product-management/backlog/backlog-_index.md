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
version: "1.3"
created: "2026-06-15"
updated: "2026-06-19"
owner: Sam R. Harkreader

# === DESCRIPTION FIELDS ===
purpose: Central index for intake-triager backlog items

# === RELATIONSHIP FIELDS ===
depends_on:
  - products/hopper/engineering/foundation/document-schemas/backlog-composite/backlog-item/backlog-_item-archetype.md
related: []

# === INDEX EXTENSION FIELDS ===
next_id: 8
total_count: 7
collection_type: backlog   # lowercase per ai-practice Anti-Pattern 6
---

# Intake Triager Backlog

**Total Items:** 7  
**Next ID:** BL-8  
**Last Updated:** 2026-06-19

> Index created at **session 315.8** from the first live-Render OBJ-1 validation
> pass. Item names are recorded as **rows**; individual item files are not
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
>
> **v1.2 (2026-06-17):** session-316.3 — **BL-2 substantially delivered** and a
> **BL-1 recurrence** surfaced. The Cycle 316 host-mount build (composed-view
> seam, shell, keyboard-advance) is **merged and live**; the deploy renders the
> composed view (`with Pattern in Motion · Preview` header + welcome). Two deploy
> blockers were resolved in 316.3: (a) the Render build was failing since the
> overlay was added — `npm install --no-save` pruned `devDependencies` (Vite)
> under `NODE_ENV=production` → `vite: not found`; fixed by adding `--include=dev`
> to the overlay install (WO-316.2d). (b) **BL-1 RECURRED:** the live turn again
> `404`'d on `MODEL=claude-sonnet-4-20250514`. The 315.8 fix had been applied in
> the Render **dashboard** (env override), but the service is **blueprint-managed**
> and a deploy re-synced `render.yaml`'s stale value, clobbering the override. The
> **durable fix** sets `MODEL=claude-sonnet-4-6` **in `render.yaml`** so it
> survives blueprint sync (WO-316.2e). ⚠️ **BL-1's "Complete" was premature** —
> the fix was not in the source of truth; reopening vs. annotating is Sam's call.
> Captured **BL-3** (model-deprecation early warning) to pre-empt a third
> occurrence. Captured 1→2; total 2→3; `next_id` 3→4.
>
> **v1.3 (2026-06-19):** session-316.6 — a full **end-to-end multi-turn walk**
> completed live in a clean incognito session (six-pill walk + keyboard advance +
> assistant replies; conversation reached `complete`). **OBJ-1 core confirmed.**
> The long-standing "Step-01 freeze" was diagnosed by reading the host control
> path (`App.jsx` → `MessageInput.jsx` → `composed-view.jsx`) — the wiring is
> **GOLD; nothing is frozen** (locked Send → `onLockedSend` → `gate.advance()`
> fires and the walk advances). It was **reclassified cosmetic**: the control is
> merely mislabeled. Captured **BL-4** (composition layout pass — three-zone
> fidelity), **BL-5** (Step-01 control relabel + input hide), **BL-6** (turn-2
> error, could-not-reproduce — watch), **BL-7** (event-log cumulative/persistent —
> the **leading edge of OBJ-2**; Sam's #4 decision = persistent). **Disposition:**
> deleted `model-deprecation-early-warning.md` — it followed the wrong (per-file)
> backlog model; **BL-3 survives as a row** per the rows-not-files convention
> (breakout 314.4.a). **BL-2 annotated** with the 316.6 live result; **left in
> Captured — Complete pending Sam's ratification** (BL-1 premature-Complete
> lesson). Captured 2→6; total 3→7; `next_id` 4→8.

---

## Summary by Status

| Status | Count |
|--------|-------|
| Captured | 6 |
| Triaged | 0 |
| Ready | 0 |
| Scheduled | 0 |
| Complete | 1 |
| Rejected | 0 |
| **Total** | **7** |

---

## Captured

| ID | Name | Priority | Source |
|----|------|----------|--------|
| BL-2 | Compose the overlay into the deployed intake-triager — **net-new host-mount build** (per overlay `README.md` / `CONTRACT.md`): add `@paradigmpilot/pattern-in-motion-overlay` as a host dependency (or build-time install at a pinned ref in `render.yaml`, mechanism (d) per 315.3); construct a **real substrate adapter** (`{ subscribe, loadManifest }`) bound to the live `step_started` / `step_ended` stream; and assemble the composed view — which today exists **only in the overlay's `/example` harness** — into intake-triager's own frontend tree. Live deploy renders **bare** intake-triager (no `with Pattern in Motion · Preview` header, no six pills); localhost (overlay `/example`) renders the full walk. **Unblocked** (BL-1 resolved — turns now complete). Carried to **Cycle 316** as the OBJ-1-closing build. **316.3: seam + shell + keyboard-advance merged and live; composed view renders on deploy. 316.6: end-to-end multi-turn walk confirmed live in a clean incognito session** (six pills + keyboard advance + assistant replies; conversation reached `complete`) — **OBJ-1 core delivered.** Remaining items are presentation, carved out: layout (BL-4), control relabel (BL-5), event-log persistence (BL-7). **Complete pending Sam's ratification** (premature-Complete lesson, BL-1). | High | Cycle 315.8 (live Render validation) |
| BL-3 | Model-deprecation early warning (human-in-the-loop): surface a deprecated/retired `MODEL` **before** it silently breaks `/converse` turns — via a boot-guard (verify model resolves at server start; fail-fast/warn at deploy) **or** a scheduled deprecation check (alert ahead of retirement). **No automated model substitution** (supply-chain risk; Anthropic IDs are pinned snapshots, not evergreen pointers — migration stays a deliberate human decision). Reads `MODEL` from the single source of truth (`render.yaml`). Captured after **BL-1 recurred** in 316.3. *(Row-only per 314.4.a; the standalone item file was deleted in 316.6.)* | Medium | Cycle 316.3 (BL-1 recurrence) |
| BL-4 | Composition layout pass — **three-zone fidelity**. `example.css` defines a clean three-zone column (Zone 1 anchored `.composed-head`; Zone 2 scroll `.composed-scroll`; Zone 3 anchored `.control-bar` footer, *"pinned below the scroll region so the snap-to-top never drags it"*), but `composed-view.jsx` renders `<App>` — transcript **and** `MessageInput`'s `<form>` — **inside `.chat` inside `.composed-scroll`**, so the input rides the scroll region and the `.control-bar` footer rule is **orphaned**. Live symptoms (316.6 incognito walk): (1) header not reliably pinned at top; (2) the live training/step block does not snap top-aligned under the header; (3) chat history should sit **above** an active training block, and with no training block the list should bottom-scroll with the **input + Send pinned to the viewport bottom** — instead the input floats mid-column / scrolls away and spacing jitters between states. Fix is **structural in `composed-view.jsx`** (seam the transcript into Zone 2, the input into Zone 3 / `.control-bar`), **not** a token change — zero new tokens (Robin Malfait Rule). Host-owned. | High | Cycle 316.6 (live incognito end-to-end walk) |
| BL-5 | Step-01 control **relabel + input hide** during the walk. While the manual walk is active (`controlsLocked`), the host shows a **disabled input + "Send"** — it should **hide the input** and present a **"Next Step"** button in the Send slot. The walk advances correctly (locked Send → `onLockedSend` → `gate.advance()`); the defect is **presentation only**. The earlier "Step-01 freeze" framing was wrong — nothing is frozen; the control is mislabeled. Host-owned (`composed-view.jsx` / `MessageInput.jsx`). | High | Cycle 316.4/316.6 (live eyes-on) |
| BL-6 | Turn-2 `/converse` error — **could-not-reproduce (watch)**. During 316.6 thrashing, one second turn returned the generic banner once; a fresh incognito session then completed a full multi-turn report with no error. Suspected **session-state, not code**: most likely the demo **circuit-breaker** (`recordFailure`/`classifyError` in `converse.js`) tripped by the session's prior failures, or that session's cost ceiling — not a defect in the turn handler. **No fix without reproduction + a Render log line** (`converse_handler_error` vs `converse_token_ceiling_exceeded`). Captured so it is not lost; do **not** act until it recurs with evidence. Host-owned (backend). | Low | Cycle 316.6 (transient; not reproduced) |
| BL-7 | Event-log **cumulative within a conversation** (persistent, not per-turn-ephemeral). `composed-view.jsx` clears the released-event array on each turn archive (`setEvents([])` in the `turnComplete` effect), so the "Event log" is **empty at conversation-complete** — reads as broken. **Decision (316.6, Sam): persistent/cumulative** across the conversation. Minimal host change = stop wiping between turns (retain a cumulative timeline). **Leading edge of OBJ-2:** full cross-session persistence + replay (#8/#9/#10) is the larger track **under reconciliation** — this row is the in-memory, within-conversation slice; the OBJ-2 reconciliation governs how much lands now vs. in the persistence/replay layer. Host-owned. | Medium | Cycle 316.6 (live; #4 decision — persistent) |

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
| BL-1 | Live "we had a problem recording this — please try again" error on real submit. **Root cause:** the `MODEL` env var pointed at `claude-sonnet-4-20250514`, **retired from the Claude API 2026-06-15**; the API returned `404 not_found_error` and the turn handler threw at the LLM call, before any DB write (the "recording" wording was a red herring — not a Postgres fault). **Fix:** set `MODEL=claude-sonnet-4-6` (current Sonnet) + redeploy. **Confirmed live** — real intake → assistant "TAYLOR" replied, no error. ⚠️ **RECURRED 316.3** — the 315.8 fix was applied in the Render **dashboard**, but the **blueprint-managed** service re-synced `render.yaml`'s stale value and the 404 returned. Durable fix in `render.yaml` via **WO-316.2e**. Completion was premature (fix not in source of truth); reopen-vs-annotate is Sam's call. | 315.8 | 315 |

---

## Rejected

| ID | Name | Reason |
|----|------|--------|
| — | No items rejected | — |

---

_Index maintained by: Sam R. Harkreader_  
_Last updated: 2026-06-19_
