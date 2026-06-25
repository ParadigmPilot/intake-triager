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
version: "1.5"
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
next_id: 10
total_count: 9
collection_type: backlog   # lowercase per ai-practice Anti-Pattern 6
---

# Intake Triager Backlog

**Total Items:** 9  
**Next ID:** BL-10  
**Last Updated:** 2026-06-25

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
> **v1.1 (2026-06-15):** session-315.8 live diagnosis + fix. **BL-1 → Complete.**
> Root cause was the retired `MODEL` (`claude-sonnet-4-20250514`, retired
> 2026-06-15) returning `404` at the LLM call, before any DB write. Fixed by
> `MODEL=claude-sonnet-4-6` + redeploy. **BL-2** sharpened to the net-new
> host-mount build; unblocked and carried to Cycle 316.
>
> **v1.2 (2026-06-17):** session-316.3 — BL-2 substantially delivered (seam +
> shell + keyboard-advance merged and live); **BL-1 recurred** (blueprint
> re-synced the stale `render.yaml` MODEL; durable fix in `render.yaml` via
> WO-316.2e). Captured **BL-3** (model-deprecation early warning). Captured 1→2;
> total 2→3; `next_id` 3→4.
>
> **v1.3 (2026-06-19):** session-316.6 — full **end-to-end multi-turn walk**
> completed live in a clean incognito session; **OBJ-1 core confirmed.** The
> "Step-01 freeze" was diagnosed (host control wiring read GOLD across
> `App.jsx`/`MessageInput.jsx`/`composed-view.jsx`) and **reclassified cosmetic**
> — the walk advances; the control is merely mislabeled. Captured **BL-4**
> (composition layout pass), **BL-5** (Step-01 control relabel), **BL-6** (turn-2
> error, could-not-reproduce — watch), **BL-7** (event-log cumulative/persistent —
> leading edge of OBJ-2; Sam chose persistent). Disposition: deleted
> `model-deprecation-early-warning.md` (wrong per-file model); **BL-3 survives as a
> row** (314.4.a). Captured 2→6; total 3→7; `next_id` 4→8.
>
> **v1.4 (2026-06-19):** session-316.6 — **BL-2 → Complete** (the clean incognito
> end-to-end walk delivered OBJ-1 core; presentation polish carved to
> BL-4/BL-5/BL-7; owner-ratified). Captured **BL-8** — payload-surfacing, the
> credibility-wedge feature (**paired, lesson-primary, payload-subordinate**; §6
> payload-bearing-replay lineage re-aimed; est. ~½–1 cycle, likely Cycle 317).
> **Architecture-layer note (recorded elsewhere, not here):** Pattern-in-Motion
> components #8/#9/#10 are de-scoped — bare replay dropped, #9 rotate-out dropped
> (in-memory "don't wipe" / BL-7 chosen over localStorage), #8 capture re-aimed to
> BL-8 — via **scheduled** amendments to `restaurant-pattern-portfolio-scoping-document.md`
> §6.2 and `station-architecture-scoping-document.md`; this index tracks only the
> intake-triager items. Complete 1→2; Captured 6→6 (−BL-2, +BL-8); total 7→8;
> `next_id` 8→9.
>
> **v1.5 (2026-06-25):** session-317.2 — captured **BL-9** (local-build
> fragility: the `--no-save` overlay package is pruned from `node_modules` by any
> `npm install`, breaking the local build until reinstalled; production
> unaffected per `render.yaml`). Surfaced as a **WO-317.2a build-gate discovery**
> — environmental, not caused by the change. Captured 6→7; total 8→9; `next_id`
> 9→10. *(Context: WO-317.2a — BL-4 three-zone input pin — merged via PR #46 and
> confirmed live; the input now pins to the `.control-bar` footer at idle.
> **BL-4 is verified-complete but left in Captured here**, pending the cycle-317
> validated-backlog migration pass.)*

---

## Summary by Status

| Status | Count |
|--------|-------|
| Captured | 7 |
| Triaged | 0 |
| Ready | 0 |
| Scheduled | 0 |
| Complete | 2 |
| Rejected | 0 |
| **Total** | **9** |

---

## Captured

| ID | Name | Priority | Source |
|----|------|----------|--------|
| BL-3 | Model-deprecation early warning (human-in-the-loop): surface a deprecated/retired `MODEL` **before** it silently breaks `/converse` turns — via a boot-guard (verify model resolves at server start) **or** a scheduled deprecation check. **No automated model substitution** (supply-chain risk; Anthropic IDs are pinned snapshots). Reads `MODEL` from the single source of truth (`render.yaml`). Captured after **BL-1 recurred** in 316.3. *(Row-only per 314.4.a; the standalone item file was deleted in 316.6.)* | Medium | Cycle 316.3 (BL-1 recurrence) |
| BL-4 | Composition layout pass — **three-zone fidelity**. `example.css` defines a clean three-zone column (Zone 1 anchored `.composed-head`; Zone 2 scroll `.composed-scroll`; Zone 3 anchored `.control-bar` footer), but `composed-view.jsx` renders `<App>` — transcript **and** `MessageInput`'s `<form>` — **inside `.chat` inside `.composed-scroll`**, so the input rides the scroll region and the `.control-bar` footer rule is **orphaned**. Live symptoms (316.6): (1) header not reliably pinned; (2) the live step block does not snap top-aligned under the header; (3) chat should sit **above** an active training block, and with none the list should bottom-scroll with **input + Send pinned to the viewport bottom** — instead the input floats / scrolls and spacing jitters. Fix is **structural in `composed-view.jsx`** (seam transcript → Zone 2, input → Zone 3/`.control-bar`), not a token change — zero new tokens (Robin Malfait Rule). Host-owned. **(Verified-complete 317.2 via WO-317.2a / PR #46 — input pins at idle on the live build; migration to Complete deferred to the cycle-317 validated-backlog pass.)** | High | Cycle 316.6 (live incognito end-to-end walk) |
| BL-5 | Step-01 control **relabel + input hide** during the walk. While the walk is active (`controlsLocked`), the host shows a **disabled input + "Send"** — it should **hide the input** and present a **"Next Step"** button in the Send slot. The walk advances correctly (locked Send → `onLockedSend` → `gate.advance()`); the defect is **presentation only**. The earlier "Step-01 freeze" framing was wrong — nothing is frozen; the control is mislabeled. Host-owned (`composed-view.jsx` / `MessageInput.jsx`). | High | Cycle 316.4/316.6 (live eyes-on) |
| BL-6 | Turn-2 `/converse` error — **could-not-reproduce (watch)**. During 316.6 thrashing, one second turn returned the generic banner once; a fresh incognito session then completed a full multi-turn report with no error. Suspected **session-state, not code**: most likely the demo **circuit-breaker** (`recordFailure`/`classifyError` in `converse.js`) tripped by prior failures, or that session's cost ceiling. **No fix without reproduction + a Render log line** (`converse_handler_error` vs `converse_token_ceiling_exceeded`). Captured so it is not lost; do **not** act until it recurs with evidence. Host-owned (backend). | Low | Cycle 316.6 (transient; not reproduced) |
| BL-7 | Event-log **cumulative within a conversation** (persistent, not per-turn-ephemeral). `composed-view.jsx` clears the released-event array on each turn archive (`setEvents([])` in the `turnComplete` effect), so the "Event log" is **empty at conversation-complete** — reads as broken. **Owner directive (316.6): persistent/cumulative** across the conversation — stop wiping between turns (in-memory; no DB). The lighter in-memory choice supersedes §6's localStorage persistence (D-WS2-20). Small state fix in `composed-view.jsx`. Host-owned. | Medium | Cycle 316.6 (live; #4 owner decision — persistent) |
| BL-8 | **Payload-surfacing** — show each step's real **per-turn** content ("this turn") beneath its fixed teaching line. The host already computes these artifacts in `converse.js` and discards them: parsed intent (take_the_order), assembled-prompt metadata (brief_the_chef), model+latency+tokens (plate_the_dish), parsed markers/tickets (read_the_ticket), served answer (serve_by_type — already shown), recorded side-effects (stock_the_pantry). **Design intent: paired, lesson-primary, payload-subordinate.** The overlay's teaching message stays primary (the lesson; constant; overlay-owned #6); the payload is a compact, visually subordinate "this turn" block beneath it (the proof; varying; host-owned). **Never replace the teaching message.** Payload weight varies per step; consider payload-on-demand if the walk crowds, but **default to showing it** (a credibility wedge must show its proof). This is the **credibility-wedge** feature (third-party-dev adoption) and is **§6's original payload-bearing replay intent** (D-WS2-17 immutable turn record) re-aimed from replay to surfacing. Est. **~½ cycle minimum-credible** (intent + markers + usage, **no raw system prompt**) to **~1 cycle full** (incl. assembled prompt — needs redaction review + an A2 `CONTRACT.md` amendment for an out-of-band payload channel). Likely **Cycle 317**. Security: never leak the system prompt / intake PII. Recommend a **cheap market probe before the full build**. Cross-cutting (host data + overlay display). | Medium | Cycle 316.6 (replay→payload reframe; credibility-wedge decision) |
| BL-9 | **Local-build fragility — overlay package pruned by `npm install`.** `@paradigmpilot/pattern-in-motion-overlay` is installed `--no-save` (per `render.yaml`'s pinned build command), so any subsequent `npm install` prunes it from `node_modules` — the local build then fails (`composed-view.jsx`'s overlay import unresolved) until it is reinstalled. **Production is unaffected** (`render.yaml` reinstalls at build time); the fragility is **local dev/build only**. Surfaced during WO-317.2a's local build gate (316.5d's SDK bump had silently pruned it). Fix candidate: a `postinstall`/`predev` hook **or** a documented setup step so the build gate does not break out from under future WOs. **Environmental, not caused by 317.2a** (no imports touched; `main` would fail identically). Host-owned (intake-triager build tooling). | Medium | Cycle 317.2 (WO-317.2a build-gate discovery) |

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
| BL-1 | Live "we had a problem recording this — please try again" error on real submit. **Root cause:** `MODEL` pointed at `claude-sonnet-4-20250514`, retired from the Claude API 2026-06-15; `404` at the LLM call, before any DB write (the "recording" wording was a red herring). **Fix:** `MODEL=claude-sonnet-4-6` + redeploy. **RECURRED 316.3** (dashboard override clobbered by blueprint re-sync); durable fix in `render.yaml` via WO-316.2e. | 315.8 | 315 |
| BL-2 | Compose the overlay into the deployed intake-triager (**host-mount build**). Carried from Cycle 315 as the OBJ-1-closing build. 316.3 landed the composed-view seam + shell + keyboard-advance live; 316.5 cleared the demo door (SDK × Node-26) so a turn completes; **316.6 confirmed end-to-end** — a full multi-turn intake completed in a clean incognito session (six-pill walk + keyboard advance + assistant replies; conversation reached `complete`). **OBJ-1 core delivered.** Remaining items are presentation, carved out and tracked separately: layout (BL-4), control relabel (BL-5), event-log persistence (BL-7). Owner-ratified Complete, Cycle 316.6. | 316.6 | 316 |

---

## Rejected

| ID | Name | Reason |
|----|------|--------|
| — | No items rejected | — |

---

_Index maintained by: Sam R. Harkreader_  
_Last updated: 2026-06-25_
