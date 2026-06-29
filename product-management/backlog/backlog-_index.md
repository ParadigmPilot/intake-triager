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
version: "1.18"
created: "2026-06-15"
updated: "2026-06-29"
owner: Sam R. Harkreader

# === DESCRIPTION FIELDS ===
purpose: Central index for intake-triager backlog items

# === RELATIONSHIP FIELDS ===
depends_on:
  - products/hopper/engineering/foundation/document-schemas/backlog-composite/backlog-item/backlog-_item-archetype.md
related: []

# === INDEX EXTENSION FIELDS ===
next_id: 19
total_count: 18
collection_type: backlog   # lowercase per ai-practice Anti-Pattern 6
---

# Intake Triager Backlog

**Total Items:** 18  
**Next ID:** BL-19  
**Last Updated:** 2026-06-29

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

> **v1.11 (2026-06-28):** session-317.4 — **BL-12 → Complete** (PR #53 / WO-317.4b;
> owner live-confirmed on wide: footer pinned through a 9-turn walk, transcript
> scrolls in Zone 2, log scrolls within `.log-dock`). Captured **BL-14** (start a
> new conversation / exit at the terminal state — no reset path today). Captured
> 11→11 (−BL-12, +BL-14); Complete 2→3; total 13→14; `next_id` 14→15.

> **v1.12 (2026-06-28):** session-317.4 — **BL-14 → Complete** (PR #54 / WO-317.4c;
> owner live-confirmed: reset returns to welcome, next send opens a fresh
> `conversation_id` per Render logs). **OBJ-3 (host presentation) closes** —
> BL-7 + BL-12 + BL-14 all delivered. Captured **BL-15** (demo auth session
> expires mid-conversation → opaque 401). Captured 11→11 (−BL-14, +BL-15);
> Complete 3→4; total 14→15; `next_id` 15→16.

> **v1.13 (2026-06-28):** session-317.4 — **BL-15 diagnosed (no status change).**
> Root cause is **not** TTL/redeploy — it's **per-session turn-budget exhaustion**
> (default 10; `verify.js`). Log shows 7 turns (conv `3e7b6891`) + 3 turns (conv
> `2ada27ac`) = 10; the 11th 401'd. BL-14's "New conversation" reuses the **same
> demo session**, so the budget carries across the reset. The 401 is
> `session-middleware.js` (likely `DEMO_SESSION_TERMINAL`). Confirm path with
> `cost-protection-middleware.js` + the 401 `error.code`. BL-15 stays Captured.

> **v1.14 (2026-06-28):** session-317.4 — captured **BL-16** (demo-limit notice
> lacks prominence: the loud `banner-status` message scrolls out of the
> bottom-pinned region; only faint footer placeholder text shows). Follows the
> WO-317.4d BL-15 frontend fix. Captured 11→12; total 15→16; `next_id` 16→17.

> **v1.15 (2026-06-28):** session-317.4 — **BL-16 → Complete** (WO-317.4e / PR #56;
> owner live-confirmed: prominent amber demo-limit callout in the in-view footer at
> the 10-turn limit). Captured 12→11; Complete 4→5; total/`next_id` unchanged (16 / 17).

> **v1.16 (2026-06-29):** session-317.5 — captured **BL-17** (overlay teaching copy:
> third-party decoupling + plain-language rewrite), from the two-turn live QC. Canon
> read confirmed `ManualOverlay.jsx` is a **pure renderer** — the copy fix is
> **manifest content, not component code**; the P-9 triage gates on where the manifests
> live (overlay package vs host substrate adapter). Captured 11→12; total 16→17;
> `next_id` 17→18.

> **v1.17 (2026-06-29):** session-317.5 — **BL-17 amended** (no status/count change).
> Manifest source located: `src/substrate/manifests/index.js` is **host-owned** →
> BL-17 is **host-only** (P-9 gate resolved; no overlay change). "Third-party coupling"
> reduces to a clone-template doc note. Demo-routing related-item **dropped** (the box
> must show the true per-turn state; no steering). Recorded the **step-4 mislabel**
> ("records filed" under `read_the_ticket`) as a **BL-8 part-1 correctness defect**,
> fix folded into 317.6. Counts unchanged (12 / 17 / `next_id` 18).

> **v1.18 (2026-06-29):** session-317.6 — **OBJ-2 / BL-8 part 2 delivered and
> verified live**, and captured **BL-18**. BL-8 part 2 shipped over three WOs:
> `plate_the_dish` model/latency/tokens + `stock_the_pantry` records + step-4
> relabel (WO-317.6a / PR #58); plate latency re-sourced from the raw stream so it
> renders on the plate step (WO-317.6b / PR #59); empty-state teaching copy
> (WO-317.6c). Owner live-confirmed the plate receipt (`model claude-sonnet-4-6`,
> `latency 2486 ms`, `tokens 1252 in · 56 out`) with Event-log parity. The step-4
> mislabel (BL-8 part-1 defect) is corrected. Captured **BL-18** (demo never shows
> a *filed* record on a short first walk — surfacing is correct, but the newcomer
> never witnesses the payoff). BL-8 stays Captured pending the validated-backlog
> pass. Captured 12→13; total 17→18; `next_id` 18→19.

---

## Summary by Status

| Status | Count |
|--------|-------|
| Captured | 13 |
| Triaged | 0 |
| Ready | 0 |
| Scheduled | 0 |
| Complete | 5 |
| Rejected | 0 |
| **Total** | **18** |

---

## Captured

| ID | Name | Priority | Source |
|----|------|----------|--------|
| BL-3 | Model-deprecation early warning (human-in-the-loop): surface a deprecated/retired `MODEL` **before** it silently breaks `/converse` turns — boot-guard or scheduled check. **No automated model substitution.** Reads `MODEL` from `render.yaml`. *(Row-only per 314.4.a.)* | Medium | Cycle 316.3 (BL-1 recurrence) |
| BL-4 | Composition layout pass — **three-zone fidelity**. Transcript + input were rendered inside `.composed-scroll`; fix seated transcript in Zone 2 and the input in Zone 3 / `.control-bar`. Host-owned; zero new tokens. **(Verified-complete 317.2 via WO-317.2a / PR #46; migration to Complete deferred to the validated-backlog pass.)** | High | Cycle 316.6 (live incognito walk) |
| BL-5 | Step-01 control **relabel + input hide** during the walk. While `controlsLocked`, hide the input and present a **"Next Step"** button in the Send slot; advance wiring unchanged. **(Delivered 317.3a via PR #47; migration to Complete deferred to the validated-backlog pass.)** | High | Cycle 316.4/316.6 (live eyes-on) |
| BL-6 | Turn-2 `/converse` error — **could-not-reproduce (watch)**. Suspected session-state (circuit-breaker / cost ceiling), not code. No fix without reproduction + a Render log line. *(cycle-317 baseline closes this Rejected/no-repro; migrates to Rejected at the validated-backlog pass.)* | Low | Cycle 316.6 (transient) |
| BL-7 | Event-log **cumulative within a conversation**, **grouped by turn** (in-memory). Shared `events` array is wiped per turn (`setEvents([])`), so the log is empty at conversation-complete. **Re-scoped 317.3 (A-317.3-1):** split into a **live list** (current turn; wiped) and an **archive list** (completed turns; never wiped); render the archive as **collapsible turn groups** (markers folded to one row; `plate_the_dish` keeps latency) + the in-progress turn. Composes with BL-8. Host logic + markup (`composed-view.jsx`) + log CSS (host `composed-view.css`). Host-owned. **Last OBJ-3 item.** | Medium | Cycle 316.6 (live; owner decision — persistent) |
| BL-8 | **Payload-surfacing** — show each step's real **per-turn** content beneath its fixed teaching line. **Paired, lesson-primary, payload-subordinate** — never replace the teaching message. The **credibility-wedge** feature; §6's payload-bearing-replay intent re-aimed from replay to surfacing. Est. ~½–1 cycle; OBJ-2. **Part 1 delivered 317.5 (WO-317.5a / PR #57):** `detailLevel` seam + `take_the_order` input beat + `read_the_ticket` records (marker **type-only**, no PII on the wire); host `TurnPayload` beneath `ManualOverlay`. **Part-1 correctness defect (317.5 QC):** the `read_the_ticket` payload was labeled "records filed", but a record isn't filed until `stock_the_pantry` (step 6) — step 4 only *reads* the ticket. **Correction rides 317.6** with part 2 (`plate_the_dish` model/latency/tokens + `stock_the_pantry` side-effects + redaction sign-off), which places the true "records filed" beat at step 6. Security: never leak system prompt / intake PII. Cross-cutting. | Medium | Cycle 316.6 (replay→payload reframe) |
| BL-9 | **Local-build fragility — overlay package pruned by `npm install`.** Overlay installed `--no-save` (pinned `render.yaml` SHA is the single source of truth, keeping `package.json` clean), so any `npm install` prunes it and the local build fails until reinstalled. **Production unaffected.** Fix candidate: a `postinstall`/`predev` hook or documented setup step. Host-owned (build tooling). | Medium | Cycle 317.2 (WO-317.2a build-gate discovery) |
| BL-10 | **Composed-view CSS-ownership migration.** Host composed-view layout CSS lived in the overlay's `example/example.css` (inverted ownership; Marcus Fontoura flag). GOLD fix: a host stylesheet (`src/frontend/composed-view.css`) owns the layout; the overlay ships only contract-crossing assets + its own demo. Verbatim **split** (the overlay's demo also uses `.composed*`). **(Delivered 317.3 via PR #48; migration to Complete deferred to the validated-backlog pass.)** | High | Cycle 317.3 (Marcus deviation; A-317.3-1) |
| BL-11 | **`index.html` inline `<style>` reconciliation.** The SPA shell carries a legacy inline `<style>` from the flat-clone era: a global `body` rule that competes with `composed-view.css`'s `body`, plus `.transcript` / `.message*` / flat `form` / `.banner*` rules — active on every render, exposing a second styling location to a cloner (same tangle as BL-10, one layer up). **GOLD:** move page styling into host stylesheet(s); the shell carries no design CSS (or only the bare-clone minimum); reconcile the duplicate `body`. **(C) follow-up** to the 317.3 page-frame fix. Touches the **clone** (P-9 — take care). Host-owned (`index.html` + host CSS). | Medium | Cycle 317.3 (page-frame diagnosis) |
| BL-13 | **Assistant goes silent — continued turns get no visible reply.** Observed (317.3 live): after a sequence of workplace-conflict turns, the assistant produced **no visible Taylor response** to subsequent user messages ("Well?", "Are you not going to answer me anymore?"); the **input stayed enabled**, so the user kept sending with no feedback or indication. **Not yet diagnosed** — candidates (do not assume): (a) **crisis-end / refusal** path — Taylor's `[RULES]` refuse further turns at the prompt level while `status` stays `active` (known gold-vision §6 design point; input is not disabled), refusal rendering as empty/near-empty; (b) an empty/near-empty model reply; (c) a silently-errored turn (no banner shown); (d) a withheld reply. **Investigation needs:** Render logs for those turns (`converse_turn_received` / `converse_turn_complete` `status` / error events) + a repro. UX concern regardless of cause: a user sending into apparent silence with no feedback. Host-owned (backend `converse` + frontend reply rendering). | Medium | Cycle 317.3 (live eyes-on) |
| BL-15 | **Demo turn-budget exhaustion surfaces as an opaque 401 mid-conversation.** During a live walk a `POST /converse` returned **401 Unauthorized** and never reached the converse handler (no `converse_turn_received`). **Diagnosed 317.4:** root cause is the **per-session turn budget** (default **10**, `verify.js` `DEFAULT_TURN_BUDGET` / `DEMO_TURN_BUDGET`) — 7 turns (conv `3e7b6891`) + 3 turns (conv `2ada27ac`) = 10 used; the **11th** turn 401'd. **TTL ruled out** (session 01:08 → expires 02:08; failure ~01:42). **BL-14 interaction:** "New conversation" starts a new *conversation* but reuses the same *demo session*, so the budget **carries across the reset** — the user hits the cap mid-conversation thinking they started fresh. The 401 is `session-middleware.js` (likely the `DEMO_SESSION_TERMINAL` branch, set by cost-protection on budget exhaustion). **Frontend half delivered 317.4 (WO-317.4d / PR #55):** `App.jsx` maps the budget codes to an honest demo-limit terminal state + input disable. **Backend/product half deferred to Cycle 318:** whether a reset mints a fresh budget — **note: resetting the budget defeats the cost cap (infinite resets = infinite spend).** Host-owned (backend auth/cost + frontend error mapping). | Medium | Cycle 317.4 (live walk + Network 401) |
| BL-17 | **Overlay teaching copy — plain-language rewrite + host TurnPayload UX (learner clarity).** **[host-only]** Two-turn live QC (317.5) found the teaching copy is jargon-dense — restaurant metaphor + code terms stacked in one breath ("the Runner carries your order through the hand-off window to the Pass") — forcing the learner to decode two languages at once. **P-9 RESOLVED (host-only):** the per-step manifests live in the **host** at `src/substrate/manifests/index.js` (not the overlay); `ManualOverlay.jsx` is a pure renderer. The overlay is therefore **already decoupled by design** — "/converse" / "HTML-comment markers" are this app's own accurate strings, host-supplied. The original "third-party coupling" worry reduces to a **clone-template doc note** (a cloner inherits this app's manifest specifics and must rewrite them — README, not code). **Facets (all host):** (1) plain-language pass in `manifests/index.js` — one plain sentence per step, readable without the metaphor or code terms [host manifest content]; (2) neutral payload label — "records filed" → host-neutral (e.g. "what this step produced") [host `composed-view.jsx` TurnPayload]; (3) input beat reframed from verbatim echo to the **transformation** ("your message became the request sent to the server") — kills the double-print (payload block + chat bubble), worst on long inputs [host `composed-view.jsx` / BL-8]; (4) clamp long input/payload height on narrow (~384px) + scroll [host `composed-view.css`]. **Cross-ref:** the **step-4 mislabel** found here is owned by **BL-8** (part-1 defect) and corrected in **317.6**. **Demo-routing item DROPPED** — the box must show the true per-turn state; no steering. Host-only; splits into a manifest-copy WO + a TurnPayload-UX WO at triage. | Medium | Cycle 317.5 (two-turn live QC) |
| BL-18 | **Demo never shows a *filed* record on a short first walk — the credibility payoff stays hidden.** Per `system.md` [MARKER PROTOCOL], Taylor (the Chef) emits a `TRIAGE_RECORD` **only once the intake is complete** (the e2e scripts `standard-intake` / `mandatory-escalation` both take **seven** user turns to reach it); **no single-turn input fires a record**. So a newcomer in a short bounded session walks the six steps and sees only the **empty** payload states at `read_the_ticket` (step 4) and `stock_the_pantry` (step 6) — never a record **detected** then **filed**. The BL-8 surfacing is **correct** (absence shown honestly; empty-state copy clarified by WO-317.6c), but the newcomer never witnesses the wedge: a real record at steps 4 & 6. **GOLD candidate:** pre-load a **near-complete canonical conversation** (the temperature-0 `standard-intake` script) so the user's **first** walk fires the record — detected at step 4, filed at step 6 — within the demo budget. **Needs scoping:** backend seed vs. guided client script vs. demo-budget interaction (a 7-turn intake vs. the 10-turn cap); honest framing (a seeded conversation must read as a worked example, not a fake). WO-317.6c empty-state copy is the **interim mitigation**, not this. Host-owned (frontend demo seed; possibly backend). | Medium | Cycle 317.6 (live QC — all-empty demo) |

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
| BL-12 | **Composed-view scroll discipline + wide-mode footer pin.** Bottom-pinned internal scroll; live block in view during the walk; header + input pinned. Delivered 317.3e (PR #51); the ≥64rem/during-walk facet was the **wide grid-row gap** fixed by **WO-317.4b / PR #53** (host `composed-view.css`: `grid-template-rows: minmax(0,1fr)` + `.composed min-height:0`) — **also resolved overlay BL-14**. Owner live-confirmed wide (9-turn walk, footer pinned, log bounded). | 317.4 (PRs #51/#53) | 317 |
| BL-14 | **New-conversation reset at the terminal state.** At `complete`/`escalated`, `MessageInput` (gated `terminal && !controlsLocked`, so the final walk's "Next Step" survives) presents a **"New conversation"** button → `App.handleReset` clears conversation state + fires optional `onReset` → composer clears host state to the welcome screen; next send opens a fresh `conversation_id` (no new endpoint). Clone-safe (`onReset` optional). **WO-317.4c / PR #54**; owner live-confirmed (fresh `conversation_id` in Render logs). Closed **OBJ-3**. | 317.4 (PR #54) | 317 |
| BL-16 | **Demo-limit notice prominence.** The spent-budget notice was promoted from a scrolled-off top banner to a prominent **amber callout in the in-view footer** (bold "Demo limit reached" + one line + button-styled "Start a new session"; ~9:1 contrast); the redundant top banner was removed. Amber triad + existing tokens (zero new). **WO-317.4e / PR #56**; owner live-confirmed at the 10-turn limit (~384px). | 317.4 (PR #56) | 317 |

---

## Rejected

| ID | Name | Reason |
|----|------|--------|
| — | No items rejected | — |

---

_Index maintained by: Sam R. Harkreader_  
_Last updated: 2026-06-29 (v1.18)_
