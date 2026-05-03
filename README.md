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

## Pinned stack

- Node.js 20+ with Express
- PostgreSQL 15+
- React 18 with Vite
- `@anthropic-ai/sdk` — non-streaming `messages.create`
- Default model: `claude-sonnet-4-20250514` (override via `MODEL` env var)

### Required dependencies

| Layer | Packages |
| --- | --- |
| Backend runtime | `express`, `pg`, `cors`, `dotenv`, `@anthropic-ai/sdk` |
| Frontend runtime | `react`, `react-dom` |
| Frontend build | `vite`, `@vitejs/plugin-react` |
| Test | `vitest` |

## Getting started

### Prerequisites

- Node.js 20 or newer
- PostgreSQL 15 or newer (`gen_random_uuid()` is built into PG 13+)
- An Anthropic API key

### Install

```sh
git clone https://github.com/ParadigmPilot/intake-triager.git
cd intake-triager
npm install
```

### Configure

```sh
cp .env.example .env
# Edit .env: ANTHROPIC_API_KEY, DATABASE_URL, ORG_NAME, CRISIS_LINE at minimum.
```

See [Configuration](#configuration) for every key.

### Bootstrap the database

```sh
psql "$DATABASE_URL" -f src/db/schema.sql
```

The same DDL exists at `src/db/migrations/001-initial.sql` (byte-for-byte identical). The `migrations/` directory is the seed for future migration tooling; today, only `schema.sql` is run. See [Database](#database).

### Run dev

```sh
npm run dev   # starts the backend on PORT (default 3000) and Vite on :5173 concurrently
```

Open http://localhost:5173.

### Run tests

```sh
npm test          # unit suite — 9 files, 80 tests, no external services
npm run test:e2e  # E2E suite — drives Taylor through three rule paths against
                  # a real Anthropic API and an isolated test DB.
                  # Requires .env.test configured (template: .env.test.example).
```

The test runner is [Vitest](https://vitest.dev/). The E2E suite runs under a separate config (`vitest.e2e.config.js`); see `test/e2e/` for path tests and helpers.

## HTTP contract — `POST /converse`

The backend exposes one external route. The Runner calls only this route.

### Request

```json
{
  "content": "string (required, ≤ 8000 chars)",
  "conversation_id": "UUID (optional — omit on first turn)"
}
```

`Content-Type` must be `application/json`. The handler explicitly **rejects `multipart/form-data`** with a 400 — the conversation surface is text only and accepts no binary attachments. (See `src/backend/security/input-validation.js`.) This is a defensive rejection of binary uploads at the door, not an attachment-size cap.

### Response (success)

```json
{
  "conversation_id": "UUID",
  "reply": { "role": "assistant", "content": "string" },
  "status": "active | complete | escalated"
}
```

### Status codes

| Code | Meaning |
| --- | --- |
| `200` | Successful turn. The body's `status` field tells the client what happened — turn continues, conversation completed, or conversation escalated. |
| `400` | Validation failure (`error.code: "VALIDATION_FAILED"`) — bad content-type, length cap, missing field, or malformed JSON. |
| `429` | Rate limit (`RATE_LIMITED`) or per-conversation token ceiling (`TOKEN_CEILING_EXCEEDED`). |
| `500` | Unexpected server error (`INTERNAL_ERROR`). |

### Error shape

```json
{ "error": { "code": "STABLE_IDENTIFIER", "message": "patron-safe message" } }
```

`error.message` is generic and never carries raw AI output, stack traces, or schema detail. `error.code` is stable for client branching.

### Conversation-id flow

The first turn omits `conversation_id`; the handler mints a new UUID, inserts a row in `conversations` with `status='active'`, and returns the new id. Subsequent turns pass back the `conversation_id` from the prior response. End-to-end multi-turn flow asserted in `test/e2e/standard-intake.test.js`.

## License

Apache-2.0.
