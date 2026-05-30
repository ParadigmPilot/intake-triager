# Substrate

The pattern-in-motion substrate — state machine, event stream, and manifest loader for the Restaurant Pattern overlay.

## What this is

The substrate is the hook surface. Anything that wants to render the Restaurant Pattern atop a working LLM application subscribes to this substrate's event stream, reads per-state content from this substrate's manifest loader, and never touches `intake-triager` internals.

This is the reference implementation's contribution to the overlay ecosystem. The overlay itself lives in a sibling repository (`ParadigmPilot/pattern-in-motion-overlay`) and consumes this substrate's public contract.

## Public contract

Three exports from `./index.js`:

- `createStateMachine()` — produces a state machine over the seven canonical states (six Service steps + `at_the_table` idle). Concurrency-honest: set-of-active-steps, not single-active-step.
- `createEventStream()` — produces an event emitter that issues `step_started` / `step_ended` event pairs. Each event carries `{ type, stepId, timestamp }`. No introspection into the host application.
- `loadManifest()` — resolves per-state content from a seven-field manifest shape: `restaurant_label`, `technology_label`, `animation_asset`, `plain_english`, `in_code`, `just_finished`, `up_next`. The `up_next` field follows the §5.1 standard form: verb + what + why, expressed in the Restaurant frame.

## The seven states

| State ID | Service step |
| --- | --- |
| `at_the_table` | Idle (initial; returned-to after Step 06) |
| `take_the_order` | Step 01 |
| `brief_the_chef` | Step 02 |
| `plate_the_dish` | Step 03 |
| `read_the_ticket` | Step 04 |
| `serve_by_type` | Step 05 |
| `stock_the_pantry` | Step 06 |

## Canonical sources

The substrate's contract derives from three locked governance documents:

- `reference-implementation-vs-overlay-scoping-document.md` v1.0 — separation posture (Option C — Fully Detached); hook contract surface bounds
- `reference-implementation-vs-overlay-decision-memo.md` v1.0 — deliberation behind the separation posture
- `station-architecture-scoping-document.md` v1.2 — seven-state machine (D-WS1-2); `step_started` / `step_ended` pairs (D-WS1-3); set-of-active-steps (D-WS1-4); seven-field manifest schema (D-WS1-6); §5.1 content & vocabulary constraints (including the `up_next` standard); §WS-3 manifest content rules

## Status

Scaffolded at Session 312.2 (WO-312.2b). Bodies implemented incrementally across WO-312.2c+ per the Cycle 312 baseline.
