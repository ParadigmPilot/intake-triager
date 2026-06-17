---
# === IDENTITY FIELDS ===
name: Model-Deprecation Early Warning
path: products/intake-triager/product-management/backlog/model-deprecation-early-warning.md
project: Hopper

# === CLASSIFICATION FIELDS ===
doctype: Backlog
artifact: backlog
structural_role: singleton
level: Operational
scope: local
layer: M0

# === GOVERNANCE SPECIFICATION ===
governance_spec_version: "1.0"

# === VERSIONING FIELDS ===
version: "1.0"
created_by: Sam R. Harkreader
created_with: Claude Opus 4.8
created_at: 2026-06-17T11:30:00-06:00
updated_by: Sam R. Harkreader
updated_with: Claude Opus 4.8
updated_at: 2026-06-17T11:30:00-06:00

# === DESCRIPTION FIELDS ===
purpose: Surface model deprecation/retirement before it silently breaks /converse turns, with no automated model substitution

# === RELATIONSHIP FIELDS ===
inherits:
  - products/hopper/engineering/foundation/document-schemas/backlog-composite/backlog-item/backlog-_item-archetype.md
depends_on: []
related: []
implements: []

# === CLASSIFICATION STATUS ===
classification_status: pending

# === ITEM EXTENSION FIELDS (common) ===
item_id: 3
item_status: Planning
parent_collection: products/intake-triager/product-management/backlog/backlog-_index.md

# === BACKLOG EXTENSION FIELDS (extended) ===
backlog_id: 3
backlog_status: Captured
priority: Medium
source: Cycle 316.3 (live Render validation — BL-1 recurrence)
tags:
  - resilience
  - ops
  - model-config
---

# Model-Deprecation Early Warning

**ID:** BL-3  
**Status:** Captured  
**Priority:** Medium  
**Source:** Cycle 316.3 (live Render validation — BL-1 recurrence)  
**Created:** 2026-06-17

---

## Summary

Provide a human-in-the-loop early-warning mechanism that surfaces a deprecated or
retired `MODEL` identifier *before* it silently breaks `/converse` turns — without
ever auto-changing the running model configuration.

---

## Problem Statement

In Cycle 316.3 the live deploy returned a `404 not_found_error` on every turn
because the pinned `MODEL` (`claude-sonnet-4-20250514`) had been retired from the
Claude API on 2026-06-15. The failure was invisible until a real user turn hit the
LLM call; nothing warned ahead of the retirement date.

This is the **second occurrence** of the same root cause (BL-1, 315.8). A pinned
model is the correct design — it is reliable and migrations are deliberate — so the
gap is not the pin itself but the absence of advance warning before a model reaches
its retirement date.

An auto-updater is explicitly **not** the answer: (a) it is a supply-chain risk to
let an external signal rewrite production config with no human in the loop, and
(b) it would not work — Anthropic model IDs are pinned snapshots, not evergreen
pointers, so there is no "always-newest" string to target. Migration must remain a
deliberate human decision.

---

## Proposed Solution

One of two human-in-the-loop approaches (to be chosen at design time):

1. **Boot-guard** — at server start, verify the configured `MODEL` resolves against
   the Anthropic API (a cheap models-endpoint check or a minimal probe). Fail-fast
   or loud-warn at deploy time rather than at the first user turn. Reuses the
   existing `REQUIRED_ENV` boot-check seam in `server.js`.
2. **Scheduled deprecation check** — a periodic job that confirms the configured
   `MODEL` is still listed/active and alerts (log warning / email) when it is
   deprecated or approaching retirement. Changes nothing; notifies only.

Both keep the human as the migration decision-maker.

---

## Acceptance Criteria

- A retired or deprecated configured model is surfaced to an operator **before**
  (boot-guard: at deploy) or **ahead of** (scheduled: before the retirement date)
  it can silently fail user turns.
- No automated model substitution occurs at any point.
- The mechanism reads the configured `MODEL` from the single source of truth
  (`render.yaml`), consistent with the durable-config lesson from BL-1 recurrence.

---

## Out of Scope

- Any mechanism that rewrites `MODEL` or selects a model automatically.
- Broader env-var drift detection (blueprint-vs-dashboard) beyond the model
  identifier — tracked separately if pursued.

---

## See Also

- BL-1 (Complete, 315.8; **recurred** 316.3) — the model-retirement turn failure
  this item is designed to pre-empt.
- WO-316.2e — the durable `render.yaml` `MODEL` fix that resolves the 316.3
  recurrence (`claude-sonnet-4-20250514` → `claude-sonnet-4-6`).
