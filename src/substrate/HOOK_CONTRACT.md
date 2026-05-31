# Pattern-in-Motion Substrate — Hook Contract

> This is the canonical public contract for the pattern-in-motion substrate. The substrate exposes four entry points; the overlay consumes them; no other surface is supported.

---

## What is this?

The pattern-in-motion substrate is the underlying machinery — state tracker, event emitter, manifest loader, content validator — that everything visible plugs into. It lives inside the `intake-triager` reference implementation and is consumed by separate overlay packages (the pin renderer, the manual-mode UI, and any third-party consumer) that subscribe to its event stream and read its per-state manifests.

This document is the doorway. It names the public surface and points at the source files where the authoritative signatures live (as JSDoc). When you need to know **what something does**, read this file. When you need to know **what to pass and what comes back**, click through to the source.

---

## What you can call

The substrate's entire public surface is exposed through [`./index.js`](./index.js):

| Export | Source | Purpose |
| --- | --- | --- |
| `STATES` | [`./state-machine.js`](./state-machine.js) | The frozen seven-state set (six Service steps + `at_the_table` idle). |
| `createStateMachine` | [`./state-machine.js`](./state-machine.js) | Construct a state machine that tracks the set of active Service steps. |
| `createEventStream` | [`./event-stream.js`](./event-stream.js) | Wrap a state machine with `step_started` / `step_ended` event emission and a subscription mechanism. |
| `loadManifest` | [`./manifest-loader.js`](./manifest-loader.js) | Resolve the seven-field per-state manifest for a given stepId. Structural validation only. |
| `validateContent` | [`./content-validator.js`](./content-validator.js) | Advisory content-rule validation. Returns diagnostics; does not throw on content violations. |

Click through to each source file for parameter types, return shapes, and `@throws` conditions. JSDoc is the source of truth; this table is the index.

---

## How subscribing works

Construct a state machine, wrap it in an event stream, and subscribe a callback:

- Every successful state transition emits exactly one event.
- Events carry `type` (`'step_started'` or `'step_ended'`), `stepId` (one of the seven), and `timestamp` (milliseconds since the Unix epoch).
- `subscribe()` returns an **unsubscribe function**. Call it to detach. The shape is intentionally compatible with React's `useEffect` cleanup convention.
- Emission ordering: the state machine updates first; the event emits second. If the state machine throws (e.g., starting an already-active step), no event is emitted.

For exact signatures and error conditions, see the JSDoc on [`createEventStream`](./event-stream.js).

---

## State set

The seven step IDs are defined as code identifiers in [`./state-machine.js`](./state-machine.js) under `STATES`. Use these exact strings when subscribing, dispatching, or reading manifests:

- `'at_the_table'` — idle / initial state. Returned to when no Service steps are active.
- `'take_the_order'` — Step 01.
- `'brief_the_chef'` — Step 02.
- `'plate_the_dish'` — Step 03.
- `'read_the_ticket'` — Step 04.
- `'serve_by_type'` — Step 05.
- `'stock_the_pantry'` — Step 06.

`at_the_table` is implicit-idle. It cannot be started or ended via `startStep` / `endStep`; it is added to and removed from the active set automatically as Service steps begin and end.

---

## Boundary rules

Consumers **MUST NOT** reach into `intake-triager` internals. The five exports listed under [What you can call](#what-you-can-call) are the entire public surface. Anything else — internal files, private modules, side-effect imports, the `backend/`, `frontend/`, or `db/` directories — is unsupported and may break without notice.

This boundary is enforced by convention, not by tooling. The convention exists so that:

- Trainees who clone `intake-triager` receive no overlay code (per `reference-implementation-vs-overlay-scoping-document.md` v1.0 §4).
- Overlay packages remain genuinely detachable from the reference implementation.
- Future third-party overlay consumers have a stable contract to build against without coordinating on intake-triager internals.

If you find yourself wanting to import something outside this contract, open a discussion before doing it. The contract can evolve; introspection cannot.

---

## Versioning & Change Notes

| Version | Date | Notes |
| --- | --- | --- |
| 1.0 | 2026-05-31 | Initial publication. Versioning policy (SemVer discipline, release mechanism, compatibility coupling, registry choice) deferred — see `reference-implementation-vs-overlay-scoping-document.md` v1.0 §9 Open Item #3. Absence of a versioning policy here is intentional, not an oversight. |
