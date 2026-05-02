# Build Discoveries — `intake-triager`

This log records canon-vs-build divergences surfaced while building the
`intake-triager` repository against `intake-triager-gold-vision.md` (GOLD,
binding contract per §1 and §13). The vision is canon; the build conforms.
Every entry below is a place where reality and canon disagreed during
construction — recorded here, batched to Phase 9.D in Cycle 304 for
reconciliation.

## Severity

| Tier     | Meaning                                                                                                                       | Flow                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| CRITICAL | Build literally cannot proceed against the canon as written.                                                                  | Hard-pause: log here, edit gold vision, bump version, run audit, resume. (See gold vision §13.) |
| MAJOR    | Canon and build are in non-trivial disagreement. Build proceeds with a documented workaround; canon needs an update.          | Log here. Batched to Phase 9.D (Cycle 304).                                                     |
| MINOR    | Cosmetic, low-impact, or local-only divergence. Build proceeds without meaningful workaround; canon update tightens fidelity. | Log here. Batched to Phase 9.D (Cycle 304).                                                     |

## Status

- **Open** — discovery logged; no reconciliation action taken yet.
- **Reconciled** — Phase 9.D (or earlier) applied the canon update; entry kept for history.
- **Superseded** — overtaken by a later canon change that made the original divergence moot; entry kept for history.

## Reconciliation flow (per gold vision §13)

The vision is the binding contract. Build defects do not "amend" the vision unless they're CRITICAL. MAJOR and MINOR entries are reconciled by editing the responsible asset — typically the gold vision itself for canon gaps, or the WO content for WO defects — during Phase 9.D in Cycle 304.

Each entry below names a **Reconciliation target**: the file(s) and section(s) that need editing to close the divergence.

---

## Index

| ID    | Severity | Phase   | Discovered  | Status | Title                                                                          |
| ----- | -------- | ------- | ----------- | ------ | ------------------------------------------------------------------------------ |
| D1    | MINOR    | Phase 2 | Cycle 303.3 | Open   | WO-303.3a smoke-test ESM `import` uses bare Windows path                       |
| D2    | MINOR    | Phase 2 | Cycle 303.3 | Open   | WO-303.3a Success Criteria says "ten checks"; smoke test runs eleven           |
| D3    | MINOR    | Phase 3 | Cycle 303.3 | Open   | Gold vision silent on per-call `max_tokens` for Chef                           |
| D4    | MINOR    | Phase 5 | Cycle 303.6 | Open   | Gold vision §4 Repo structure missing `security/cors.js` and `cost-ceiling.js` |
| D5    | MINOR    | Phase 5 | Cycle 303.6 | Open   | Gold vision §11 Non-goals silent on Phase 5 unit-test files                    |
| D6    | MINOR    | Phase 5 | Cycle 303.6 | Open   | Gold vision §10 silent on `MAX_CONTENT_LENGTH`                                 |
| D7    | MINOR    | Phase 5 | Cycle 303.6 | Open   | Gold vision §10 item 5 silent on prompt-injection wrapper syntax               |
| D8    | MINOR    | Phase 5 | Cycle 303.6 | Open   | Cost ceiling lives in `cost-ceiling.js`, not `rate-limit.js`                   |
| D9    | MINOR    | Phase 5 | Cycle 303.6 | Open   | Gold vision §4 Pantry public API table missing `sumConversationOutputTokens`   |
| D10   | MINOR    | Phase 6 | Cycle 303.7 | Reconciled | Phase 0 `/health` stub removed by Phase 6 (canon-deviation self-healed)   |
| D11   | MINOR    | Phase 6 | Cycle 303.7 | Open   | Gold vision §11 Non-goals silent on `converse.test.js`                         |
| D12   | MINOR    | Phase 6 | Cycle 303.7 | Reconciled | `dotenv` declared in `package.json` but never imported                     |
| D13   | MINOR    | Phase 7 | Cycle 303.8 | Reconciled | PR #9 squash-merged when merge criterion required `Create a merge commit`  |
| D16   | MAJOR    | Phase 6 | Cycle 304.3 | Reconciled | Phase 6 shipped without gold vision §10 JSON one-line-per-event logging      |

---

## Entries

### D1 — WO-303.3a smoke-test ESM `import` uses bare Windows path

| Field       | Value                                                |
| ----------- | ---------------------------------------------------- |
| Severity    | MINOR                                                |
| Phase       | Phase 2 (Pantry)                                     |
| Discovered  | Cycle 303, Session 303.3 (Pantry smoke-test execution) |
| Status      | Open                                                 |

**Discovery.** The smoke-test script as authored in `wo-303.3a-pantry.md` §Verification → "Smoke-test script (verbatim)" uses a bare absolute Windows path in the ESM `import` statement:

```javascript
import pantry from 'C:/DevTools/hopper/products/intake-triager/src/backend/pantry.js';
```

Node 22's ESM loader rejects this with `ERR_UNSUPPORTED_ESM_URL_SCHEME`. On Windows, absolute paths in ESM `import` statements must be `file:///` URLs.

**Evidence.**

```
node:internal/modules/esm/load:209
    throw new ERR_UNSUPPORTED_ESM_URL_SCHEME(parsed, schemes);
          ^
Error [ERR_UNSUPPORTED_ESM_URL_SCHEME]: Only URLs with a scheme in: file, data,
and node are supported by the default ESM loader. On Windows, absolute paths
must be valid file:// URLs. Received protocol 'c:'
```

**Workaround applied (this session).** Patched the local copy of the smoke test before running:

```javascript
import pantry from 'file:///C:/DevTools/hopper/products/intake-triager/src/backend/pantry.js';
```

Smoke test then passed all eleven checks. The committed `pantry.js` itself is unaffected — the defect lives only in the WO's verbatim transcript.

**Reconciliation target.** Update `products/hopper/project-management/cycles/303/work-orders/wo-303.3a-pantry.md` §Verification → "Smoke-test script (verbatim)" to use the `file:///` URL form. WO-303.4b §Verification adopts the corrected pattern preemptively.

---

### D2 — WO-303.3a Success Criteria says "ten checks"; smoke test runs eleven

| Field       | Value                                                |
| ----------- | ---------------------------------------------------- |
| Severity    | MINOR                                                |
| Phase       | Phase 2 (Pantry)                                     |
| Discovered  | Cycle 303, Session 303.3 (Pantry smoke-test execution) |
| Status      | Open                                                 |

**Discovery.** WO-303.3a §Success Criteria reads:

> Smoke test passes all **ten** checks (insertConversation, loadMessages × 2, owner_id filter, insertTriageRecord, unique_violation, setConversationStatus × 2, transaction rollback × 2, transaction commit). Exit code 0.

The parenthetical enumerates eleven items (`× 2` items count as two). The smoke-test script runs eleven `check()` calls. Cosmetic counting error in the WO success criteria.

**Evidence.** Smoke-test output from Cycle 303.3 shows eleven `✓` lines:

```
✓ insertConversation returns {id: UUID}
✓ loadMessages returns 2 rows in order
✓ token_usage roundtrips as JSONB
✓ loadMessages filters by owner_id
✓ insertTriageRecord succeeds
✓ duplicate insertTriageRecord throws unique_violation
✓ setConversationStatus sets status to "complete"
✓ setConversationStatus bumps updated_at
✓ transaction propagates throw
✓ transaction rolls back on throw
✓ transaction commits on success
ALL CHECKS PASSED
```

**Workaround applied.** None needed — gate behavior is correct; only the WO's narrative count is off.

**Reconciliation target.** Update `products/hopper/project-management/cycles/303/work-orders/wo-303.3a-pantry.md` §Success Criteria text from "all ten checks" to "all eleven checks." Update §Plan/§Deliverables references in `session-303.2-checkpoint.md` if the same count is repeated.

---

### D3 — Gold vision silent on per-call `max_tokens` for Chef

| Field       | Value                                                |
| ----------- | ---------------------------------------------------- |
| Severity    | MINOR                                                |
| Phase       | Phase 3 (Briefing & Chef)                            |
| Discovered  | Cycle 303, Session 303.3 (WO-303.4b drafting)        |
| Status      | Open                                                 |

**Discovery.** Gold vision §4 *Chef public API* and §10 *Configuration* prescribe `MODEL` (default `claude-sonnet-4-20250514`) but do not specify a `max_tokens` value for the SDK's `messages.create` call. The `@anthropic-ai/sdk` Messages API requires `max_tokens` as a non-optional parameter; canon doesn't say what value to use.

**Evidence.** Gold vision §4 *Chef public API* full text:

> `cook(briefing) → {text, usage}` Single-call wrapper around `@anthropic-ai/sdk` Messages API. Takes the array from `assemblePrompt`. Returns `text` (assistant's reply string) and `usage` (the SDK's `{input_tokens, output_tokens}` object — persisted to `messages.token_usage` per §9). Non-streaming. Uses the configured `MODEL` value.

§10 *Configuration* enumerates nine env keys; `max_tokens` is not among them. SDK reference: a `max_tokens` parameter is required in `messages.create({model, max_tokens, system, messages})`.

**Workaround applied.** WO-303.4b Decision #3 fixes `MAX_TOKENS = 4096` as a module-load constant in `chef.js`. Rationale: defensible default for long-form intake-triager Q&A turns; per-turn ceiling, distinct from `CONVERSATION_TOKEN_CEILING` (cumulative cap, Phase 5).

**Reconciliation target.** Add `max_tokens` to gold vision §4 *Chef public API* (specifying value or env-driven origin). Owner ruling needed during Phase 9.D: hard-coded constant in `chef.js`, or new env key (e.g., `MAX_TOKENS_PER_TURN`) added to §10 *Configuration*. If env-driven, also add to `.env.example`.

---

### D4 — Gold vision §4 Repo structure missing `security/cors.js` and `cost-ceiling.js`

| Field       | Value                                                  |
| ----------- | ------------------------------------------------------ |
| Severity    | MINOR                                                  |
| Phase       | Phase 5 (Security floor)                               |
| Discovered  | Cycle 303, Session 303.6 (Phase 5 WO drafting)         |
| Status      | Open                                                   |

**Discovery.** Gold vision §4 *Repo structure* lists three files under `src/backend/security/`: `rate-limit.js`, `input-validation.js`, `prompt-injection.js`. Phase 5 ships two additional files at the same depth: `cors.js` (per WO-303.6e) and `cost-ceiling.js` (per WO-303.6d, also covered by D8).

§10 item 9 names CORS as a security-floor item and names the env var (`CORS_ALLOWED_ORIGINS`), but assigns no file path. The `cors` package is named in §4 *Required dependencies*. The file path `security/cors.js` is the natural sibling shape but is canon-silent.

**Evidence.** Gold vision §4 *Repo structure* tree under `src/backend/security/` (verbatim):

```
security/
├── rate-limit.js        # Per-IP and per-conversation
├── input-validation.js  # Length caps, content-type, attachment caps
└── prompt-injection.js  # User-text isolation
```

After Phase 5 merges, `src/backend/security/` contains:

```
security/
├── rate-limit.js
├── input-validation.js
├── prompt-injection.js
├── cors.js
└── cost-ceiling.js
```

**Workaround applied.** Created `src/backend/security/cors.js` per WO-303.6e and `src/backend/security/cost-ceiling.js` per WO-303.6d. Both modules follow the existing security-module shape (factory or middleware function reading env at call time).

**Reconciliation target.** Update gold vision §4 *Repo structure* tree to add `cors.js` and `cost-ceiling.js` under `src/backend/security/`. Phase 9.D in Cycle 304.

---

### D5 — Gold vision §11 Non-goals silent on Phase 5 unit-test files

| Field       | Value                                                  |
| ----------- | ------------------------------------------------------ |
| Severity    | MINOR                                                  |
| Phase       | Phase 5 (Security floor)                               |
| Discovered  | Cycle 303, Session 303.6 (Phase 5 WO drafting)         |
| Status      | Open                                                   |

**Discovery.** Gold vision §11 *Non-goals* names exactly three unit-test files in scope:

> unit tests for the Expediter, handlers, and prompt assembler (`test/expediter.test.js`, `test/handlers.test.js`, `test/prompt-assembler.test.js`)

Phase 5 ships five additional unit-test files (`input-validation.test.js`, `prompt-injection.test.js`, `rate-limit.test.js`, `cost-ceiling.test.js`, `cors.test.js`). Per the Cycle 303.6 strategy ruling, security tests are GOLD-aligned — going untested into Phase 8 E2E for input-validation regex bounds and rate-limiter clock math is reckless — but canon doesn't list them.

**Evidence.** Gold vision §11 *Non-goals* "In scope" paragraph (verbatim):

> In scope: an initial migration (`src/db/migrations/001-initial.sql` matching `schema.sql`) and unit tests for the Expediter, handlers, and prompt assembler (`test/expediter.test.js`, `test/handlers.test.js`, `test/prompt-assembler.test.js`). Anything beyond is in the table above.

After Phase 5 merges, `test/` contains eight files; canon names three.

**Workaround applied.** None — tests shipped per WOs 6a–6e. Each test file is colocated with its named-file canon rules and ships green.

**Reconciliation target.** Update gold vision §11 *Non-goals* "In scope" paragraph to add the five Phase 5 test files. Phase 9.D in Cycle 304.

---

### D6 — Gold vision §10 silent on `MAX_CONTENT_LENGTH`

| Field       | Value                                                  |
| ----------- | ------------------------------------------------------ |
| Severity    | MINOR                                                  |
| Phase       | Phase 5 (Security floor)                               |
| Discovered  | Cycle 303, Session 303.6 (WO-303.6a drafting)          |
| Status      | Open                                                   |

**Discovery.** Gold vision §10 item 3 prescribes "input validation at the door — message length caps" but does not specify a value. §10 *Configuration* enumerates nine env keys; none govern content length. The middleware needs a defensible numeric cap to enforce.

**Evidence.** Gold vision §10 item 3 (verbatim):

> 3. **Input validation at the door** — message length caps, `Content-Type` checks (the door rejects `multipart/form-data` by default; the conversation surface is text only). File: `src/backend/security/input-validation.js`.

§10 *Configuration* table — nine keys, none for content length. The phrase "message length caps" appears in item 3 but the value is canon-silent.

**Workaround applied.** WO-303.6a fixed `MAX_CONTENT_LENGTH = 8000` (chars) as a module-load constant in `input-validation.js`. Rationale: defensible default for one user message turn — well above conversational lengths but below denial-of-service input sizes. Same pattern as D3 (`MAX_TOKENS = 4096` in `chef.js`).

**Reconciliation target.** Add `MAX_CONTENT_LENGTH` (or equivalent) to gold vision §10. Owner ruling needed during Phase 9.D: hard-coded constant in `input-validation.js`, or new env key added to §10 *Configuration*. If env-driven, also add to `.env.example`.

---

### D7 — Gold vision §10 item 5 silent on prompt-injection wrapper syntax

| Field       | Value                                                  |
| ----------- | ------------------------------------------------------ |
| Severity    | MINOR                                                  |
| Phase       | Phase 5 (Security floor)                               |
| Discovered  | Cycle 303, Session 303.6 (WO-303.6b drafting)          |
| Status      | Open                                                   |

**Discovery.** Gold vision §10 item 5 prescribes "prompt-injection hygiene — user text isolated from system instructions" but does not specify the wrapper syntax (delimiters, neutralization rules, transport-vs-storage split) used to isolate user content within the message array sent to the Chef.

**Evidence.** Gold vision §10 item 5 (verbatim):

> 5. **Prompt-injection hygiene** — user text isolated from system instructions; Taylor never acts on the Patron's behalf without explicit confirmation handlers. File: `src/backend/security/prompt-injection.js`.

The phrase "user text isolated from system instructions" is the only constraint on the wrap mechanism; nothing about delimiter choice, escape rules, or where in the request flow the wrap is applied.

**Workaround applied.** WO-303.6b fixed `<user_message>...</user_message>` as the wrapper syntax with literal close-tag neutralization (replacing any `</user_message>` substring in user content with `&lt;/user_message&gt;` to prevent envelope escape). Wrap is applied at transport time between `pantry.loadMessages` and `Briefing.assemblePrompt`; storage stays raw. Rationale: well-known tag form; signals "data, not instructions" to Claude; defensive neutralization closes the obvious injection vector.

**Reconciliation target.** Add wrapper syntax specification to gold vision §10 item 5 (open/close tags, the neutralization rule, and the storage-vs-transport split). Phase 9.D in Cycle 304.

---

### D8 — Cost ceiling lives in `cost-ceiling.js`, not `rate-limit.js`

| Field       | Value                                                  |
| ----------- | ------------------------------------------------------ |
| Severity    | MINOR                                                  |
| Phase       | Phase 5 (Security floor)                               |
| Discovered  | Cycle 303, Session 303.6 (WO-303.6c/6d drafting)       |
| Status      | Open                                                   |

**Discovery.** Gold vision §10 item 7 prescribes "Rate limit on `/converse` — per-IP **and per-conversation**. File: `src/backend/security/rate-limit.js`." Build plan §Phase 5 deliverables list both per-IP rate limit and per-conversation cost ceiling under `rate-limit.js`. The Cycle 303.6 strategy ruling decomposed Phase 5 into five WOs (RULE-06), splitting per-conversation cost ceiling into a separate file `cost-ceiling.js`.

The two enforcement axes have different storage (in-memory `Map` vs Pantry-summed `output_tokens`), different error codes (`RATE_LIMITED` vs `TOKEN_CEILING_EXCEEDED`), different call sites (Express middleware vs in-handler check), and different lifecycles (transient vs persistent). The split improves RULE-06 fidelity and reading clarity, but diverges from canon's named file path.

**Evidence.** Gold vision §10 item 7 (verbatim):

> 7. **Rate limit on `/converse`** — per-IP and per-conversation. File: `src/backend/security/rate-limit.js`. Per-IP threshold from `RATE_LIMIT_PER_IP_PER_MINUTE` env var (default 20).

§10 item 8 (verbatim):

> 8. **Cost ceiling per conversation** — token accounting metered at the Expediter; caps enforced before the Chef is called. Threshold from `CONVERSATION_TOKEN_CEILING` env var (default 200000). Sum of `output_tokens` across all assistant messages in the conversation.

Item 8 names neither a file path nor a separate module — the canonical reading is that cost ceiling lives in `rate-limit.js` per item 7.

**Workaround applied.** Per-IP rate limit lives in `src/backend/security/rate-limit.js` (WO-303.6c). Per-conversation cost ceiling lives in `src/backend/security/cost-ceiling.js` (WO-303.6d). Both `app.js` (Phase 6) and `/converse.js` (Phase 6) will import from their respective modules.

**Reconciliation target.** Owner ruling needed during Phase 9.D: either (a) update gold vision §10 to name `cost-ceiling.js` as the file path for item 8 and clarify that item 7 covers only per-IP, or (b) consolidate `rate-limit.js` and `cost-ceiling.js` into one module per the original canon. (a) is the simpler change and matches the shipped code. Phase 9.D in Cycle 304.

---

### D9 — Gold vision §4 Pantry public API table missing `sumConversationOutputTokens`

| Field       | Value                                                  |
| ----------- | ------------------------------------------------------ |
| Severity    | MINOR                                                  |
| Phase       | Phase 5 (Security floor)                               |
| Discovered  | Cycle 303, Session 303.6 (WO-303.6d drafting)          |
| Status      | Open                                                   |

**Discovery.** Gold vision §4 *Pantry public API* declares "the Pantry exposes a small surface; everything else in `pantry.js` is internal." The accompanying table lists seven methods. Phase 5 added an eighth: `sumConversationOutputTokens(conversation_id, owner_id, tx)` for the cost-ceiling check. The new method was required because canon §4 also specifies that `pantry.query()` is "Migration code only; never called at request time" — `cost-ceiling.js` cannot reach around the public API to write its own SQL.

The shape and conventions of the new method match the existing seven (final optional `tx`, `owner_id` discipline, route through `_runner(tx)`); only the table is incomplete.

**Evidence.** Gold vision §4 *Pantry public API* (verbatim):

> The Pantry exposes a small surface; everything else in `pantry.js` is internal.

Followed by a seven-row table. After Phase 5 merges, `pantry.js` exports an eighth method.

**Workaround applied.** Added `sumConversationOutputTokens` per WO-303.6d. Method signature, SQL parameterization, transaction routing, and `owner_id` discipline match the existing seven methods. SQL uses `COALESCE(SUM((token_usage->>'output_tokens')::int), 0)` with a `role = 'assistant' AND token_usage IS NOT NULL` filter; returns `0` for empty conversations.

**Reconciliation target.** Add a row to gold vision §4 *Pantry public API* table:

> `sumConversationOutputTokens(conversation_id, owner_id, tx) → number` — Return the sum of `output_tokens` across all `role='assistant'` rows for the conversation, scoped to `owner_id`. Returns `0` for empty conversations. Used by `security/cost-ceiling.js` to enforce `CONVERSATION_TOKEN_CEILING` before the Chef is called.

Phase 9.D in Cycle 304.

---

### D10 — Phase 0 `/health` stub removed by Phase 6 (canon-deviation self-healed)

| Field       | Value                                                  |
| ----------- | ------------------------------------------------------ |
| Severity    | MINOR                                                  |
| Phase       | Phase 6 (The Pass)                                     |
| Discovered  | Cycle 303, Session 303.7 (WO-303.7a strategy review)   |
| Status      | Reconciled                                             |

**Discovery.** The Phase 0 placeholder `src/backend/app.js` (delivered by WO-303.1c) shipped with a `GET /health` smoke endpoint that has no canonical authority. Gold vision v1.5 §4 *HTTP API contract* closes with the strict-construction sentence "this is the only external HTTP contract this repo defines," referring to `POST /converse`. Strict reading makes `/health` a canon deviation. It lived on `main` from Session 303.1 through Session 303.6 (six sessions) before being noticed during WO-303.7a strategy.

**Evidence.** Gold vision §4 *HTTP API contract* (verbatim, closing sentence):

> This is the only external HTTP contract this repo defines.

Phase 0 `app.js` source (lines 9–10, as shipped at commit `e1befbe`):

```javascript
app.get('/health', (req, res) => res.json({ status: 'ok' }));
```

WO-303.1c declared the file as a placeholder explicitly: "full Express bootstrap (mounts middleware and routes) lands at Phase 6 (The Pass)." Strict construction at the time of authoring would have caught `/health`; it did not.

**Workaround applied.** None needed. Phase 6 WO-303.7a replaced the entire `app.js` content as part of the planned bootstrap rewrite; `/health` did not survive the replacement. Verified by Phase 6 manual gate: `curl -i http://localhost:3000/health` returns `404 Not Found`.

**Reconciliation target.** None — divergence self-healed in Cycle 303 by Phase 6 WO-303.7a (commit `3d919db`, merged via PR #7 at `b58bdb8`). Entry retained for audit history per the spec's "Reconciled" definition. No gold vision amendment, no WO retrospective edit. Future placeholder WOs in cycles like this should pass the same strict-construction check at authoring time.

---

### D11 — Gold vision §11 Non-goals silent on `converse.test.js`

| Field       | Value                                                  |
| ----------- | ------------------------------------------------------ |
| Severity    | MINOR                                                  |
| Phase       | Phase 6 (The Pass)                                     |
| Discovered  | Cycle 303, Session 303.7 (WO-303.7b drafting)          |
| Status      | Open                                                   |

**Discovery.** Gold vision §11 *Non-goals* "In scope" paragraph names three unit-test files explicitly: `test/expediter.test.js`, `test/handlers.test.js`, `test/prompt-assembler.test.js`. Phase 6 ships an eighth Vitest suite — `test/converse.test.js` — covering the route-layer orchestrator's first-turn, continuation, cost-ceiling, transaction-rollback, and four documented error paths. The canon list does not include it. This is the same pattern previously logged as D5 (Phase 5 test files), now extended to the route-layer test for Phase 6.

**Evidence.** Gold vision §11 (verbatim):

> In scope: an initial migration (`src/db/migrations/001-initial.sql` matching `schema.sql`) and unit tests for the Expediter, handlers, and prompt assembler (`test/expediter.test.js`, `test/handlers.test.js`, `test/prompt-assembler.test.js`). Anything beyond is in the table above.

The "Anything beyond" clause references `Out of scope` items — primarily integration tests and end-to-end tests, which `converse.test.js` is not. The shipped suite is pure unit (mocks `pantry`, `chef`, `expediter`, `prompt-assembler`, `cost-ceiling`), aligned with the §11 unit-tests-only posture, but its file is not enumerated.

**Workaround applied.** None — `test/converse.test.js` shipped per WO-303.7b. Eight cases, all green; full Phase-0-through-6 suite (80 tests across 9 files) green.

**Reconciliation target.** Update gold vision §11 *Non-goals* "In scope" paragraph: either (a) extend the named test-file list to include `converse.test.js` (and the five Phase 5 security test files per D5), or (b) reword the paragraph to clarify that the named files are the canon-prescribed minimum and per-surface unit tests are normal-and-expected. (b) is the more durable change — closes both D5 and D11 with one edit and avoids re-opening the same gap each phase. Phase 9.D in Cycle 304.

---

### D12 — `dotenv` declared in `package.json` but never imported

| Field       | Value                                                  |
| ----------- | ------------------------------------------------------ |
| Severity    | MINOR                                                  |
| Phase       | Phase 6 (The Pass) / Phase 7 prep                      |
| Discovered  | Cycle 303, Session 303.7 (live Phase 6 Gate post-merge) |
| Status      | Reconciled                                             |

**Discovery.** Gold vision v1.5 §4 *Backend runtime* lists `dotenv` in the runtime dependency stack (alongside `express`, `pg`, `cors`, `@anthropic-ai/sdk`). Phase 0 `package.json` correctly declared the dependency. However, no source file in the repo imported `dotenv` or called `dotenv.config()` between Sessions 303.1 and 303.7. `.env` was therefore a no-op at runtime through Phase 6 — every `process.env.X` read resolved only against the calling shell.

**Concrete exposure.** `src/backend/converse.js` reads `process.env.ORG_NAME` and `process.env.CRISIS_LINE` at every turn for placeholder substitution into `system.md`. Without dotenv loading, these would resolve to `undefined`, embedding the literal string `undefined` into the system prompt. The Phase 6 live Gate passed only because the calling PowerShell session had the values exported.

**Evidence.** Gold vision §4 *Backend runtime* (verbatim):

> | Backend runtime | `express`, `pg`, `cors`, `dotenv`, `@anthropic-ai/sdk` |

`package.json` Phase 0 (commit `e1befbe`):

```json
"dotenv": "^16.4.7",
```

No source file imported `dotenv` between Cycle 303 Sessions 303.1 and 303.7. Phase 7 surfaced the question because the frontend → backend hop depends on `CORS_ALLOWED_ORIGINS` and `PORT` being populated for any newly-cloned environment.

**Workaround applied.** Added `import 'dotenv/config';` as the first import in `src/backend/app.js` (WO-303.8a, this cycle). The side-effect import calls `dotenv.config()` at module load, populating `process.env` from `.env` before any other module that reads it. Production deployments that supply env via a secret manager are unaffected — `dotenv` silently no-ops when `.env` is absent.

**Reconciliation target.** None — divergence resolved in-cycle by WO-303.8a (this WO). Entry retained for audit history per the spec's "Reconciled" definition. The gold vision §4 *Backend runtime* line is now true: `dotenv` is in the runtime dependency stack and actually used at runtime. No gold vision amendment required. Future WOs that declare a runtime dependency should pass a strict "is it imported anywhere?" check at authoring time.

---

### D13 — PR #9 squash-merged when merge criterion required `Create a merge commit`

| Field       | Value                                                         |
| ----------- | ------------------------------------------------------------- |
| Severity    | MINOR                                                         |
| Phase       | Phase 7 (Frontend) / Cycle 303.8 merge gate                   |
| Discovered  | Cycle 303, Session 303.8.a (post-merge topology verification) |
| Status      | Reconciled                                                    |

**Discovery.** Breakout 303.8.a merge criterion #2 explicitly required: "`build/phase-7-frontend` is merged to `intake-triager` main via the **Create a merge commit** method, preserving the five per-WO commits." PR #9 was opened, reviewed, and merged via the GitHub web UI — but the merge-method dropdown defaulted to "Squash and merge" rather than "Create a merge commit." The first merge commit `a165ca6` had only one parent, confirming the squash. The five per-WO commits (`18862d6`, `7a45d48`, `c8aecda`, `ea58343`, `a61c099`) were not visible on `main` after the squash; they survived only on the `build/phase-7-frontend` branch and the closed PR audit log. Same pattern as the Cycle 301 learning that authored this merge criterion.

**Concrete exposure.** Loss of per-WO commit visibility on `main` defeats the traceability the breakout merge criterion was designed to preserve — each Phase 7 file had to carry a clean `git blame` link back to its governing WO. Without recovery, the WO→commit→file chain would have been resolvable only via the PR audit log, which is GitHub-specific and not part of the local repo's history.

**Evidence.**

```powershell
# Post-squash (the deviation)
PS> git cat-file -p a165ca6 | Select-String "^parent"
parent 40d00e4dae86b69d7d837d95866c7f58c09fb526

# Post-recovery (the corrected topology)
PS> git cat-file -p fc30eca | Select-String "^parent"
parent 40d00e4dae86b69d7d837d95866c7f58c09fb526
parent a61c099c281535c449bf77361f75e5d9a803bdf5
```

The single-parent vs. two-parent diff is the squash-vs-merge fingerprint.

**Workaround applied.** Recovery executed in-cycle on the local clone, then force-pushed:

```powershell
git checkout main
git reset --hard 40d00e4
git merge --no-ff build/phase-7-frontend -m "Phase 7 — Frontend (Cycle 303) (#9)"
git push --force origin main
```

Result: merge commit `fc30eca` replaces `a165ca6` on `origin/main` with two parents and the five per-WO commits visible in `git log --oneline --graph`. PR #9 remains "Merged" on GitHub (the PR record is decoupled from main's topology after the click). Solo-dev repo with no concurrent contributors; force-push blast radius was zero. Merge criterion #2 is now satisfied via topology, not via the PR audit log.

**Reconciliation target.** Two complementary actions, batched to Phase 9.D in Cycle 304:

1. **GitHub repo settings (preventative).** In `ParadigmPilot/intake-triager` → Settings → General → Pull Requests, disable "Allow squash merging" and "Allow rebase merging"; leave only "Allow merge commits" enabled. Apply the same change to the `ParadigmPilot/hopper` repo. This makes the merge-method choice impossible to get wrong from the UI.
2. **Pre-merge checklist (defensive).** Add an item to the breakout-close archetype `Merge Instructions` template (or to the breakout-assignment Notes section): "Before clicking Merge, verify the GitHub merge-method dropdown reads 'Create a merge commit'. Squash and Rebase irreversibly drop per-WO history and force a force-push recovery."

Reconciled in-cycle by the recovery sequence above; the durable preventative fix is the Phase 9.D action.

---

### D16 — Phase 6 shipped without gold vision §10 JSON one-line-per-event logging

| Field       | Value                                                        |
| ----------- | ------------------------------------------------------------ |
| Severity    | MAJOR                                                        |
| Phase       | Phase 6 (The Pass — `/converse` handler)                     |
| Discovered  | Cycle 304, Session 304.2 (WO-304.2.a v2 first execution)     |
| Status      | Reconciled                                                   |

**Discovery.** Path 1's first execution drove Taylor through the full conversation cleanly (marker emitted, status flipped, `raw_marker` intact) and then failed on the §10 observability assertion: zero captured stdout lines parsed as JSON events with `timestamp`, `level`, `event`, `conversation_id`, `owner_id`. The Phase 6 `converse.js` handler emits no structured logs (only one `console.error` in the catch block, writing non-JSON to stderr). The Phase 7 `server.js` boot emits a non-JSON `console.log` line. Gold vision §10 is unambiguous on the requirement; the build did not include it. WO-304.2.0 v1's first execution surfaced a second instance of the same gap in the unit-test layer: `test/converse.test.js:200–224` asserts the legacy `console.error` mechanism via `vi.spyOn(console, 'error')` — the test ratified the §10 violation as "tested behavior."

**Evidence.** `src/backend/converse.js` as shipped through Cycle 303 contained no `log()` or JSON-stdout writes — only one `console.error` writing a string to stderr inside the catch. `src/backend/server.js` (extracted by WO-304.1.a) contained `console.log(\`[backend] listening on port ${PORT}\`)` — non-JSON. `test/converse.test.js` asserted `expect(errSpy).toHaveBeenCalled()` against a `console.error` spy. Path 1's log-capture assertion (gold vision §10 fields present on at least one captured stdout line) returned zero matches.

**Workaround applied.** WO-304.2.0 (Cycle 304, Session 304.3) creates `src/backend/observability.js` as the single producer of JSON one-line-per-event stdout logs and integrates it at five emission points in `converse.js` (`turn_received`, `token_ceiling_exceeded`, `turn_complete`, `handler_error`, plus the catch-block error replacing `console.error`) and one in `server.js` (`server_listening`). v2 of this WO additionally updates `test/converse.test.js` lines 200–224 — the legacy `console.error` spy that asserted the pre-§10 mechanism — to spy on `process.stdout.write` and assert the JSON-shaped event. After WO-304.2.0 ships, Path 1's §10 assertion finds matching events on every successful turn, and the `converse.test.js` unit suite asserts the §10-conformant error log path.

**Reconciliation target.** Closed in-cycle by WO-304.2.0. Phase 9.D may optionally fold a §Phase 6 amendment into `intake-triager-build-plan.md` to enumerate "JSON one-line-per-event logging via `observability.js`" as an explicit Phase 6 deliverable, formalizing what was implicit in gold vision §10 from the start. Out-of-`/converse` modules (`pantry.js`, `chef.js`, `expediter.js`, `handlers/*.js`, `security/*.js`) are not yet instrumented; two pre-existing `console.error` instances surfaced during v1 execution at `expediter.js:55` and `handlers/triage-record.js:86`. Bringing them under §10 is tracked separately as part of D15 / Phase 9.D's §4 *Repo structure* amendment, or as a Cycle 305+ candidate if the §10 surface stays narrow.

**Status.** Reconciled (in-cycle by WO-304.2.0).

---

_Last updated: 2026-05-01 — Cycle 304, Session 304.3 (D16 appended, born Reconciled)._
