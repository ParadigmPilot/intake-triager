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
version: "1.10"
created: "2026-06-15"
updated: "2026-06-28"
owner: Sam R. Harkreader

# === DESCRIPTION FIELDS ===
purpose: Central index for intake-triager backlog items

# === RELATIONSHIP FIELDS ===
depends_on:
  - products/hopper/engineering/foundation/document-schemas/backlog-composite/backlog-item/backlog-_item-archetype.md
related: []

# === INDEX EXTENSION FIELDS ===
next_id: 14
total_count: 13
collection_type: backlog   # lowercase per ai-practice Anti-Pattern 6
---

# Intake Triager Backlog

**Total Items:** 13  
**Next ID:** BL-14  
**Last Updated:** 2026-06-28

> Index created at **session 315.8** from the first live-Render OBJ-1 validation
> pass. Item names are recorded as **rows**; individual item files are not
> created (overlay-backlog precedent, breakout 314.4.a). BL IDs are assigned in
> **implementation order** (BL-1 first), matching the overlay-backlog convention.
>
> **v1.0–v1.5:** see prior revisions (BL-1 / BL-2 lifecycle, BL-3 model-deprecation
> early warning, BL-4 layout pass, BL-5 control relabel, BL-6 turn-2 no-repro,
> BL-7 event-log cumulative, BL-8 payload-surfacing, BL-9 local-build fragility).
> Full changelog retained in git history.
>
> **v1.6 (2026-06-25):** session-317.3 — captured **BL-10** (composed-view
> CSS-ownership migration), per A-317.3-1. Captured 7→8; total 9→10; `next_id` 10→11.
>
> **v1.7 (2026-06-25):** session-317.3 — captured **BL-11** (`index.html` inline
> `<style>` reconciliation). Captured 8→9; total 10→11; `next_id` 11→12.
>
> **v1.8 (2026-06-25):** session-317.3 — captured **BL-12** (composed-view scroll
> discipline: bottom-pinned internal scroll; live block in view during the walk).
> Captured 9→10; total 11→12; `next_id` 12→13.
>
> **v1.9 (2026-06-25):** session-317.3 — captured **BL-13** (assistant goes silent
> on continued turns — no visible reply, input stays enabled). Observed live;
> **not yet diagnosed** — needs Render logs + a repro. Captured 10→11; total 12→13;
> `next_id` 13→14. *(OBJ-3 allocation: 317.3 ran BL-5 ✓ → CSS migration ✓ → BL-15
> [3 WOs] ✓ → BL-12 ✓ → BL-7 still pending as the last OBJ-3 item; BL-13 is a
> newly-surfaced investigate-later item, not OBJ-3 build work.)*
>
> **v1.10 (2026-06-28):** session-317.4 — **BL-12 diagnosis (no status change).**
> Its pending "≥64rem / during-walk" live confirm failed and named the root: on
> wide the two-pane grid (`.composed-shell`) declares no `grid-template-rows`, so
> `.composed { height:100% }` is indefinite, the flex column never bounds, and a
> tall walk pushes the `.control-bar` footer ("Next Step") past the viewport
> bottom. Fix authored — **WO-317.4b** (host-side, CSS-only grid-row bind in
> `composed-view.css`); **also resolves overlay BL-14** host-side (same root,
> ownership-corrected there). **BL-12 stays Captured pending re-confirm.** No new
> items; counts unchanged (13 / 14).

---

## Summary by Status

| Status | Count |
|--------|-------|
| Captured | 11 |
| Triaged | 0 |
| Ready | 0 |
| Scheduled | 0 |
| Complete | 2 |
| Rejected | 0 |
| **Total** | **13** |

---

## Captured

| ID | Name | Priority | Source |
|----|------|----------|--------|
| BL-3 | Model-deprecation early warning (human-in-the-loop): surface a deprecated/retired `MODEL` **before** it silently breaks `/converse` turns — boot-guard or scheduled check. **No automated model substitution.** Reads `MODEL` from `render.yaml`. *(Row-only per 314.4.a.)* | Medium | Cycle 316.3 (BL-1 recurrence) |
| BL-4 | Composition layout pass — **three-zone fidelity**. Transcript + input were rendered inside `.composed-scroll`; fix seated transcript in Zone 2 and the input in Zone 3 / `.control-bar`. Host-owned; zero new tokens. **(Verified-complete 317.2 via WO-317.2a / PR #46; migration to Complete deferred to the validated-backlog pass.)** | High | Cycle 316.6 (live incognito walk) |
| BL-5 | Step-01 control **relabel + input hide** during the walk. While `controlsLocked`, hide the input and present a **"Next Step"** button in the Send slot; advance wiring unchanged. **(Delivered 317.3a via PR #47; migration to Complete deferred to the validated-backlog pass.)** | High | Cycle 316.4/316.6 (live eyes-on) |
| BL-6 | Turn-2 `/converse` error — **could-not-reproduce (watch)**. Suspected session-state (circuit-breaker / cost ceiling), not code. No fix without reproduction + a Render log line. *(cycle-317 baseline closes this Rejected/no-repro; migrates to Rejected at the validated-backlog pass.)* | Low | Cycle 316.6 (transient) |
| BL-7 | Event-log **cumulative within a conversation**, **grouped by turn** (in-memory). Shared `events` array is wiped per turn (`setEvents([])`), so the log is empty at conversation-complete. **Re-scoped 317.3 (A-317.3-1):** split into a **live list** (current turn; wiped) and an **archive list** (completed turns; never wiped); render the archive as **collapsible turn groups** (markers folded to one row; `plate_the_dish` keeps latency) + the in-progress turn. Composes with BL-8. Host logic + markup (`composed-view.jsx`) + log CSS (host `composed-view.css`). Host-owned. **Last OBJ-3 item.** | Medium | Cycle 316.6 (live; owner decision — persistent) |
| BL-8 | **Payload-surfacing** — show each step's real **per-turn** content beneath its fixed teaching line. **Paired, lesson-primary, payload-subordinate** — never replace the teaching message. The **credibility-wedge** feature; §6's payload-bearing-replay intent re-aimed from replay to surfacing. Est. ~½–1 cycle; OBJ-2. Security: never leak system prompt / intake PII; cheap market probe recommended before the full build. Cross-cutting. | Medium | Cycle 316.6 (replay→payload reframe) |
| BL-9 | **Local-build fragility — overlay package pruned by `npm install`.** Overlay installed `--no-save` (pinned `render.yaml` SHA is the single source of truth, keeping `package.json` clean), so any `npm install` prunes it and the local build fails until reinstalled. **Production unaffected.** Fix candidate: a `postinstall`/`predev` hook or documented setup step. Host-owned (build tooling). | Medium | Cycle 317.2 (WO-317.2a build-gate discovery) |
| BL-10 | **Composed-view CSS-ownership migration.** Host composed-view layout CSS lived in the overlay's `example/example.css` (inverted ownership; Marcus Fontoura flag). GOLD fix: a host stylesheet (`src/frontend/composed-view.css`) owns the layout; the overlay ships only contract-crossing assets + its own demo. Verbatim **split** (the overlay's demo also uses `.composed*`). **(Delivered 317.3 via PR #48; migration to Complete deferred to the validated-backlog pass.)** | High | Cycle 317.3 (Marcus deviation; A-317.3-1) |
| BL-11 | **`index.html` inline `<style>` reconciliation.** The SPA shell carries a legacy inline `<style>` from the flat-clone era: a global `body` rule that competes with `composed-view.css`'s `body`, plus `.transcript` / `.message*` / flat `form` / `.banner*` rules — active on every render, exposing a second styling location to a cloner (same tangle as BL-10, one layer up). **GOLD:** move page styling into host stylesheet(s); the shell carries no design CSS (or only the bare-clone minimum); reconcile the duplicate `body`. **(C) follow-up** to the 317.3 page-frame fix. Touches the **clone** (P-9 — take care). Host-owned (`index.html` + host CSS). | Medium | Cycle 317.3 (page-frame diagnosis) |
| BL-12 | **Composed-view scroll discipline.** The middle scroll region (`.composed-scroll`) rests at the **bottom** so the newest message stays in view (chat-app default), **except during the manual walk**, where the **live step block stays in view**. Owner decisions: (1) bottom-pinned internal scroll; (2) header + input pinned only (teaching scrolls with the transcript); (a) live block in view during the walk, rest at bottom on completion. Add a ref to `.composed-scroll`; a `!started`-gated bottom-rest effect; retain the live-block snap. Distinct from BL-15. Host-owned (`composed-view.jsx`). **(Delivered 317.3e via PR #51 — pending live confirm of the during-walk + ≥64rem behavior.)** **317.4:** ≥64rem/during-walk confirm **failed** — wide grid-row gap; fix **WO-317.4b** (host `composed-view.css`), pending re-confirm. | High | Cycle 317.3 (layout design decisions) |
| BL-13 | **Assistant goes silent — continued turns get no visible reply.** Observed (317.3 live): after a sequence of workplace-conflict turns, the assistant produced **no visible Taylor response** to subsequent user messages ("Well?", "Are you not going to answer me anymore?"); the **input stayed enabled**, so the user kept sending with no feedback or indication. **Not yet diagnosed** — candidates (do not assume): (a) **crisis-end / refusal** path — Taylor's `[RULES]` refuse further turns at the prompt level while `status` stays `active` (known gold-vision §6 design point; input is not disabled), refusal rendering as empty/near-empty; (b) an empty/near-empty model reply; (c) a silently-errored turn (no banner shown); (d) a withheld reply. **Investigation needs:** Render logs for those turns (`converse_turn_received` / `converse_turn_complete` `status` / error events) + a repro. UX concern regardless of cause: a user sending into apparent silence with no feedback. Host-owned (backend `converse` + frontend reply rendering). | Medium | Cycle 317.3 (live eyes-on) |

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
| BL-1 | Live "recording" error on real submit. Root cause: `MODEL` pointed at a retired snapshot (`claude-sonnet-4-20250514`) → `404` before any DB write. Fix: `MODEL=claude-sonnet-4-6` + redeploy. Recurred 316.3 (blueprint re-sync); durable fix in `render.yaml` via WO-316.2e. | 315.8 | 315 |
| BL-2 | Compose the overlay into the deployed intake-triager (host-mount build). 316.3 seam + shell + keyboard-advance; 316.5 cleared the demo door; **316.6 confirmed end-to-end** in a clean incognito session. OBJ-1 core delivered; presentation carved to BL-4/BL-5/BL-7. Owner-ratified Complete. | 316.6 | 316 |

---

## Rejected

| ID | Name | Reason |
|----|------|--------|
| — | No items rejected | — |

---

_Index maintained by: Sam R. Harkreader_  
_Last updated: 2026-06-28_
