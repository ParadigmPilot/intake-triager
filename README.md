# Intake Triager

> An employee describes a workplace concern. Taylor structures it. The system routes it.

A worked example of the **Restaurant pattern**: a small, complete LLM-powered application that receives employee reports of workplace concerns and emits a single machine-readable triage record routing each report to the appropriate owner with the appropriate urgency.

The product exists to make one thesis defensible: a single pattern, applied with discipline, produces an LLM application that is small, correct, and extensible — without bespoke architecture per use case. This repo is the running implementation; the canonical specification is `intake-triager-gold-vision.md` (per its §2 *Vision*). Every claim in this README is verifiable against the shipped code at this commit.

This repo ships the **Employee Relations** variant. The intake domain is swappable (HR → Legal → Medical → whatever) by replacing the prompt file and adjusting the schema accordingly — see the gold vision §8 *Variant model*.

## What it does

The conversation is the surface. An employee opens the app, describes a concern in their own words, and works through a structured exchange with **Taylor**, the AI intake coordinator. Taylor asks one question at a time, validates without judging, periodically summarizes back to invite correction, and — when enough has been gathered — emits a single `TRIAGE_RECORD` marker that hands the report off downstream. The marker carries severity, category, suggested owner, required timeline, escalation flag, confidentiality level, and an anonymity flag — eight fields total, persisted to a `triage_records` row with the original marker JSON kept as `raw_marker` for audit.

## The Restaurant pattern

The product implements the Restaurant pattern from `Every_LLM_App_Is_a_Restaurant.pptx`. Pattern terms map to specific code locations; the table is the contract.

| Restaurant actor / room | Code |
| --- | --- |
| The Patron | End user in a browser |
| The Dining Room | `src/frontend/components/App.jsx` + `Transcript.jsx` |
| The Runner | `fetch()` POST in `src/frontend/components/MessageInput.jsx` |
| The Hand-off Window | HTTP/HTTPS wire to `api.anthropic.com` |
| The Pass — bootstrap | `src/backend/app.js` (Express, mounts middleware and routes) |
| The Pass — `/converse` route | `src/backend/converse.js` (one-turn handler) |
| The Expediter | `src/backend/expediter.js` (parser + marker dispatcher) |
| The Briefing | `src/backend/prompt-assembler.js` (system prompt + history) |
| The Pantry | `src/backend/pantry.js` (PostgreSQL via `pg`) |
| The Line | `src/backend/chef.js` (SDK bridge to Anthropic Messages API) |
| The Chef | Claude (`MODEL` env var; default `claude-sonnet-4-20250514`) |
| The Front of House Persona | Taylor — `src/backend/prompts/system.md` |
| The Ticket | `TRIAGE_RECORD` marker, handled by `src/backend/handlers/triage-record.js` |
| Cooking | `POST /v1/messages` — one inference turn, non-streaming |
| **The Triager** *(composite role — central to this product)* | **Taylor (the Front of House Persona) executing on the Chef (Claude).** Not a separate code module — the runtime collaboration of the persona and the model. |

## License

Apache-2.0.
