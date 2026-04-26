# Intake Triager

**Employee Relations intake, structured end-to-end.**

A small, complete LLM-powered application that receives and structures employee
reports of workplace concerns, then generates a triage record that routes each
report to the appropriate owner with the appropriate urgency.

This repo is the worked example behind *Implementing the Restaurant* — the
course that teaches how to build an LLM app from a single, portable pattern.
Every code fragment in that deck comes from this codebase verbatim. If you want
to understand the design, read the deck. If you want to run it, clone and go.

---

## See also

- **How LLM Apps Work** — see the pattern this app implements.
- **Implementing the Restaurant** — build one end to end (this repo is the example).
- **Implementing Standards for LLM Apps** — govern many, reliably.
- **JWT for LLM Apps** — authentication mechanics, end to end.
- **RBAC for LLM Apps** — authorization policy, end to end.

---

## What it does

An employee opens the app, describes a workplace concern in their own words,
and has a structured conversation with **Taylor**, the AI intake coordinator.
Taylor asks one question at a time, validates without judging, periodically
summarizes back to invite correction, and — when enough has been gathered —
emits a single machine-readable triage record that routes the report downstream.

Taylor does not investigate, promise outcomes, or act on behalf of the
employee. Taylor is an intake, not an informant.

The triage record captures severity, category, suggested owner, required
timeline, summary, escalation flag, confidentiality level, and anonymity
status. That record is what HR, Legal, Compliance, or the management chain
receives — structured, consistent, and ready to act on.

**This repo ships the Employee Relations variant.** The codebase is designed
so you can swap domains by replacing `src/backend/prompts/system.md` and
adjusting the `TRIAGE_RECORD` schema. HR → legal → medical → whatever.

---

## Terminology

Three terms this codebase uses precisely. Everywhere a slide, doc, or commit
message uses them, it uses them in these exact senses.

**Triager.** The intake-and-routing actor. **In this repo, the Triager is an
AI system** — Taylor, running on the Chef — not a human. A Triager receives
a report, gathers structure, and routes it to the appropriate owner with the
appropriate urgency. A Triager does *not* investigate, decide, or act on the
report. The traditional meaning of "triager" is a human (ER nurse, intake
specialist); we've borrowed the word for an AI performing the same function.

**Intake Triager.** The product name. Specifically: an LLM-powered application
that performs intake-and-routing for a specific domain. This repo ships the
Employee Relations variant. "Intake Triager" without qualification refers to
this repo's reference implementation.

**Intake.** One complete conversation between an employee and Taylor, from
first message to emitted `TRIAGE_RECORD`. One intake produces exactly one
triage record (enforced at the DB layer by `UNIQUE (conversation_id)` on
`triage_records`).

### A note on production deployments

The reference implementation in this repo runs as a **pure AI Triager** —
Taylor classifies severity, flags escalation, and routes without a human in
the loop. This is the cleanest way to teach the full LLM-app pattern
end-to-end, and it's the shape the deck walks through.

**Most real HR departments should not ship this shape.** Production Employee
Relations deployments typically require a **human-reviewed Triager**: Taylor
drafts the triage record, a trained HR partner reviews it before routing.
Mandatory-reporter laws, protected-class frameworks, and the emotional weight
of ER intake all push in the same direction — keep a human in the loop on
severity and routing decisions.

Adding the review step is a small architectural change: the `triage-record.js`
handler writes the record as `status: 'pending_review'` instead of routing
immediately; a separate reviewer UI surfaces pending records; routing fires on
approval. The pattern is the same; only the terminal action shifts. Consider
this the default shape when moving toward production.

---



## The pattern it implements

The Restaurant pattern, mapped to this codebase:

| Restaurant actor/room | Code |
|---|---|
| The Patron | End user in a browser |
| The Dining Room | React + Vite frontend |
| The Runner | `fetch()` POST over HTTPS |
| The Hand-off Window | HTTP/HTTPS wire to `api.anthropic.com` |
| The Pass | Node.js + Express (`src/backend/app.js`) |
| The Expediter | `src/backend/expediter.js` — parses response, extracts markers, dispatches |
| The Briefing | `src/backend/prompt-assembler.js` — assembles system prompt + history |
| The Pantry | PostgreSQL via `pg` (`src/backend/pantry.js`) |
| The Line | `@anthropic-ai/sdk` → Messages API (`src/backend/chef.js`) |
| The Chef | Claude (see `MODEL` in `.env`) |
| The Front of House Persona | Taylor — defined in `src/backend/prompts/system.md` |
| The Ticket | `TRIAGE_RECORD` marker, handled by `src/backend/handlers/triage-record.js` |
| Cooking | `POST /v1/messages` — one inference turn |

---

## Stack

- Node.js 20+ (Express)
- PostgreSQL 15+
- React 18 (Vite)
- `@anthropic-ai/sdk` — non-streaming `messages.create`

---

## Project structure

```
intake-triager/
├── README.md
├── package.json
├── .env.example
├── .gitignore
├── src/
│   ├── backend/
│   │   ├── app.js                   # Express app bootstrap (The Pass)
│   │   ├── converse.js              # POST /converse route handler
│   │   ├── prompt-assembler.js      # Builds the briefing (system + history)
│   │   ├── chef.js                  # SDK bridge to api.anthropic.com (The Line)
│   │   ├── expediter.js             # Response parser, marker extractor, dispatcher
│   │   ├── handlers/
│   │   │   └── triage-record.js     # Handles TRIAGE_RECORD tickets
│   │   ├── pantry.js                # Postgres access layer
│   │   ├── prompts/
│   │   │   └── system.md            # The system prompt (below)
│   │   └── security/
│   │       ├── rate-limit.js        # Per-Patron and per-Chef quotas
│   │       ├── input-validation.js  # Message length, content-type, attachment caps
│   │       └── prompt-injection.js  # User-text isolation from system instructions
│   ├── frontend/
│   │   ├── index.html
│   │   ├── main.jsx                 # React entry
│   │   └── components/
│   │       ├── App.jsx
│   │       ├── Transcript.jsx       # Conversation rendering (The Dining Room)
│   │       └── MessageInput.jsx     # Send path (The Runner)
│   └── db/
│       ├── schema.sql               # The Shelving Plan — DDL for all tables
│       └── migrations/
│           └── 001-initial.sql
└── test/
    ├── expediter.test.js
    ├── handlers.test.js
    └── prompt-assembler.test.js
```

---

## The system prompt

File: `src/backend/prompts/system.md`

This is the locked prompt. Every rule here is load-bearing; do not soften
without domain review. If you swap intake domains, you replace this file — but
the six-section structure (context, role, persona, rules, format, marker protocol) is
invariant.

```
[CONTEXT]
Today's date: {{TODAY}}
Organization: {{ORG_NAME}}
Crisis resource line: {{CRISIS_LINE}}

[ROLE]
You are the intake coordinator for an Employee Relations reporting
system at a mid-sized organization. Your job is to receive and
structure reports from employees about workplace concerns, then
generate a triage record that routes the report to the appropriate
owner with the appropriate urgency.

[PERSONA]
You are Taylor: a trained intake coordinator, warm but professional,
plainspoken, never leading. You validate without judging. You use
they/them pronouns when referring to people whose gender has not been
named. You do not use HR jargon or legal terminology.

[RULES]
1. Always open with a brief acknowledgment that the employee has taken
   a meaningful step by reaching out. Do not downplay or dramatize
   their concern.
2. Ask one question at a time. Never chain two questions in a single
   response.
3. Do not ask leading questions ("Did they make you feel
   threatened?") — ask open ones ("How did that interaction affect
   you?").
4. Periodically summarize what you have heard and invite correction
   before proceeding.
5. Never promise outcomes, investigations, or timelines. Say "I will
   route this to the appropriate team" — not "they will investigate"
   or "you will hear back in X days."
6. MANDATORY ESCALATION: if the report involves (a) harassment or
   discrimination based on a protected class, (b) threats or safety
   risk, (c) retaliation for prior reporting, or (d) illegal
   activity — classify severity as 'urgent' and escalation_flag as
   true. Stop routine intake; surface the escalation and ask if the
   employee wants immediate escalation now.
7. If the employee is in crisis, indicates self-harm, or indicates
   harm to others, stop intake. Provide the organization's crisis
   resource line and end the conversation.
8. Do not disclose any prior reports, policies, or identities. You
   are an intake, not an informant.
9. Never name a specific accused person back to the employee in your
   own voice. Use the employee's exact words when referring to people
   involved.
10. Collect only what's needed to triage: who was involved, when,
    what happened, where, whether there are witnesses or
    documentation, and whether prior reports exist. Nothing else.

[FORMAT]
- Respond in plain prose. No headings, no lists, no markdown.
- Keep each response short — typically 2 to 4 sentences.
- End each response with exactly one question, unless surfacing an
  escalation or closing the intake.

[MARKER PROTOCOL]
When you have gathered enough information to triage, emit a
TRIAGE_RECORD marker at the end of your response. The marker is a
single-line HTML comment with valid JSON:

<!-- TRIAGE_RECORD:{"severity":"...","category":"...",
"suggested_owner":"...","required_timeline":"...","summary":"...",
"escalation_flag":false,"confidentiality_level":"...",
"anonymous":false} -->

Emit the marker exactly once per conversation, on the turn the intake
is complete. Continue to respond in prose to the employee; the marker
is machine-only and invisible in rendered Markdown.
```

---

## The TRIAGE_RECORD marker

A single HTML comment containing valid JSON, emitted by the Chef at most once
per conversation. The Expediter extracts, validates against this schema,
strips from display, and dispatches to `handlers/triage-record.js`.

| Field | Type | Values |
|---|---|---|
| `severity` | enum | `"low"` \| `"medium"` \| `"high"` \| `"urgent"` |
| `category` | enum | `"interpersonal_conflict"` \| `"harassment_or_discrimination"` \| `"policy_violation"` \| `"safety_concern"` \| `"working_conditions"` \| `"management_issue"` \| `"retaliation"` \| `"other"` |
| `suggested_owner` | enum | `"HR_Partner"` \| `"Legal"` \| `"Compliance"` \| `"Manager_Chain"` \| `"Executive"` |
| `required_timeline` | enum | `"immediate"` \| `"48_hours"` \| `"1_week"` \| `"2_weeks"` \| `"standard"` |
| `summary` | string | ≤ 160 characters |
| `escalation_flag` | boolean | `true` if rule 6 applied |
| `confidentiality_level` | enum | `"standard"` \| `"sensitive"` \| `"executive_only"` |
| `anonymous` | boolean | `true` if employee declined identifying details |

Validation lives in `src/backend/handlers/triage-record.js`. If validation
fails, the handler logs and surfaces a generic "we had a problem recording this
— please try again" to the Patron; raw AI output is never surfaced.

---

## Database schema

File: `src/db/schema.sql`

```sql
CREATE TABLE conversations (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status       TEXT NOT NULL DEFAULT 'active'
                   CHECK (status IN ('active','complete','escalated','abandoned')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE messages (
    id               BIGSERIAL PRIMARY KEY,
    conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role             TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
    content          TEXT NOT NULL,
    token_usage      JSONB,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation_created
    ON messages (conversation_id, created_at);

CREATE TABLE triage_records (
    id                     BIGSERIAL PRIMARY KEY,
    conversation_id        UUID NOT NULL REFERENCES conversations(id),
    severity               TEXT NOT NULL
                             CHECK (severity IN ('low','medium','high','urgent')),
    category               TEXT NOT NULL,
    suggested_owner        TEXT NOT NULL,
    required_timeline      TEXT NOT NULL,
    summary                TEXT NOT NULL CHECK (length(summary) <= 160),
    escalation_flag        BOOLEAN NOT NULL DEFAULT false,
    confidentiality_level  TEXT NOT NULL DEFAULT 'standard',
    anonymous              BOOLEAN NOT NULL DEFAULT false,
    raw_marker             JSONB NOT NULL,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (conversation_id)
);
```

The `raw_marker` column stores the original JSON payload from the Chef —
useful for audits, debugging, and schema evolution. The `UNIQUE (conversation_id)`
constraint enforces rule-6 of the protocol: one triage record per conversation.

---

## Security posture

This repo ships with a **basic-app-level security floor**. It does *not*
implement enterprise authentication or policy governance; for those, see the
companion courses.

### In scope (implemented in this repo)

1. **Secrets discipline** — API keys in `.env`, `.gitignore` committed, `.env.example` shipped with placeholder values.
2. **TLS in production** — dev runs over HTTP; README and deployment notes require TLS in any non-local deployment.
3. **Input validation at the door** — message length caps, `Content-Type` checks, max attachment size (`src/backend/security/input-validation.js`).
4. **Output sanitization** — rely on React's default escaping; no `dangerouslySetInnerHTML`.
5. **Prompt-injection hygiene** — user text isolated from system instructions; Taylor never acts on behalf of the Patron without explicit confirmation handlers (`src/backend/security/prompt-injection.js`).
6. **Parameterized queries** — every Pantry call uses `pg` parameters; no string concatenation.
7. **Rate limit on `/converse`** — per-IP and per-conversation (`src/backend/security/rate-limit.js`).
8. **Cost ceiling per conversation** — token accounting metered at the Expediter; caps enforced before the Chef is called.
9. **CORS** — configured to known origins; wildcards forbidden.
10. **Object-level access scoping** — every Pantry read filters by `owner_id`; even the single-user demo carries `req.user.id = 1` so the DB layer teaches the right habit from day one.
11. **Identity stub** — minimal `req.user` shim in `src/backend/app.js` so every write carries "whose data is this?"

### Out of scope (see companion courses)

- RBAC and role-based authorization policy → **RBAC for LLM Apps**
- JWT-as-auth-backbone, token rotation, session management → **JWT for LLM Apps**
- Multi-tenant isolation at the DB layer → **Implementing Standards for LLM Apps**
- Audit logging for compliance
- SSO / SAML / OIDC
- Automated secrets rotation

Nothing in this list is optional for a production deployment — it's just not
what *this* repo teaches.

---

## Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ running locally
- An Anthropic API key

### Install

```bash
git clone https://github.com/paradigmpilot/intake-triager
cd intake-triager
npm install
cp .env.example .env
# Edit .env — set ANTHROPIC_API_KEY, DATABASE_URL, and MODEL
psql $DATABASE_URL -f src/db/schema.sql
npm run dev
```

The app will be at `http://localhost:5173`. The backend runs on `:3000`.

### `.env.example`

```
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgres://user:pass@localhost:5432/intake_triager
MODEL=claude-sonnet-4-20250514
PORT=3000
RATE_LIMIT_PER_IP_PER_MINUTE=20
CONVERSATION_TOKEN_CEILING=200000
```

The key in `.env` is a long-lived dev key. In production, rotate regularly,
store in a managed secrets system, and never commit `.env` to the repo (the
shipped `.gitignore` enforces this).

---

## Three ways to extend

From the *Implementing the Restaurant* Victory beat — make this yours by:

1. **Add a new ticket type.** Think of another structured artifact the intake
   should emit — say, a `FOLLOW_UP_TASK` for the assigned owner. Define the
   shape, add a handler in `src/backend/handlers/`, wire it into
   `expediter.js`. The pattern admits any ticket type that fits the marker
   protocol.

2. **Swap the intake domain.** Employee Relations → Legal Intake → Medical
   Intake → HR Onboarding. Replace `src/backend/prompts/system.md` with a new
   persona, role, and rule set; adjust the `TRIAGE_RECORD` schema to match
   the new domain. The Expediter, the Pantry schema (with minor field
   renames), and the Runner all carry forward.

3. **Deploy beyond localhost.** TLS in front, managed Postgres, observability,
   uptime monitoring, logging. The repo is a working reference, not a
   production deployment — but it's shaped so production hardening is
   additive, not invasive.

---

## What's not in this repo

- **Streaming responses** — the Intake Triager uses non-streaming `messages.create`. Adding streaming is a structured project; the Runner and the Pass both change. See the *Switch to streaming transport* slide in the *Scaling the Restaurant* appendix.
- **Authentication** — the `req.user` stub is a placeholder. Replace with JWT (see companion course) or your preferred auth pattern.
- **Multi-tenancy** — the DB schema is single-tenant. For governed platforms, see *Implementing Standards for LLM Apps*.
- **Tests beyond the core paths** — unit tests exist for Expediter, handlers, and prompt assembler. Integration tests and end-to-end tests are deliberately left as an exercise, so you see where the seams are.

---

## License

Apache-2.0.

---

## Acknowledgments

Built as the worked example for the *Implementing the Restaurant* course at
Paradigm Pilot. The Restaurant pattern itself is taught in the precursor
course, *How LLM Apps Work*.
