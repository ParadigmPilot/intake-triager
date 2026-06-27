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
version: "1.7"
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
next_id: 12
total_count: 11
collection_type: backlog   # lowercase per ai-practice Anti-Pattern 6
---

# Intake Triager Backlog

**Total Items:** 11  
**Next ID:** BL-12  
**Last Updated:** 2026-06-25

> Index created at **session 315.8** from the first live-Render OBJ-1 validation
> pass. Item names are recorded as **rows**; individual item files are not
> created (overlay-backlog precedent, breakout 314.4.a). BL IDs are assigned in
> **implementation order** (BL-1 first), matching the overlay-backlog convention.
>
> **v1.0–v1.5:** see prior revisions (BL-1 / BL-2 lifecycle, BL-3 model-deprecation
> early warning, BL-4 layout pass, BL-5 control relabel, BL-6 turn-2 no-repro,
> BL-7 event-log cumulative, BL-8 payload-surfacing, BL-9 local-build fragility).
> Full changelog retained in the v1.6 revision history below.
>
> **v1.6 (2026-06-25):** session-317.3 — captured **BL-10** (composed-view
> **CSS-ownership migration**), per the owner-approved Marcus Fontoura deviation
> (baseline A-317.3-1). Host's composed-view layout CSS lived in the overlay's
> `example/example.css` (inverted ownership); GOLD fix = a host stylesheet owns it,
> the overlay ships only contract-crossing assets + its own demo. Captured 7→8;
> total 9→10; `next_id` 10→11.
>
> **v1.7 (2026-06-25):** session-317.3 — captured **BL-11** (`index.html` inline
> `<style>` reconciliation), the **(C)** follow-up surfaced while diagnosing the
> footer-overflow page-frame. The SPA shell carries a legacy inline `<style>` (a
> global `body` rule that competes with `composed-view.css`, plus flat-clone-era
> `.transcript`/`.message*`/`form`/`.banner*` rules) — same demo/production-CSS
> tangle as BL-10, one layer up in the HTML shell. Captured 8→9; total 10→11;
> `next_id` 11→12. *(Context: BL-15 footer overflow — the host-side completing fix,
> WO-317.3d, binds the `html`/`body`/`#root` page frame to the viewport so
> `.composed` clamps; BL-15 lives in the **overlay** backlog and stays **open**
> until the live tall-transcript verify confirms the footer holds. BL-5 delivered
> via PR #47; BL-10 delivered via PR #48 + #49 — both still in Captured here pending
> the validated-backlog pass.)*

---

## Summary by Status

| Status | Count |
|--------|-------|
| Captured | 9 |
| Triaged | 0 |
| Ready | 0 |
| Scheduled | 0 |
| Complete | 2 |
| Rejected | 0 |
| **Total** | **11** |

---

## Captured

| ID | Name | Priority | Source |
|----|------|----------|--------|
| BL-3 | Model-deprecation early warning (human-in-the-loop): surface a deprecated/retired `MODEL` **before** it silently breaks `/converse` turns — boot-guard or scheduled check. **No automated model substitution.** Reads `MODEL` from `render.yaml`. *(Row-only per 314.4.a.)* | Medium | Cycle 316.3 (BL-1 recurrence) |
| BL-4 | Composition layout pass — **three-zone fidelity**. Transcript + input were rendered inside `.composed-scroll`; fix seated transcript in Zone 2 and the input in Zone 3 / `.control-bar`. Host-owned; zero new tokens. **(Verified-complete 317.2 via WO-317.2a / PR #46 — input pins at idle; migration to Complete deferred to the validated-backlog pass.)** | High | Cycle 316.6 (live incognito walk) |
| BL-5 | Step-01 control **relabel + input hide** during the walk. While `controlsLocked`, hide the input and present a **"Next Step"** button in the Send slot; advance wiring unchanged (presentation only). **(Delivered 317.3a via PR #47; migration to Complete deferred to the validated-backlog pass.)** | High | Cycle 316.4/316.6 (live eyes-on) |
| BL-6 | Turn-2 `/converse` error — **could-not-reproduce (watch)**. Suspected session-state (circuit-breaker / cost ceiling), not code. No fix without reproduction + a Render log line. *(cycle-317 baseline closes this Rejected/no-repro; migrates to Rejected at the validated-backlog pass.)* | Low | Cycle 316.6 (transient) |
| BL-7 | Event-log **cumulative within a conversation**, **grouped by turn** (in-memory). Shared `events` array is wiped per turn (`setEvents([])`), so the log is empty at conversation-complete. **Re-scoped 317.3 (A-317.3-1):** split into a **live list** (current turn; wiped) and an **archive list** (completed turns; never wiped); render the archive as **collapsible turn groups** (markers folded to one row; `plate_the_dish` keeps latency) + the in-progress turn. Composes with BL-8. Host logic + markup (`composed-view.jsx`) + log CSS (host `composed-view.css`). Host-owned. | Medium | Cycle 316.6 (live; owner decision — persistent) |
| BL-8 | **Payload-surfacing** — show each step's real **per-turn** content beneath its fixed teaching line (parsed intent / prompt metadata / model+latency+tokens / markers / served answer / side-effects). **Paired, lesson-primary, payload-subordinate** — never replace the teaching message. The **credibility-wedge** feature; §6's payload-bearing-replay intent re-aimed from replay to surfacing. Est. ~½–1 cycle; OBJ-2. Security: never leak system prompt / intake PII; cheap market probe recommended before the full build. Cross-cutting. | Medium | Cycle 316.6 (replay→payload reframe) |
| BL-9 | **Local-build fragility — overlay package pruned by `npm install`.** The overlay is installed `--no-save` (the pinned `render.yaml` GitHub SHA is the single source of truth, keeping `package.json` clean), so any `npm install` prunes it from `node_modules` and the local build fails until reinstalled. **Production unaffected.** Fix candidate: a `postinstall`/`predev` hook or a documented setup step. Host-owned (build tooling). | Medium | Cycle 317.2 (WO-317.2a build-gate discovery) |
| BL-10 | **Composed-view CSS-ownership migration.** Host composed-view layout CSS lived in the overlay's `example/example.css` (inverted ownership; Marcus Fontoura flag). GOLD fix: a host stylesheet (`src/frontend/composed-view.css`) owns the layout; the overlay ships only contract-crossing assets (tokens + component CSS) + its own demo. Verbatim **split** (the overlay's own demo also uses `.composed*`, so both keep their own copy). **(Delivered 317.3 via PR #48 — byte-identical copy + import repoint, build + 136 tests green; migration to Complete deferred to the validated-backlog pass.)** | High | Cycle 317.3 (Marcus deviation, owner-approved; A-317.3-1) |
| BL-11 | **`index.html` inline `<style>` reconciliation.** The SPA shell `src/frontend/index.html` carries a legacy inline `<style>` from the pre-composed-view (flat-clone) era: a global `body` rule (`margin: 2rem auto; padding: 0 1rem`, no height) that **competes with** `composed-view.css`'s `body`, plus `.transcript` / `.message-user` / `.message-assistant` / flat `form` / `.banner*` rules. It is **active on every render** (global, occasionally winning by cascade) and exposes a **second styling location** to a cloner — the same demo/production-CSS tangle as BL-10, one layer up in the HTML shell. **GOLD:** move page styling out of the HTML shell into host stylesheet(s); the shell carries no design CSS (or only the minimum the **bare clone** needs); reconcile the duplicate `body`. Acceptance: composed view **and** bare clone both render correctly; no competing global `body`; pixel-identical or owner-approved. **(C) follow-up** to the 317.3 page-frame fix (WO-317.3d), which lives host-side in `composed-view.css` and overrides the inline block by load order — this item removes the underlying conflict. Distinct from **BL-15** (the footer fix); this is the structural cleanup behind it. Touches the **clone** (P-9 — take care). Host-owned (`index.html` + host CSS). | Medium | Cycle 317.3 (page-frame diagnosis; index.html / host-CSS tangle) |

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
| BL-1 | Live "recording" error on real submit. Root cause: `MODEL` pointed at a retired snapshot (`claude-sonnet-4-20250514`, retired 2026-06-15) → `404` before any DB write. Fix: `MODEL=claude-sonnet-4-6` + redeploy. Recurred 316.3 (blueprint re-sync); durable fix in `render.yaml` via WO-316.2e. | 315.8 | 315 |
| BL-2 | Compose the overlay into the deployed intake-triager (host-mount build). 316.3 landed seam + shell + keyboard-advance; 316.5 cleared the demo door; **316.6 confirmed end-to-end** in a clean incognito session. OBJ-1 core delivered; presentation carved to BL-4/BL-5/BL-7. Owner-ratified Complete. | 316.6 | 316 |

---

## Rejected

| ID | Name | Reason |
|----|------|--------|
| — | No items rejected | — |

---

_Index maintained by: Sam R. Harkreader_  
_Last updated: 2026-06-25_
