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

## Database

Three tables, all carrying `owner_id` from day one. Single-tenant by design; multi-tenant isolation is taught in *Implementing Standards for LLM Apps* (gold vision §11).

### Tables

| Table | Purpose | Key columns |
| --- | --- | --- |
| `conversations` | One row per intake | `id` UUID PK, `owner_id` UUID NOT NULL, `status` (`active` / `complete` / `escalated` / `abandoned`), `created_at`, `updated_at` |
| `messages` | Append-only by convention | `id` BIGSERIAL PK, `conversation_id` FK (CASCADE), `owner_id` UUID NOT NULL, `role` (`user` / `assistant` / `system`), `content` TEXT, `token_usage` JSONB, `created_at` |
| `triage_records` | One row per completed intake | `id` BIGSERIAL PK, `conversation_id` FK + **`UNIQUE`**, `owner_id` UUID NOT NULL, eight marker fields (`severity`, `category`, `suggested_owner`, `required_timeline`, `summary` ≤ 160 chars, `escalation_flag`, `confidentiality_level`, `anonymous`), `raw_marker` JSONB |

### One-record-per-conversation invariant

`triage_records.conversation_id` carries a database **`UNIQUE` constraint**. The "exactly one TRIAGE_RECORD per conversation" rule is enforced at the schema level, not by application logic — a duplicate insert raises `unique_violation` and surfaces as a programmer error.

### `owner_id` discipline

Every Pantry read filters by `owner_id`; every write carries it. The single-user demo hardcodes `req.user.id = '00000000-0000-0000-0000-000000000001'` in the identity stub at `src/backend/app.js`. The shape survives unchanged when real identity (JWT, etc.) lands; auth becomes a substitution, not a rewrite. (See gold vision §10 items 10–11.)

### `schema.sql` vs `migrations/`

The DDL you run today is `src/db/schema.sql`. `src/db/migrations/001-initial.sql` is byte-for-byte identical and exists as the seed for future migration tooling. The two files are kept in sync by hand for now; production-grade migration management is taught in *Implementing Standards for LLM Apps*.

## Behavior contract

Taylor's full ruleset lives in `src/backend/prompts/system.md`. That file is the locked prompt; every rule is load-bearing.

### Taylor does

- Receive employee reports in the employee's own words
- Ask one question at a time
- Validate without judging
- Periodically summarize and invite correction
- Apply mandatory escalation **when triggers fire** (protected class, threats, retaliation, illegal activity)
- Surface a crisis resource line and end the conversation if the employee indicates self-harm or harm to others
- Emit exactly one `TRIAGE_RECORD` per conversation, on the turn the intake is complete

### Taylor does not

- Investigate
- Promise outcomes, timelines, or investigations
- Disclose prior reports, policies, or identities
- Name a specific accused person back to the employee in Taylor's own voice
- Collect information beyond what is needed to triage
- Use HR jargon or legal terminology
- Lead the employee toward a particular characterization of events

### Mandatory escalation

When one of Rule 6's triggers fires — harassment or discrimination based on a protected class, threats or safety risk, retaliation for prior reporting, illegal activity — Taylor flags the report by setting `escalation_flag` to `true` on the emitted `TRIAGE_RECORD` and assesses severity per the specific risk profile (typically `high` or `urgent`). In prose, Taylor stops routine intake, surfaces the escalation plainly, and asks if the employee wants immediate escalation now. End-to-end behavior asserted in `test/e2e/mandatory-escalation.test.js`.

### Crisis-end semantics

When Rule 7 fires (the employee indicates self-harm, harm to others, or any acute crisis), Taylor surfaces the configured `CRISIS_LINE` to the employee, refuses to continue intake, and refuses to resume on any subsequent turn — restating the crisis line each time. Crisis-end is **behavior-level termination, not data-model termination**:

- `conversations.status` stays `active` (no DB-level state change)
- No `TRIAGE_RECORD` is emitted, so no `triage_records` row is written
- The frontend may disable input on detecting the crisis-line response

End-to-end behavior asserted in `test/e2e/crisis-end.test.js`. See gold vision §6 *Crisis-end semantics*.

## Public API surface

Internal modules expose narrow surfaces; these are the canonical signatures shipped at this commit.

### Pantry — PostgreSQL access (`src/backend/pantry.js`)

Every public method takes a final optional `tx` parameter; when supplied (from a `transaction(...)` block), the call routes through the transaction client, otherwise through the connection pool. Every read or write that touches user-scoped data filters by `owner_id`. `query` is the lone exception — locked to migration code, no `tx`, no `owner_id`.

| Method | Signature |
| --- | --- |
| `insertConversation` | `(owner_id, tx?) → {id: UUID}` |
| `appendMessage` | `({conversation_id, role, content, token_usage, owner_id}, tx?)` |
| `loadMessages` | `(conversation_id, owner_id, tx?) → [{id, role, content, token_usage, created_at}]` |
| `insertTriageRecord` | `(record, tx?)` — raw INSERT (not upsert); duplicate raises `unique_violation` |
| `setConversationStatus` | `(conversation_id, status, owner_id, tx?)` |
| `sumConversationOutputTokens` | `(conversation_id, owner_id, tx?) → number` |
| `transaction` | `(async (tx) => …) → callback's return value`; auto-commits on resolve, rolls back on throw |
| `query` | `(sql, params)` — migration code only |

### Briefing — prompt assembly (`src/backend/prompt-assembler.js`)

| Method | Signature |
| --- | --- |
| `assemblePrompt` | `({placeholders, history}) → [{role, content}]` |

Reads `src/backend/prompts/system.md` once at module load (process-lifetime cache), substitutes `{{NAMES}}` against `placeholders`, prepends as the system message, appends `history`, returns the array passed to the SDK.

### Chef — SDK bridge (`src/backend/chef.js`)

| Method | Signature |
| --- | --- |
| `cook` | `(briefing) → {text, usage}` |

Single-call wrapper around `@anthropic-ai/sdk` `messages.create`. Non-streaming. Uses the configured `MODEL` value.

### Expediter — parser + dispatcher (`src/backend/expediter.js`)

| Method | Signature |
| --- | --- |
| `parse` | `(reply) → {prose, markers}` — strips marker comments from prose, returns parsed markers `[{type, payload}]` |
| `dispatch` | `(markers, ctx)` — routes each marker to its registered handler; `ctx` is `{conversation_id, owner_id, tx}` |

## Configuration

The repo ships `.env.example` with **nine keys**. Production values override per environment.

| Variable | Default | Purpose | Read by |
| --- | --- | --- | --- |
| `ANTHROPIC_API_KEY` | (placeholder — required) | Authenticates calls to api.anthropic.com | `src/backend/chef.js` (via SDK) |
| `DATABASE_URL` | `postgres://user:pass@localhost:5432/intake_triager` | Postgres connection string | `src/backend/pantry.js` |
| `MODEL` | `claude-sonnet-4-20250514` | Claude model used by the Chef | `src/backend/chef.js` |
| `PORT` | `3000` | Backend listen port | `src/backend/server.js` |
| `RATE_LIMIT_PER_IP_PER_MINUTE` | `20` | Per-IP request cap on `/converse` | `src/backend/security/rate-limit.js` |
| `CONVERSATION_TOKEN_CEILING` | `200000` | Cumulative output-token cap per conversation | `src/backend/security/cost-ceiling.js` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated allowed origins | `src/backend/security/cors.js` |
| `ORG_NAME` | (set per deployment) | Substituted into `{{ORG_NAME}}` in `system.md` | `src/backend/converse.js` |
| `CRISIS_LINE` | (set per deployment) | Substituted into `{{CRISIS_LINE}}` in `system.md` | `src/backend/converse.js` |

The frontend (Vite) runs on `:5173`. The backend listens on `PORT`.

## Observability

The basic posture this repo ships:

- **Structured JSON logs to stdout, one line per event.** Required fields: `timestamp` (ISO-8601 UTC), `level`, `event`, `conversation_id` (when applicable), `owner_id` (when applicable), `error` (when level is `error`).
- **No metrics, no tracing, no APM.** Single-instance teaching code does not need them.
- **No request-ID propagation.** Single-instance only.

The single producer of structured logs is `src/backend/observability.js`, which exports `log({level, event, ...fields})`. The `/converse` handler emits four event categories at the documented points:

| Event | Level | Where |
| --- | --- | --- |
| `converse_turn_received` | `info` | Top of the handler, after `owner_id` is known |
| `converse_token_ceiling_exceeded` | `warn` | Before the 429 short-circuit |
| `converse_turn_complete` | `info` | After the transaction commits, before the success response |
| `converse_handler_error` | `error` | Catch block (carries `error.message`) |

Boot emits `server_listening` from `src/backend/server.js`. Production-grade observability — metrics, distributed tracing, log aggregation, request correlation, error reporting — is taught in *Implementing Standards for LLM Apps*.

## License

Apache-2.0.
