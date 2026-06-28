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
version: "1.8"
created: "2026-06-15"
updated: "2026-06-25"
owner: Sam R. Harkreader

# === DESCRIPTION FIELDS ===
purpose: Central index for intake-triager backlog items

# === RELATIONSHIP FIELDS ===
depends_on:
  - products/hopper/engineering/foundation/document-schemas/backlog-composite/backlog-item/backlog-_item-archetype.md
related: []

# === INDEX EXTENSION FIELDS ===
next_id: 13
total_count: 12
collection_type: backlog   # lowercase per ai-practice Anti-Pattern 6
---

# Intake Triager Backlog

**Total Items:** 12  
**Next ID:** BL-13  
**Last Updated:** 2026-06-25

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
> **CSS-ownership migration**), per A-317.3-1. Host's composed-view layout CSS lived
> in the overlay's `example/example.css` (inverted ownership); GOLD fix = a host
> stylesheet owns it. Captured 7→8; total 9→10; `next_id` 10→11.
>
> **v1.7 (2026-06-25):** session-317.3 — captured **BL-11** (`index.html` inline
> `<style>` reconciliation), the **(C)** follow-up surfaced while diagnosing the
> footer-overflow page-frame. Captured 8→9; total 10→11; `next_id` 11→12.
>
> **v1.8 (2026-06-25):** session-317.3 — captured **BL-12** (composed-view **scroll
> discipline**), from the owner UX decisions on overflow behavior. With the page
> frame bound (BL-15), the middle scroll region (`.composed-scroll`) should rest at
> the **bottom** so the newest message stays in view (chat-app default), **except
> during the manual walk**, where the live step block stays in view as each step is
> revealed. Owner decisions: (1) bottom-pinned internal scroll; (2) header + input
> pinned only (teaching scrolls with the chat); (a) live block in view during the
> walk, rest at bottom on completion. Captured 9→10; total 11→12; `next_id` 12→13.
> *(Context — OBJ-3 allocation: 317.3 has grown to BL-5 ✓ → CSS migration ✓ →
> BL-15 [3 WOs] ✓ → BL-12 → BL-7; OBJ-3 is spilling across sessions and BL-7
> remains the last item. Logged as an allocation slip, owner-aware. BL-5 / BL-10
> delivered; BL-15 stack merged (footer pinned per computed heights, live verify of
> the full behavior folds into BL-12); all still in Captured pending the
> validated-backlog pass.)*

---

## Summary by Status

| Status | Count |
|--------|-------|
| Captured | 10 |
| Triaged | 0 |
| Ready | 0 |
| Scheduled | 0 |
| Complete | 2 |
| Rejected | 0 |
| **Total** | **12** |

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
| BL-12 | **Composed-view scroll discipline.** With the page frame bound (BL-15), the middle scroll region (`.composed-scroll`, holding the teaching/live block + transcript) should rest at the **bottom** so the newest message stays in view (chat-app default), **except during the manual walk**, where the **live step block stays in view** as each step is revealed (the teaching beat). Owner decisions: **(1)** bottom-pinned internal scroll; **(2)** header + input pinned only — the teaching block scrolls *with* the transcript (no separate pinned band; matches current structure, no structural lift); **(a)** during the walk keep the live block in view, rest at the bottom on completion. Implementation: add a ref to `.composed-scroll`; a `!started`-gated bottom-rest effect (`scrollTop = scrollHeight`); retain the existing live-block `scrollIntoView` during the walk. Pure behavior; zero new tokens; `App.jsx` / `Transcript.jsx` untouched. Distinct from **BL-15** (frame/pinning, structurally done) — this is the scroll-behavior layer atop it. Host-owned (`composed-view.jsx`). | High | Cycle 317.3 (layout design decisions; owner UX fork) |

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
_Last updated: 2026-06-25_
