# Build Discoveries — Intake Triager

This log captures divergences between the build (this repo) and canon
(`intake-triager-gold-vision.md` v1.5 GOLD + `intake-triager-build-plan.md`)
that surface during the Cycle 303 build. Each entry is a one-line note
with phase, severity, date, and a short description.

Per `intake-triager-gold-vision.md` v1.5 §13 *Reconciliation rule*: when
this repo and canon disagree, the asset is wrong; update the asset, not
canon — except where the build literally cannot proceed (CRITICAL only),
which triggers a hard-pause + canon amendment + audit + resume per the
Cycle 303 baseline reconciliation discipline.

This log is consumed by Phase 9.D (Cycle 304) to decide whether v1.6
amendments to the gold vision or build plan are warranted.

## Severity scale

- **CRITICAL** — build cannot proceed; hard-pause + canon amendment + audit + resume
- **MAJOR** — build proceeds with a documented workaround; Phase 9.D triages for canon amendment
- **MINOR** — interpretive clarification or cosmetic; Phase 9.D may tighten canon language

## Entries

| #  | Phase | Severity | Date       | Note                                                                                                                                                                                                                                                                                                              |
| -- | ----- | -------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1  | 0     | MINOR    | 2026-04-29 | Phase 0 gate language ("`npm run dev` starts Express on `PORT` and Vite on `:5173` concurrently") cannot pass on `package.json` + configs alone — Express needs `src/backend/app.js`, Vite needs `src/frontend/index.html`. Resolved in WO-303.1b via minimum-viable stubs per build plan §Phase 0 *placeholder files where needed*. Phase 9.D: consider tightening gate language to specify "stubs sufficient to launch both processes" rather than "starts Express and Vite." |
| 2  | 0     | MINOR    | 2026-04-29 | Vitest 2.x exits with code 1 (not 0) by default when no test files are found, contrary to the build plan's "`npm test` runs green (zero tests)" gate language. Resolved in WO-303.1a by setting the `test` script to `vitest run --passWithNoTests`; the flag is inert once Phase 3+ unit tests exist. Phase 9.D: consider specifying `--passWithNoTests` (or the equivalent for whichever runner is pinned) in build plan §Phase 1 deliverables, or noting the runner-default sensitivity in §Phase 0 *Gate*. |
