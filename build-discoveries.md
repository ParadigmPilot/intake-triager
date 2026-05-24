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
- **Ratified** — Phase 9.D reviewed the divergence and ratified the existing state as canon-aligned-by-absence; no edit required; entry kept for history.
- **Superseded** — overtaken by a later canon change that made the original divergence moot; entry kept for history.

## Reconciliation flow (per gold vision §13)

The vision is the binding contract. Build defects do not "amend" the vision unless they're CRITICAL. MAJOR and MINOR entries are reconciled by editing the responsible asset — typically the gold vision itself for canon gaps, or the WO content for WO defects — during Phase 9.D in Cycle 304.

Each entry below names a **Reconciliation target**: the file(s) and section(s) that need editing to close the divergence.

---

## Index

| ID  | Severity | Phase     | Discovered  | Status     | Title                                                                                                    |
| --- | -------- | --------- | ----------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| D1  | MINOR    | Phase 2   | Cycle 303.3 | Ratified   | WO-303.3a smoke-test ESM `import` uses bare Windows path                                                 |
| D2  | MINOR    | Phase 2   | Cycle 303.3 | Ratified   | WO-303.3a Success Criteria says "ten checks"; smoke test runs eleven                                     |
| D3  | MINOR    | Phase 3   | Cycle 303.3 | Reconciled | Gold vision silent on per-call `max_tokens` for Chef                                                     |
| D4  | MINOR    | Phase 5   | Cycle 303.6 | Reconciled | Gold vision §4 Repo structure missing `security/cors.js` and `cost-ceiling.js`                           |
| D5  | MINOR    | Phase 5   | Cycle 303.6 | Reconciled | Gold vision §11 Non-goals silent on Phase 5 unit-test files                                              |
| D6  | MINOR    | Phase 5   | Cycle 303.6 | Reconciled | Gold vision §10 silent on `MAX_CONTENT_LENGTH`                                                           |
| D7  | MINOR    | Phase 5   | Cycle 303.6 | Reconciled | Gold vision §10 item 5 silent on prompt-injection wrapper syntax                                         |
| D8  | MINOR    | Phase 5   | Cycle 303.6 | Reconciled | Cost ceiling lives in `cost-ceiling.js`, not `rate-limit.js`                                             |
| D9  | MINOR    | Phase 5   | Cycle 303.6 | Reconciled | Gold vision §4 Pantry public API table missing `sumConversationOutputTokens`                             |
| D10 | MINOR    | Phase 6   | Cycle 303.7 | Reconciled | Phase 0 `/health` stub removed by Phase 6 (canon-deviation self-healed)                                  |
| D11 | MINOR    | Phase 6   | Cycle 303.7 | Reconciled | Gold vision §11 Non-goals silent on `converse.test.js`                                                   |
| D12 | MINOR    | Phase 6   | Cycle 303.7 | Reconciled | `dotenv` declared in `package.json` but never imported                                                   |
| D13 | MINOR    | Phase 7   | Cycle 303.8 | Reconciled | PR #9 squash-merged when merge criterion required `Create a merge commit`                                |
| D16 | MAJOR    | Phase 6   | Cycle 304.3 | Reconciled | Phase 6 shipped without gold vision §10 JSON one-line-per-event logging                                  |
| D14 | MINOR    | Phase 8   | Cycle 304.2 | Ratified   | Path-test user prompts authored at WO draft time, not pre-existing in canon                              |
| D15 | MINOR    | Phase 8   | Cycle 304.2 | Reconciled | Phase 8 infrastructure adds files beyond gold vision §4 Repo structure                                   |
| D17 | MINOR    | Phase 8   | Cycle 304.4 | Reconciled | `.env.test.example` template missing `ORG_NAME` and `CRISIS_LINE`                                        |
| D18 | MINOR    | Phase 6   | Cycle 304.4 | Reconciled | `converse.js` propagates `undefined` from env vars; no boot-time validation                              |
| D19 | MINOR    | Phase 9.B | Cycle 304.7 | Ratified   | Canon files reference deck by filename without path prefix                                               |
| D20 | MAJOR    | Phase 9.B | Cycle 304.7 | Reconciled | PPTX repack passing zipfile/lxml/python-pptx does not guarantee Office content validation                |
| D21 | MINOR    | Phase 9.B | Cycle 304.7 | Reconciled | Cycle 304.6 inventory misread Slide 4 as single-column; canon-vs-deck audits must inspect shape topology |
| D22 | MINOR    | Phase 9.B | Cycle 304.7 | Reconciled | WO B.1 structural gate spec under-counted ZIP members by one (missed `_rels` file)                       |
| D23 | MAJOR    | Phase 9.B | Cycle 304.8 | Reconciled | Redux dispatches must explicitly re-list non-struck deliverables                                         |
| D24 | MINOR    | Phase 9.B | Cycle 304.8 | Open       | Slide 47 `appendMessage` retains `conversation_id: conversationId` camelCase shadow                      |

## | D25 | MINOR | Phase 9.D | Cycle 304.9 | Reconciled | STD-13 self-declared front-matter `path:` field stale (named non-existent `tier-0-operational/` directory) |

## Entries

### D1 — WO-303.3a smoke-test ESM `import` uses bare Windows path

| Field      | Value                                                  |
| ---------- | ------------------------------------------------------ |
| Severity   | MINOR                                                  |
| Phase      | Phase 2 (Pantry)                                       |
| Discovered | Cycle 303, Session 303.3 (Pantry smoke-test execution) |
| Status     | Ratified                                               |

**Discovery.** The smoke-test script as authored in `wo-303.3a-pantry.md` §Verification → "Smoke-test script (verbatim)" uses a bare absolute Windows path in the ESM `import` statement:

```javascript
import pantry from "C:/DevTools/hopper/products/intake-triager/src/backend/pantry.js";
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
import pantry from "file:///C:/DevTools/hopper/products/intake-triager/src/backend/pantry.js";
```

Smoke test then passed all eleven checks. The committed `pantry.js` itself is unaffected — the defect lives only in the WO's verbatim transcript.

**Reconciliation target.** Update `products/hopper/project-management/cycles/303/work-orders/wo-303.3a-pantry.md` §Verification → "Smoke-test script (verbatim)" to use the `file:///` URL form. WO-303.4b §Verification adopts the corrected pattern preemptively.

---

### D2 — WO-303.3a Success Criteria says "ten checks"; smoke test runs eleven

| Field      | Value                                                  |
| ---------- | ------------------------------------------------------ |
| Severity   | MINOR                                                  |
| Phase      | Phase 2 (Pantry)                                       |
| Discovered | Cycle 303, Session 303.3 (Pantry smoke-test execution) |
| Status     | Ratified                                               |

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

| Field      | Value                                         |
| ---------- | --------------------------------------------- |
| Severity   | MINOR                                         |
| Phase      | Phase 3 (Briefing & Chef)                     |
| Discovered | Cycle 303, Session 303.3 (WO-303.4b drafting) |
| Status     | Reconciled                                    |

**Discovery.** Gold vision §4 _Chef public API_ and §10 _Configuration_ prescribe `MODEL` (default `claude-sonnet-4-20250514`) but do not specify a `max_tokens` value for the SDK's `messages.create` call. The `@anthropic-ai/sdk` Messages API requires `max_tokens` as a non-optional parameter; canon doesn't say what value to use.

**Evidence.** Gold vision §4 _Chef public API_ full text:

> `cook(briefing) → {text, usage}` Single-call wrapper around `@anthropic-ai/sdk` Messages API. Takes the array from `assemblePrompt`. Returns `text` (assistant's reply string) and `usage` (the SDK's `{input_tokens, output_tokens}` object — persisted to `messages.token_usage` per §9). Non-streaming. Uses the configured `MODEL` value.

§10 _Configuration_ enumerates nine env keys; `max_tokens` is not among them. SDK reference: a `max_tokens` parameter is required in `messages.create({model, max_tokens, system, messages})`.

**Workaround applied.** WO-303.4b Decision #3 fixes `MAX_TOKENS = 4096` as a module-load constant in `chef.js`. Rationale: defensible default for long-form intake-triager Q&A turns; per-turn ceiling, distinct from `CONVERSATION_TOKEN_CEILING` (cumulative cap, Phase 5).

**Reconciliation target.** Add `max_tokens` to gold vision §4 _Chef public API_ (specifying value or env-driven origin). Owner ruling needed during Phase 9.D: hard-coded constant in `chef.js`, or new env key (e.g., `MAX_TOKENS_PER_TURN`) added to §10 _Configuration_. If env-driven, also add to `.env.example`.

---

### D4 — Gold vision §4 Repo structure missing `security/cors.js` and `cost-ceiling.js`

| Field      | Value                                          |
| ---------- | ---------------------------------------------- |
| Severity   | MINOR                                          |
| Phase      | Phase 5 (Security floor)                       |
| Discovered | Cycle 303, Session 303.6 (Phase 5 WO drafting) |
| Status     | Reconciled                                     |

**Discovery.** Gold vision §4 _Repo structure_ lists three files under `src/backend/security/`: `rate-limit.js`, `input-validation.js`, `prompt-injection.js`. Phase 5 ships two additional files at the same depth: `cors.js` (per WO-303.6e) and `cost-ceiling.js` (per WO-303.6d, also covered by D8).

§10 item 9 names CORS as a security-floor item and names the env var (`CORS_ALLOWED_ORIGINS`), but assigns no file path. The `cors` package is named in §4 _Required dependencies_. The file path `security/cors.js` is the natural sibling shape but is canon-silent.

**Evidence.** Gold vision §4 _Repo structure_ tree under `src/backend/security/` (verbatim):

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

**Reconciliation target.** Update gold vision §4 _Repo structure_ tree to add `cors.js` and `cost-ceiling.js` under `src/backend/security/`. Phase 9.D in Cycle 304.

---

### D5 — Gold vision §11 Non-goals silent on Phase 5 unit-test files

| Field      | Value                                          |
| ---------- | ---------------------------------------------- |
| Severity   | MINOR                                          |
| Phase      | Phase 5 (Security floor)                       |
| Discovered | Cycle 303, Session 303.6 (Phase 5 WO drafting) |
| Status     | Reconciled                                     |

**Discovery.** Gold vision §11 _Non-goals_ names exactly three unit-test files in scope:

> unit tests for the Expediter, handlers, and prompt assembler (`test/expediter.test.js`, `test/handlers.test.js`, `test/prompt-assembler.test.js`)

Phase 5 ships five additional unit-test files (`input-validation.test.js`, `prompt-injection.test.js`, `rate-limit.test.js`, `cost-ceiling.test.js`, `cors.test.js`). Per the Cycle 303.6 strategy ruling, security tests are GOLD-aligned — going untested into Phase 8 E2E for input-validation regex bounds and rate-limiter clock math is reckless — but canon doesn't list them.

**Evidence.** Gold vision §11 _Non-goals_ "In scope" paragraph (verbatim):

> In scope: an initial migration (`src/db/migrations/001-initial.sql` matching `schema.sql`) and unit tests for the Expediter, handlers, and prompt assembler (`test/expediter.test.js`, `test/handlers.test.js`, `test/prompt-assembler.test.js`). Anything beyond is in the table above.

After Phase 5 merges, `test/` contains eight files; canon names three.

**Workaround applied.** None — tests shipped per WOs 6a–6e. Each test file is colocated with its named-file canon rules and ships green.

**Reconciliation target.** Update gold vision §11 _Non-goals_ "In scope" paragraph to add the five Phase 5 test files. Phase 9.D in Cycle 304.

---

### D6 — Gold vision §10 silent on `MAX_CONTENT_LENGTH`

| Field      | Value                                         |
| ---------- | --------------------------------------------- |
| Severity   | MINOR                                         |
| Phase      | Phase 5 (Security floor)                      |
| Discovered | Cycle 303, Session 303.6 (WO-303.6a drafting) |
| Status     | Reconciled                                    |

**Discovery.** Gold vision §10 item 3 prescribes "input validation at the door — message length caps" but does not specify a value. §10 _Configuration_ enumerates nine env keys; none govern content length. The middleware needs a defensible numeric cap to enforce.

**Evidence.** Gold vision §10 item 3 (verbatim):

> 3. **Input validation at the door** — message length caps, `Content-Type` checks (the door rejects `multipart/form-data` by default; the conversation surface is text only). File: `src/backend/security/input-validation.js`.

§10 _Configuration_ table — nine keys, none for content length. The phrase "message length caps" appears in item 3 but the value is canon-silent.

**Workaround applied.** WO-303.6a fixed `MAX_CONTENT_LENGTH = 8000` (chars) as a module-load constant in `input-validation.js`. Rationale: defensible default for one user message turn — well above conversational lengths but below denial-of-service input sizes. Same pattern as D3 (`MAX_TOKENS = 4096` in `chef.js`).

**Reconciliation target.** Add `MAX_CONTENT_LENGTH` (or equivalent) to gold vision §10. Owner ruling needed during Phase 9.D: hard-coded constant in `input-validation.js`, or new env key added to §10 _Configuration_. If env-driven, also add to `.env.example`.

---

### D7 — Gold vision §10 item 5 silent on prompt-injection wrapper syntax

| Field      | Value                                         |
| ---------- | --------------------------------------------- |
| Severity   | MINOR                                         |
| Phase      | Phase 5 (Security floor)                      |
| Discovered | Cycle 303, Session 303.6 (WO-303.6b drafting) |
| Status     | Reconciled                                    |

**Discovery.** Gold vision §10 item 5 prescribes "prompt-injection hygiene — user text isolated from system instructions" but does not specify the wrapper syntax (delimiters, neutralization rules, transport-vs-storage split) used to isolate user content within the message array sent to the Chef.

**Evidence.** Gold vision §10 item 5 (verbatim):

> 5. **Prompt-injection hygiene** — user text isolated from system instructions; Taylor never acts on the Patron's behalf without explicit confirmation handlers. File: `src/backend/security/prompt-injection.js`.

The phrase "user text isolated from system instructions" is the only constraint on the wrap mechanism; nothing about delimiter choice, escape rules, or where in the request flow the wrap is applied.

**Workaround applied.** WO-303.6b fixed `<user_message>...</user_message>` as the wrapper syntax with literal close-tag neutralization (replacing any `</user_message>` substring in user content with `&lt;/user_message&gt;` to prevent envelope escape). Wrap is applied at transport time between `pantry.loadMessages` and `Briefing.assemblePrompt`; storage stays raw. Rationale: well-known tag form; signals "data, not instructions" to Claude; defensive neutralization closes the obvious injection vector.

**Reconciliation target.** Add wrapper syntax specification to gold vision §10 item 5 (open/close tags, the neutralization rule, and the storage-vs-transport split). Phase 9.D in Cycle 304.

---

### D8 — Cost ceiling lives in `cost-ceiling.js`, not `rate-limit.js`

| Field      | Value                                            |
| ---------- | ------------------------------------------------ |
| Severity   | MINOR                                            |
| Phase      | Phase 5 (Security floor)                         |
| Discovered | Cycle 303, Session 303.6 (WO-303.6c/6d drafting) |
| Status     | Reconciled                                       |

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

| Field      | Value                                         |
| ---------- | --------------------------------------------- |
| Severity   | MINOR                                         |
| Phase      | Phase 5 (Security floor)                      |
| Discovered | Cycle 303, Session 303.6 (WO-303.6d drafting) |
| Status     | Reconciled                                    |

**Discovery.** Gold vision §4 _Pantry public API_ declares "the Pantry exposes a small surface; everything else in `pantry.js` is internal." The accompanying table lists seven methods. Phase 5 added an eighth: `sumConversationOutputTokens(conversation_id, owner_id, tx)` for the cost-ceiling check. The new method was required because canon §4 also specifies that `pantry.query()` is "Migration code only; never called at request time" — `cost-ceiling.js` cannot reach around the public API to write its own SQL.

The shape and conventions of the new method match the existing seven (final optional `tx`, `owner_id` discipline, route through `_runner(tx)`); only the table is incomplete.

**Evidence.** Gold vision §4 _Pantry public API_ (verbatim):

> The Pantry exposes a small surface; everything else in `pantry.js` is internal.

Followed by a seven-row table. After Phase 5 merges, `pantry.js` exports an eighth method.

**Workaround applied.** Added `sumConversationOutputTokens` per WO-303.6d. Method signature, SQL parameterization, transaction routing, and `owner_id` discipline match the existing seven methods. SQL uses `COALESCE(SUM((token_usage->>'output_tokens')::int), 0)` with a `role = 'assistant' AND token_usage IS NOT NULL` filter; returns `0` for empty conversations.

**Reconciliation target.** Add a row to gold vision §4 _Pantry public API_ table:

> `sumConversationOutputTokens(conversation_id, owner_id, tx) → number` — Return the sum of `output_tokens` across all `role='assistant'` rows for the conversation, scoped to `owner_id`. Returns `0` for empty conversations. Used by `security/cost-ceiling.js` to enforce `CONVERSATION_TOKEN_CEILING` before the Chef is called.

Phase 9.D in Cycle 304.

---

### D10 — Phase 0 `/health` stub removed by Phase 6 (canon-deviation self-healed)

| Field      | Value                                                |
| ---------- | ---------------------------------------------------- |
| Severity   | MINOR                                                |
| Phase      | Phase 6 (The Pass)                                   |
| Discovered | Cycle 303, Session 303.7 (WO-303.7a strategy review) |
| Status     | Reconciled                                           |

**Discovery.** The Phase 0 placeholder `src/backend/app.js` (delivered by WO-303.1c) shipped with a `GET /health` smoke endpoint that has no canonical authority. Gold vision v1.5 §4 _HTTP API contract_ closes with the strict-construction sentence "this is the only external HTTP contract this repo defines," referring to `POST /converse`. Strict reading makes `/health` a canon deviation. It lived on `main` from Session 303.1 through Session 303.6 (six sessions) before being noticed during WO-303.7a strategy.

**Evidence.** Gold vision §4 _HTTP API contract_ (verbatim, closing sentence):

> This is the only external HTTP contract this repo defines.

Phase 0 `app.js` source (lines 9–10, as shipped at commit `e1befbe`):

```javascript
app.get("/health", (req, res) => res.json({ status: "ok" }));
```

WO-303.1c declared the file as a placeholder explicitly: "full Express bootstrap (mounts middleware and routes) lands at Phase 6 (The Pass)." Strict construction at the time of authoring would have caught `/health`; it did not.

**Workaround applied.** None needed. Phase 6 WO-303.7a replaced the entire `app.js` content as part of the planned bootstrap rewrite; `/health` did not survive the replacement. Verified by Phase 6 manual gate: `curl -i http://localhost:3000/health` returns `404 Not Found`.

**Reconciliation target.** None — divergence self-healed in Cycle 303 by Phase 6 WO-303.7a (commit `3d919db`, merged via PR #7 at `b58bdb8`). Entry retained for audit history per the spec's "Reconciled" definition. No gold vision amendment, no WO retrospective edit. Future placeholder WOs in cycles like this should pass the same strict-construction check at authoring time.

---

### D11 — Gold vision §11 Non-goals silent on `converse.test.js`

| Field      | Value                                         |
| ---------- | --------------------------------------------- |
| Severity   | MINOR                                         |
| Phase      | Phase 6 (The Pass)                            |
| Discovered | Cycle 303, Session 303.7 (WO-303.7b drafting) |
| Status     | Reconciled                                    |

**Discovery.** Gold vision §11 _Non-goals_ "In scope" paragraph names three unit-test files explicitly: `test/expediter.test.js`, `test/handlers.test.js`, `test/prompt-assembler.test.js`. Phase 6 ships an eighth Vitest suite — `test/converse.test.js` — covering the route-layer orchestrator's first-turn, continuation, cost-ceiling, transaction-rollback, and four documented error paths. The canon list does not include it. This is the same pattern previously logged as D5 (Phase 5 test files), now extended to the route-layer test for Phase 6.

**Evidence.** Gold vision §11 (verbatim):

> In scope: an initial migration (`src/db/migrations/001-initial.sql` matching `schema.sql`) and unit tests for the Expediter, handlers, and prompt assembler (`test/expediter.test.js`, `test/handlers.test.js`, `test/prompt-assembler.test.js`). Anything beyond is in the table above.

The "Anything beyond" clause references `Out of scope` items — primarily integration tests and end-to-end tests, which `converse.test.js` is not. The shipped suite is pure unit (mocks `pantry`, `chef`, `expediter`, `prompt-assembler`, `cost-ceiling`), aligned with the §11 unit-tests-only posture, but its file is not enumerated.

**Workaround applied.** None — `test/converse.test.js` shipped per WO-303.7b. Eight cases, all green; full Phase-0-through-6 suite (80 tests across 9 files) green.

**Reconciliation target.** Update gold vision §11 _Non-goals_ "In scope" paragraph: either (a) extend the named test-file list to include `converse.test.js` (and the five Phase 5 security test files per D5), or (b) reword the paragraph to clarify that the named files are the canon-prescribed minimum and per-surface unit tests are normal-and-expected. (b) is the more durable change — closes both D5 and D11 with one edit and avoids re-opening the same gap each phase. Phase 9.D in Cycle 304.

---

### D12 — `dotenv` declared in `package.json` but never imported

| Field      | Value                                                   |
| ---------- | ------------------------------------------------------- |
| Severity   | MINOR                                                   |
| Phase      | Phase 6 (The Pass) / Phase 7 prep                       |
| Discovered | Cycle 303, Session 303.7 (live Phase 6 Gate post-merge) |
| Status     | Reconciled                                              |

**Discovery.** Gold vision v1.5 §4 _Backend runtime_ lists `dotenv` in the runtime dependency stack (alongside `express`, `pg`, `cors`, `@anthropic-ai/sdk`). Phase 0 `package.json` correctly declared the dependency. However, no source file in the repo imported `dotenv` or called `dotenv.config()` between Sessions 303.1 and 303.7. `.env` was therefore a no-op at runtime through Phase 6 — every `process.env.X` read resolved only against the calling shell.

**Concrete exposure.** `src/backend/converse.js` reads `process.env.ORG_NAME` and `process.env.CRISIS_LINE` at every turn for placeholder substitution into `system.md`. Without dotenv loading, these would resolve to `undefined`, embedding the literal string `undefined` into the system prompt. The Phase 6 live Gate passed only because the calling PowerShell session had the values exported.

**Evidence.** Gold vision §4 _Backend runtime_ (verbatim):

> | Backend runtime | `express`, `pg`, `cors`, `dotenv`, `@anthropic-ai/sdk` |

`package.json` Phase 0 (commit `e1befbe`):

```json
"dotenv": "^16.4.7",
```

No source file imported `dotenv` between Cycle 303 Sessions 303.1 and 303.7. Phase 7 surfaced the question because the frontend → backend hop depends on `CORS_ALLOWED_ORIGINS` and `PORT` being populated for any newly-cloned environment.

**Workaround applied.** Added `import 'dotenv/config';` as the first import in `src/backend/app.js` (WO-303.8a, this cycle). The side-effect import calls `dotenv.config()` at module load, populating `process.env` from `.env` before any other module that reads it. Production deployments that supply env via a secret manager are unaffected — `dotenv` silently no-ops when `.env` is absent.

**Reconciliation target.** None — divergence resolved in-cycle by WO-303.8a (this WO). Entry retained for audit history per the spec's "Reconciled" definition. The gold vision §4 _Backend runtime_ line is now true: `dotenv` is in the runtime dependency stack and actually used at runtime. No gold vision amendment required. Future WOs that declare a runtime dependency should pass a strict "is it imported anywhere?" check at authoring time.

---

### D13 — PR #9 squash-merged when merge criterion required `Create a merge commit`

| Field      | Value                                                         |
| ---------- | ------------------------------------------------------------- |
| Severity   | MINOR                                                         |
| Phase      | Phase 7 (Frontend) / Cycle 303.8 merge gate                   |
| Discovered | Cycle 303, Session 303.8.a (post-merge topology verification) |
| Status     | Reconciled                                                    |

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

| Field      | Value                                                    |
| ---------- | -------------------------------------------------------- |
| Severity   | MAJOR                                                    |
| Phase      | Phase 6 (The Pass — `/converse` handler)                 |
| Discovered | Cycle 304, Session 304.2 (WO-304.2.a v2 first execution) |
| Status     | Reconciled                                               |

**Discovery.** Path 1's first execution drove Taylor through the full conversation cleanly (marker emitted, status flipped, `raw_marker` intact) and then failed on the §10 observability assertion: zero captured stdout lines parsed as JSON events with `timestamp`, `level`, `event`, `conversation_id`, `owner_id`. The Phase 6 `converse.js` handler emits no structured logs (only one `console.error` in the catch block, writing non-JSON to stderr). The Phase 7 `server.js` boot emits a non-JSON `console.log` line. Gold vision §10 is unambiguous on the requirement; the build did not include it. WO-304.2.0 v1's first execution surfaced a second instance of the same gap in the unit-test layer: `test/converse.test.js:200–224` asserts the legacy `console.error` mechanism via `vi.spyOn(console, 'error')` — the test ratified the §10 violation as "tested behavior."

**Evidence.** `src/backend/converse.js` as shipped through Cycle 303 contained no `log()` or JSON-stdout writes — only one `console.error` writing a string to stderr inside the catch. `src/backend/server.js` (extracted by WO-304.1.a) contained `console.log(\`[backend] listening on port ${PORT}\`)`— non-JSON.`test/converse.test.js`asserted`expect(errSpy).toHaveBeenCalled()`against a`console.error` spy. Path 1's log-capture assertion (gold vision §10 fields present on at least one captured stdout line) returned zero matches.

**Workaround applied.** WO-304.2.0 (Cycle 304, Session 304.3) creates `src/backend/observability.js` as the single producer of JSON one-line-per-event stdout logs and integrates it at five emission points in `converse.js` (`turn_received`, `token_ceiling_exceeded`, `turn_complete`, `handler_error`, plus the catch-block error replacing `console.error`) and one in `server.js` (`server_listening`). v2 of this WO additionally updates `test/converse.test.js` lines 200–224 — the legacy `console.error` spy that asserted the pre-§10 mechanism — to spy on `process.stdout.write` and assert the JSON-shaped event. After WO-304.2.0 ships, Path 1's §10 assertion finds matching events on every successful turn, and the `converse.test.js` unit suite asserts the §10-conformant error log path.

**Reconciliation target.** Closed in-cycle by WO-304.2.0. Phase 9.D may optionally fold a §Phase 6 amendment into `intake-triager-build-plan.md` to enumerate "JSON one-line-per-event logging via `observability.js`" as an explicit Phase 6 deliverable, formalizing what was implicit in gold vision §10 from the start. Out-of-`/converse` modules (`pantry.js`, `chef.js`, `expediter.js`, `handlers/*.js`, `security/*.js`) are not yet instrumented; two pre-existing `console.error` instances surfaced during v1 execution at `expediter.js:55` and `handlers/triage-record.js:86`. Bringing them under §10 is tracked separately as part of D15 / Phase 9.D's §4 _Repo structure_ amendment, or as a Cycle 305+ candidate if the §10 surface stays narrow.

**Status.** Reconciled (in-cycle by WO-304.2.0).

---

### D14 — Path-test user prompts authored at WO draft time, not pre-existing in canon

| Field      | Value                                          |
| ---------- | ---------------------------------------------- |
| Severity   | MINOR                                          |
| Phase      | Phase 8 (E2E verification)                     |
| Discovered | Cycle 304, Session 304.2 (WO-304.2.a drafting) |
| Status     | Ratified                                       |

**Discovery.** Phase 8 path tests require concrete user-side prompt scripts that drive Taylor through each rule path (standard intake, mandatory escalation, crisis-end). Canon does not specify these prompts: gold vision §6 names Taylor's behavior contract and §11 names the three rule paths; build plan §Phase 8 names success criteria; `system.md` defines Taylor's rules. None supply candidate user messages.

**Evidence.** Reading gold vision v1.6 §6 / §11, build plan §Phase 8, and `system.md` end-to-end yields only behavioral assertions — no user-message exemplars. The Cycle 303 Session 303.9 test-data plan scoped `temperature: 0` and isolated DB but not prompt content.

**Workaround applied.** Each path WO authors a `USER_MESSAGES` constant inline at the top of its test file (Path 1 in `test/e2e/standard-intake.test.js`; Paths 2 and 3 in their own test files via WO-304.2.b–c). Each script is canon-grounded against `system.md` — the routine, the trigger language, the crisis-end signal — but the literal text is build-layer.

**Reconciliation target.** Phase 9.D (Cycle 304). Disposition decision: leave as build-layer (default — prompts are test data, not canon), or lift to a gold-vision Appendix C _Phase 8 test data_ (canon-level — couples canon to a specific phrasing). Default disposition argues for build-layer; the path tests are pedagogical demonstrations of canon, not extensions of it.

**Status.** Ratified (Phase 9.D — no canon edit required; existing state ratified as canon-aligned-by-absence). Phase 9.D triage (Session 304.9) ratified the build-layer disposition: path-test user prompts are test data, not canon. Lifting to a gold-vision Appendix C _Phase 8 test data_ would couple canon to specific phrasing without pedagogical benefit.

---

### D15 — Phase 8 infrastructure adds files beyond gold vision §4 Repo structure

| Field      | Value                                          |
| ---------- | ---------------------------------------------- |
| Severity   | MINOR                                          |
| Phase      | Phase 8 (E2E verification)                     |
| Discovered | Cycle 304, Session 304.2 (WO-304.2.a drafting) |
| Status     | Reconciled                                     |

**Discovery.** Phase 8 E2E infrastructure (WO-304.1.a) and the Path 1 test (WO-304.2.a, with WO-304.2.b–c forthcoming) add files to the repo that are not enumerated in gold vision §4 _Repo structure_. The §4 prescribed tree omits these by virtue of being pre-Phase-8.

**Evidence.** Files added beyond §4 by Phase 8 work:

- **Root.** `vitest.e2e.config.js` (Vitest E2E config; WO-304.1.a), `.env.test.example` (E2E env template; WO-304.1.a).
- **`src/backend/`.** `server.js` (extracted from `app.js` to break the import-time `app.listen()` side-effect; WO-304.1.a). `observability.js` (single producer of §10 stdout logs; WO-304.2.0).
- **`test/e2e/`.** `helpers/db.js`, `helpers/server.js` (WO-304.1.a); `helpers/conversation.js`, `helpers/log-capture.js`, `standard-intake.test.js` (WO-304.2.a). Forthcoming: `mandatory-escalation.test.js` (WO-304.2.b), `crisis-end.test.js` (WO-304.2.c). The `test/e2e/.gitkeep` placeholder created by WO-304.1.a is rendered moot once `.test.js` files exist; deletion is a Phase 9.D consideration, not a build-layer fix.

The orphaned `test/e2e/helpers/owner.js` (WO-304.1.a) is **not** part of D15's scope — it is deleted by WO-304.2.a Edit 4 in the same session it became dead code, not deferred.

Pre-existing additions to the repo file tree beyond §4 are tracked separately: `src/backend/security/cors.js`, `cost-ceiling.js` (D4); `test/cors.test.js`, `cost-ceiling.test.js`, `input-validation.test.js`, `prompt-injection.test.js`, `rate-limit.test.js` (D4 / D5 family); `test/converse.test.js` (D11). D15 covers Phase 8 additions only; the broader §4 amendment is the union of D4, D5, D9, D11, D15.

**Workaround applied.** Files exist in the repo as required for Phase 8 mechanism per gold vision §11 (automated runnability) and build plan §Phase 8. §4 _Repo structure_ does not block their existence; it just doesn't list them.

**Reconciliation target.** Phase 9.D (Cycle 304). Single §4 _Repo structure_ amendment in the v1.7 graduation pass that includes the Phase 8 additions (this entry) plus the pre-existing additions in D4, D5, D9, D11. The amended §4 then reads against the as-built repo without divergence.

**Status.** Reconciled (Phase 9.D — WO-304.9.a, gold vision v1.7).

---

### D17 — `.env.test.example` template missing `ORG_NAME` and `CRISIS_LINE`

| Field      | Value                                          |
| ---------- | ---------------------------------------------- |
| Severity   | MINOR                                          |
| Phase      | Phase 8 (E2E verification)                     |
| Discovered | Cycle 304, Session 304.4 (WO-304.2.c drafting) |
| Status     | Reconciled                                     |

**Discovery.** Path 3 (crisis-end) is the only E2E path that exercises `{{CRISIS_LINE}}` substitution end-to-end, because Rule 7 is the only `system.md` rule that surfaces the placeholder to user-facing prose. While drafting WO-304.2.c, an audit of the substitution pipeline traced `{{CRISIS_LINE}}` from `src/backend/prompts/system.md` (substitution target) through `src/backend/prompt-assembler.js` (silent fallthrough on unknown placeholders — leaves `{{NAME}}` literal in place if the placeholders object lacks the key) to `src/backend/converse.js` (caller — reads `process.env.ORG_NAME` and `process.env.CRISIS_LINE` per turn with no fallback). The `.env.test.example` template ships with neither var. Without the addition, Path 3's assertion that Taylor surfaces the configured `CRISIS_LINE` value to the patron fails because the value is `undefined`, which `String(undefined)` substitutes as the literal string `"undefined"` into the system prompt's `[CONTEXT]` block.

**Concrete exposure.** Paths 1 and 2 stay accidentally green at `temperature: 0` despite the same wiring gap, because Rules 1–6 do not echo `{{CRISIS_LINE}}` or `{{ORG_NAME}}` to the patron — Taylor reads the malformed `[CONTEXT]` line and ignores it. Rule 7 is the only path that requires the value to be present and well-formed in the surfaced reply.

**Evidence.** Pre-fix `.env.test.example` (verbatim, last five lines):
DATABASE_URL=postgresql://localhost:5432/intake_triager_test
ANTHROPIC_API_KEY=
MODEL=claude-sonnet-4-20250514
E2E_TEMPERATURE=0
PORT=0

`src/backend/converse.js` lines 60–64 (verbatim):

```javascript
const placeholders = {
  TODAY: new Date().toISOString().slice(0, 10),
  ORG_NAME: process.env.ORG_NAME,
  CRISIS_LINE: process.env.CRISIS_LINE,
};
```

`src/backend/prompt-assembler.js` `substitute` function (verbatim):

```javascript
function substitute(template, placeholders) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, name) => {
    return Object.prototype.hasOwnProperty.call(placeholders, name)
      ? String(placeholders[name])
      : match;
  });
}
```

The `placeholders` object always contains the keys `TODAY`, `ORG_NAME`, `CRISIS_LINE` — `hasOwnProperty` returns true even when the value is `undefined`. `String(undefined) === 'undefined'`. The substitution writes the literal four-character string `undefined` into the system prompt.

**Workaround applied.** WO-304.2.c Edit 1 adds two lines to `.env.test.example`:
ORG_NAME=Test Org
CRISIS_LINE=E2E-TEST-CRISIS-LINE-555-0100

The `CRISIS_LINE` value is a sentinel chosen for grep-uniqueness: the `E2E-TEST-` prefix is visibly synthetic and the `555-0100` suffix is the NANP fictional-number convention reserved for fiction. Path 3 asserts the sentinel string appears in at least two assistant replies (the trigger turn and the subsequent refusal turn — Rule 7 mandates both surfacings). Sam manually copies the same two lines to local `.env.test` (gitignored) before WO execution.

**Reconciliation target.** Closed in-cycle by WO-304.2.c Edit 1. Entry retained for audit history per the spec's "Reconciled" definition. The deeper `converse.js` concern — production code reading `process.env.X` with no boot-time validation, propagating `undefined` silently into a user-facing prompt — is a distinct gap, logged separately as **D18 (Open)** below for Phase 9.D disposition.

**Status.** Reconciled (in-cycle by WO-304.2.c).

---

### D18 — `converse.js` propagates `undefined` from env vars; no boot-time validation

| Field      | Value                                          |
| ---------- | ---------------------------------------------- |
| Severity   | MINOR                                          |
| Phase      | Phase 6 (The Pass — `/converse` handler)       |
| Discovered | Cycle 304, Session 304.4 (WO-304.2.c drafting) |
| Status     | Reconciled                                     |

**Discovery.** Distinct from D17: D17 closes the test-environment template gap; D18 covers the upstream code-level pattern that allowed the gap to stay invisible across Phases 6 and 7. `src/backend/converse.js` constructs the `placeholders` object inline at every turn:

```javascript
const placeholders = {
  TODAY: new Date().toISOString().slice(0, 10),
  ORG_NAME: process.env.ORG_NAME,
  CRISIS_LINE: process.env.CRISIS_LINE,
};
```

When either env var is unset, the value is `undefined`; `prompt-assembler.js`'s `substitute` function calls `String(undefined)` and writes the literal `"undefined"` into the system prompt's `[CONTEXT]` block. There is no boot-time validation that asserts both vars are present at startup; there is no fallback to a defensible default; there is no per-turn warning to the §10 log when either is missing. Rules 1–6 don't echo these placeholders to user-facing prose, so the malformed context is silently ignored — every turn against an environment missing either var goes through with a malformed prompt. Rule 7 is the only path that exposes the gap to the patron.

**Concrete exposure.** Until D17 was reconciled in 304.4, every E2E test run against the unconfigured `.env.test` produced silently-malformed system prompts. Production runs against a misconfigured `.env` (or shell environment) would do the same — Taylor would emit `Crisis resource line: undefined` to the patron when Rule 7 fires. The gap is detectable in production only by running Path 3 (or equivalent crisis-trigger probe); routine runs against Rules 1–6 would not surface it.

**Evidence.** As D17, plus the absence of any `assert(process.env.CRISIS_LINE, ...)` or equivalent fail-fast in `app.js` or `server.js` boot. `observability.js` (Phase 6 / WO-304.2.0) emits no `config_loaded` event with the env-derived placeholder values; no `placeholder_missing` warn-level event exists.

**Workaround applied.** None — D17's `.env.test.example` fix closes the test-environment gap, but no production-side code change is shipped in WO-304.2.c. Path 3 verifies Taylor surfaces the configured `CRISIS_LINE`; it does not assert config-validation hardening.

**Reconciliation target.** Gold vision §6 (_Placeholder convention_ / TRUSTED-CONTEXT pool semantics) and / or §10 (_Configuration_) amendment in Phase 9.D, Cycle 304. Two complementary disposition candidates:

1. **Boot-time validation.** `app.js` (or `server.js`) asserts `process.env.ORG_NAME` and `process.env.CRISIS_LINE` are non-empty strings at startup; logs a `config_loaded` event on success; `process.exit(1)` on failure. Closes the gap fail-fast.
2. **Per-turn fallback + log.** `converse.js` falls back to a sentinel literal (e.g., `'(crisis line not configured)'`) when the env var is unset and emits a §10 `warn`-level `placeholder_missing` event. Allows boot to proceed but surfaces the gap on every affected turn.

Owner ruling needed during Phase 9.D. Either (or both) disposition belongs in `system.md` `[CONTEXT]` block semantics: should an unset trusted-context placeholder fail boot, fall back, or both?

**Status.** Reconciled. Canon edit landed in gold vision v1.7 (Cycle 304 Phase 9.D — WO-304.9.a). Code edit landed in Cycle 305 Session 305.2 (WO-305.2.a) — `server.js` validates `ORG_NAME` and `CRISIS_LINE` non-empty at boot and emits a `config_invalid` §10 event + `process.exit(1)` on failure; Vitest test `test/server-boot.test.js` covers four failure paths (ORG_NAME unset/empty, CRISIS_LINE unset/empty) plus the success path.

---

### D19 — Canon files reference deck by filename without path prefix

| Field      | Value                                                                       |
| ---------- | --------------------------------------------------------------------------- |
| Severity   | MINOR                                                                       |
| Phase      | Phase 9.B (Implementing deck reconciliation)                                |
| Discovered | Cycle 304, Session 304.7 (WO-304.6.b Stage 1, D.2 deliverable verification) |
| Status     | Ratified                                                                    |

**Discovery.** WO-304.6.b §D.2 ("path-reference updates in canon for the deck-relocation side effect") was authored in Session 304.6 against the assumption that deck-path moves require canon updates. On Stage 1 execution in Session 304.7, D.2 verified as a no-op: the three target canon files (`intake-triager-build-plan.md`, `intake-triager-gold-vision.md` Appendix B, `cycle-304-baseline.md`) reference the deck by filename only (`Implementing_the_Restaurant.pptx`), never by path prefix. The 304.6 deck relocation from `products/restaurant-pattern-training/` to a sibling `training-decks` repo's `restaurant-pattern/` folder did not propagate to canon because there was no path prefix to update.

**Concrete exposure.** None. The convention itself isn't a defect — filename-only references are repo-relocation-resilient, which is desirable. The discovery is that the convention is **implicit**, not declared. Future deck moves work the same way by accident, not by design. A future contributor who adds a path-prefixed reference would not be flagged by any convention check.

**Evidence.** Session 304.7 checkpoint, Completed Items: "D.2 (path-reference updates: confirmed no-op — three target files reference deck filenames without path prefixes)." Session 304.6 checkpoint, WO-304.6.b §Files to Touch table named the three files explicitly: `intake-triager-build-plan.md`, `intake-triager-gold-vision.md`, `cycle-304-baseline.md`.

**Workaround applied.** None — D.2 confirmed no-op at execution time.

**Reconciliation target.** Owner ruling needed during Phase 9.D: (a) ratify the filename-only convention as a canon norm (e.g., one-line note in gold vision §13 or in build-plan governance section), or (b) require path-prefixed references going forward (more brittle on relocation; not recommended). Option (a) closes the gap with one editorial sentence. Phase 9.D in Cycle 304.

**Status.** Ratified (Phase 9.D — no canon edit required; existing state ratified as canon-aligned-by-absence). Phase 9.D triage (Session 304.9) ratified the filename-only convention; no canon edit applied. Convention enforced itself in production during WO-304.9.a and WO-304.9.b execution (file paths in WO headers carried path prefixes; Claude Code resolved correct files via filename match).

---

### D20 — PPTX repack passing zipfile/lxml/python-pptx does not guarantee Office content validation

| Field      | Value                                                       |
| ---------- | ----------------------------------------------------------- |
| Severity   | MAJOR                                                       |
| Phase      | Phase 9.B (Implementing deck reconciliation)                |
| Discovered | Cycle 304, Session 304.7 (WO-304.6.b Stage 3 first attempt) |
| Status     | Reconciled                                                  |

**Discovery.** WO-304.6.b Stage 3 first-attempt repack of `Implementing_the_Restaurant.pptx` passed every available XML validator — `zipfile.testzip()`, `xml.etree.ElementTree.parse`, `lxml.etree.parse`, and `python-pptx`'s default open path — yet was rejected by PowerPoint's content validator at file-open time with a "PowerPoint found a problem with content" repair dialog. The defect was an OOXML-semantic violation (an empty `<p:txBody>` element on Slide 4's RightColumn shape, post-A.1 byte-range reorder) that none of the four upstream validators detect. Sam clicked Cancel preserving the broken binary; bisect-by-deliverable localized the failure to A.1.

**Concrete exposure.** Without an OOXML-semantic gate, every PPTX-touching WO since Cycle 301 has been one A.1-class defect away from a silent corruption that surfaces only on Sam's local PowerPoint open. The Cycle 301.8 deck work (11 new slides) and Cycle 304.5/304.6 mechanical edits passed by luck — none of those changes happened to leave a `<p:txBody>` empty. The validator chain in widespread use _cannot_ catch this class of defect; only PowerPoint can. Build velocity in any future PPTX cycle is one round-trip per defect (Sam open-test → fail → bisect → repair) without a pre-PowerPoint gate.

**Evidence.** Session 304.7 checkpoint, Forensic triage: "slide 4 is a two-shape layout: LeftColumn (id=5) carries CONTEXT through MARKER PROTOCOL, RightColumn (id=6) carries RULES; v1.0's byte-range reorder dragged RULES paragraphs into LeftColumn and emptied RightColumn's `<p:txBody>` (an OOXML-semantic violation invisible to lxml/python-pptx/`zipfile.testzip()`)."

**Workaround applied.** OOXML-semantic gate added after every deliverable in Stage 3 redux and all subsequent Phase 9.B + 9.C stages. The gate verifies every modified slide's `<p:txBody>` element contains at least one `<a:p>` child — the specific OOXML-semantic constraint A.1's defect violated. The gate is implemented inline in the WO Execution Block's per-stage verification step (V3 in WO-304.8.a; equivalent positions in WO-304.6.b Stages 3–6). All subsequent stages (Stage 3 redux through Stage 6 plus all of WO-304.8.a) passed both the gate and Sam's PowerPoint open-test on first attempt.

**Reconciliation target.** STD-13 process amendment in Phase 9.D, Cycle 304. Two complementary candidates:

1. **Mandatory pre-flight rule for PPTX-touching WOs.** Add a clause to STD-13 §Verification (or §10 Edits-pattern verification rules) requiring an OOXML-semantic gate on every PPTX edit deliverable. The rule names `<p:txBody>`-non-empty as the minimum-viable check; future expansion may add `<p:sp>` reference integrity, slide-relationship file count, etc.
2. **Reusable gate script as a hopper-tooling artifact.** Lift the inline gate into a standalone PowerShell or Python script (e.g., `tools/ooxml-semantic-gate.ps1`) that PPTX-touching WOs invoke from their Verification block. Centralizes maintenance; reduces per-WO authoring overhead.

Owner ruling needed: prefer (1) alone, (2) alone, or both. Both is the most robust answer (gate spec lives in STD-13; implementation lives in tooling).

**Status.** Reconciled (Phase 9.D — WO-304.9.b, STD-13 v1.2). STD-13 RULE-10 added; tooling artifact `tools/ooxml-semantic-gate.ps1` created (commit `a27a69cc`).

---

### D21 — Cycle 304.6 inventory misread Slide 4 as single-column; canon-vs-deck audits must inspect shape topology

| Field      | Value                                                     |
| ---------- | --------------------------------------------------------- |
| Severity   | MINOR                                                     |
| Phase      | Phase 9.B (Implementing deck reconciliation)              |
| Discovered | Cycle 304, Session 304.7 (forensic triage of A.1 failure) |
| Status     | Reconciled                                                |

**Discovery.** The Phase 9.B inventory drafted in Session 304.6 (`phase-9b-implementing-deck-inventory.md`) read Slide 4 as a single-column document-flow layout. WO-304.6.b's A.1 deliverable was authored against that mental model: a byte-range reorder that assumed all paragraphs lived in one `<p:txBody>`. Forensic triage of the Stage 3 failure revealed Slide 4 is actually a two-shape layout: LeftColumn (id=5) carries the CONTEXT-through-MARKER-PROTOCOL paragraphs; RightColumn (id=6) carries the RULES paragraphs. A.1's reorder dragged content across the shape boundary, emptying RightColumn's `<p:txBody>` and triggering D20's content-validator failure.

**Concrete exposure.** A.1 was struck in WO-304.6.b v1.1; Slide 4 was not redesigned (canon §6 governs prompt-file section order, not slide visual layout — Sole Benefactor decision). One deliverable lost; one round-trip burned on bisect and forensic triage. The same inventory-practice gap applies to any future deck reconciliation that walks slides as text streams without inspecting `<p:sp>` topology.

**Evidence.** Session 304.7 checkpoint, Forensic triage entry (verbatim): "slide 4 is a two-shape layout: LeftColumn (id=5) carries CONTEXT through MARKER PROTOCOL, RightColumn (id=6) carries RULES; v1.0's byte-range reorder dragged RULES paragraphs into LeftColumn and emptied RightColumn's `<p:txBody>`." The 304.6 inventory was authored by reading the deck's text content via the PPTX skill's text-extraction pipeline, which flattens shape topology by design.

**Workaround applied.** A.1 struck in WO-304.6.b v1.1 (commit `4b85cb0a`). Sole Benefactor decision recorded: canon §6 binds prompt-file content section order; visual layout is authorial choice. No redesign required.

**Reconciliation target.** Process amendment to deck-reconciliation inventory practice in Phase 9.D, Cycle 304. Candidates:

1. **Inventory-practice rule.** Update build-plan §Phase 9.B (and any future deck-reconciliation phase template) to require a topology-level pass on every slide named in the inventory: enumerate shapes, note multi-shape layouts, flag any slide where text-flow assumptions could cross shape boundaries.
2. **Lift to a reusable inventory-authoring checklist.** Same content as (1) but as a hopper-tooling checklist artifact, callable from any deck-reconciliation phase.

Aligns with D20 (process amendment scope). Phase 9.D in Cycle 304.

**Status.** Reconciled (Phase 9.D — WO-304.9.b, STD-13 v1.2). Folded into STD-13 RULE-10 sub-clause 2 (slide-topology pre-author pass).

---

### D22 — WO B.1 structural gate spec under-counted ZIP members by one (missed `_rels` file)

| Field      | Value                                                         |
| ---------- | ------------------------------------------------------------- |
| Severity   | MINOR                                                         |
| Phase      | Phase 9.B (Implementing deck reconciliation)                  |
| Discovered | Cycle 304, Session 304.7 (WO-304.6.b Stage 5 / B.1 execution) |
| Status     | Reconciled                                                    |

**Discovery.** WO-304.6.b §B.1 inserted a new slide ("Conversation status transitions") at display position 32. The WO's structural-gate spec for B.1 enumerated the new ZIP members the PPTX repack would add and prescribed the post-repack member count as a verification check. The spec under-counted by one member: it named the new `ppt/slides/slideNN.xml` file but omitted the corresponding `ppt/slides/_rels/slideNN.xml.rels` file that OOXML requires for every slide.

**Concrete exposure.** Stage 5 visual QA passed because the executor (Claude Code) created the `_rels` file as part of standard OOXML hygiene — it's a structural prerequisite for the slide to be loadable, and any sane PPTX-edit pipeline emits it whether or not the WO names it. The defect lives in the WO authoring discipline, not the executed binary. A stricter executor (or one operating closer to the WO spec literal) would have under-emitted the `_rels` file and produced a non-loading deck.

**Evidence.** Session 304.7 checkpoint, Completed Items: "Stage 5 / B.1 executed and visually QA'd — new slide inserted at display position 32 ('Conversation status transitions'); seven pre-flight investigations recorded; six structural gates pass; OOXML-semantic gate clean; flanking slides at display 31 and 33 confirmed intact." The "six structural gates" count corresponds to the WO's spec; one additional gate (the `_rels` member existence check) would have made it seven.

**Workaround applied.** None — Stage 5 passed visual QA because the executor handled the `_rels` file outside the spec.

**Reconciliation target.** WO-authoring practice for new-slide-insertion (B-family) deliverables. Update STD-13 (or a deck-reconciliation WO authoring checklist) to require, for every new slide inserted: enumeration of both `slideNN.xml` and `slideNN.xml.rels` as expected ZIP members, plus any updates to `[Content_Types].xml` and `ppt/_rels/presentation.xml.rels`. Aligns with D20 / D21 process-amendment scope. Phase 9.D in Cycle 304.

**Status.** Reconciled (Phase 9.D — WO-304.9.b, STD-13 v1.2). Folded into STD-13 RULE-10 sub-clause 3 (full ZIP-member enumeration for new-slide-insertion deliverables).

---

### D23 — Redux dispatches must explicitly re-list non-struck deliverables

| Field      | Value                                                             |
| ---------- | ----------------------------------------------------------------- |
| Severity   | MAJOR                                                             |
| Phase      | Phase 9.B (Implementing deck reconciliation)                      |
| Discovered | Cycle 304, Session 304.8 (A.17 verification of post-Stage-5 deck) |
| Status     | Reconciled                                                        |

**Discovery.** When WO-304.6.b v1.1 struck A.1 (per D21), the Stage 3 redux dispatch list was reconstructed around the strike. A.5 (Slide 13 prose update) — which had been listed before A.1 in the original Stage 3 dispatch — was collateral-killed unobserved during the reconstruction. No participant detected A.5's absence at dispatch, and no automated check flagged the omission. Stages 1–5 closed believing all non-struck Stage 3 deliverables had landed. A.17 verification in Session 304.8 (the safety-net sweep deferred during 304.7) surfaced Slide 13 in pre-A.5 state — appendMessage signature stale, prose unchanged. Required a Stage 6 corrective dispatch (WO-304.6.b v1.2 with A.5 reinstated and A.22 added).

**Concrete exposure.** One deliverable silently dropped from a multi-stage dispatch sequence; one extra round-trip burned on Stage 6 corrective + verification. The failure mode applies to every redux dispatch in any STD-13 §10 Deliverables-pattern WO: when an Edit/Deliverable is struck in a WO version bump and the redux dispatch list is rebuilt, the rebuild relies on cumulative-baseline-plus-new-deliverables logic without an explicit checklist of what should still be present from prior versions. A.5's loss is the smoking-gun instance; future redux dispatches with this pattern remain exposed.

**Evidence.** Session 304.8 checkpoint, Completed Items (verbatim): "**A.17 verification first run** against post-Stage-5 deck — independent grep sweep across A.17 target slides... Surfaced two gaps: Slide 13 in pre-A.5 state (`assembler.build` / `chef.complete` / `appendMessage(req.body.conversationId, prose)` still present); Slide 36 two `appendMessage` calls missing `tx` and `owner_id`." And Cross-reference review entry: "confirmed A.5 absent from Stage 1, 2, 3-redux, 4, 5 dispatch listings. Mechanism: Stage 3 redux deliverable list reconstructed around A.1 strike collateral-killed A.5; absence unobserved because A.17 (the safety-net sweep) was deferred."

**Workaround applied.** WO-304.6.b v1.2 amendment drafted (commit `65a88212` on hopper main): A.5 reinstated for Stage 6 dispatch with status note in deliverable header; A.22 added as new deliverable for the related Slide 36 backfill (per D17/A.18 narrow-scoping); Stage 6 corrective framing in §Design Decision; V6 verification block (A.5 grep + A.22 grep + OOXML-semantic gate); §Success Criteria amended. Stage 6 dispatched and verified clean; A.17 re-run pass.

**Reconciliation target.** STD-13 process amendment in Phase 9.D, Cycle 304. Two candidate clauses (likely both):

1. **Redux-dispatch checklist rule.** Add to STD-13 §10 (or §Verification family): every redux dispatch in a Deliverables-pattern WO must explicitly enumerate **all non-struck deliverables** still in scope, not rely on cumulative-baseline reasoning. The dispatch prompt itself becomes the checklist.
2. **Strike-handling rule.** When a WO version bump strikes any deliverable, the version-bump entry in §Change History must include both (a) the struck deliverable's ID and (b) the still-in-scope deliverable IDs that flank it (for ordering reconstruction).

Both close the same hole from different directions. Owner ruling needed; recommend ratifying both since they are non-overlapping and cheap.

**Status.** Reconciled (Phase 9.D — WO-304.9.b, STD-13 v1.2). Both clauses ratified and codified as STD-13 RULE-11 (redux-dispatch enumeration + strike-handling flanking IDs in §Change History).

---

### D24 — Slide 47 `appendMessage` retains `conversation_id: conversationId` camelCase shadow

| Field      | Value                                                       |
| ---------- | ----------------------------------------------------------- |
| Severity   | MINOR                                                       |
| Phase      | Phase 9.B (Implementing deck reconciliation, closing audit) |
| Discovered | Cycle 304, Session 304.8 (A.17 re-run pass)                 |
| Status     | Open                                                        |

**Discovery.** During the A.17 re-run pass against the post-Stage-6 Implementing deck binary, Slide 47 (display position 47; original Slide 46) was confirmed to retain a `conversation_id: conversationId` camelCase-shadow assignment in its `appendMessage` call. The shadow is a JavaScript pattern where an object literal property named in snake_case is assigned a value from a same-named camelCase variable: `appendMessage({ conversation_id: conversationId, ... })`. WO-304.6.b §A.21 acceptance was scoped to `tx` + `owner_id` only and was met as written; Slide 47's body fields were not in §A.21's surface. WO-304.6.b §A.22 (added in v1.2 per D23 corrective) explicitly normalized the same shadow on Slide 36, removing it in favor of the snake_case identifier alone. Slide 47 stayed inconsistent with the cleaned-up Slide 36.

**Concrete exposure.** Two slides in the same deck show the same canon API (`appendMessage`) with stylistically inconsistent code: Slide 36 uses the clean form (`conversation_id` identifier alone); Slide 47 still uses the camelCase shadow. Pedagogically distracting; a reader comparing the two slides would correctly notice the inconsistency and incorrectly infer it carries semantic weight. Build-impact zero; canon-impact zero.

**Evidence.** Session 304.8 checkpoint, Completed Items (verbatim): "**D24-candidate logged** during A.17 re-run — Slide 47 (display position 47; original Slide 46) `appendMessage` retains `conversation_id: conversationId` camelCase shadow; A.21 acceptance was scoped to `tx` + `owner_id` only and was met. A.22 explicitly normalized the same shadow on Slide 36; consistency drift between two slides showing the same canon API. Deferred to Phase 9.D batch as MINOR."

**Workaround applied.** None. The drift was logged as Phase 9.D candidate at the moment of detection; visual QA on Slide 47 had passed against A.21's stated acceptance (which did not cover the body-fields surface).

**Reconciliation target.** One-line edit on Slide 47's `appendMessage` call in any Phase 9.D corrective WO. Either (a) folded into WO-304.9.a as a small additional Edit on the deck binary (requires a Phase 9.D editorial branch on `training-decks`), or (b) deferred to Cycle 305+ as a standalone follow-up touch (the deck has just been merged to `training-decks/main`; opening a single-edit PR here is acceptable but not urgent). Owner ruling needed during Phase 9.D triage.

**Phase 9.D triage outcome (Session 304.9):** Option (b) — deferred to Cycle 305+. Single-line consistency drift not worth opening another `training-decks` editorial branch for.

**Cycle 305 closure (Session 305.1):** Folded into WO-305.1.a as A.6 per RULE-06 same-asset rationale (Slide 47 display position carries four of six v1.7 cascade deliverables; one feature branch on the monorepo closes both v1.7 obligations 1, 2, 4 and D24 in a single PR). Slide 47 right-pane `appendMessage` call amended: `conversation_id: conversationId` shadow removed; identifier left as snake_case `conversation_id` alone, matching Slide 36's convention and `pantry.js` shipped signature.

**Status.** Reconciled (Session 305.1, WO-305.1.a).

---

### D25 — STD-13 self-declared front-matter `path:` field stale (named non-existent `tier-0-operational/` directory)

| Field      | Value                                           |
| ---------- | ----------------------------------------------- |
| Severity   | MINOR                                           |
| Phase      | Phase 9.D (Build-discoveries reconciliation)    |
| Discovered | Cycle 304, Session 304.9 (WO-304.9.b execution) |
| Status     | Reconciled                                      |

**Discovery.** During WO-304.9.b execution, Claude Code observed that `work-order-standard.md`'s own front-matter `path:` field declared `products/hopper/engineering/standards/tier-0-operational/work-order.md` — a path that does not exist on disk. The actual file lives at `products/hopper/engineering/standards/work-order-standard.md`. The drift pre-dated WO-304.9.b and was not part of any Edit in that WO.

**Concrete exposure.** None functional — the front-matter `path:` field is declarative metadata, not a runtime reference; nothing in the build chain consumes it. The drift is a discoverability defect: any tool or contributor that trusts the front-matter `path:` to locate the file will fail. The drift also exemplifies D19 in negative form — when canonical references mix path prefixes and filename-only conventions inconsistently, the path-prefixed reference is the brittle one.

**Evidence.** `work-order-standard.md` front-matter line 4 (pre-fix): `path: products/hopper/engineering/standards/tier-0-operational/work-order.md`. Repository directory listing under `products/hopper/engineering/standards/`: contains `work-order-standard.md` (and other tier-0 standards), no `tier-0-operational/` subdirectory. Claude Code surfaced the drift in the WO-304.9.b execution report's "Path notes" section.

**Workaround applied.** None — discovered post-merge.

**Reconciliation target.** Single-line front-matter edit on `work-order-standard.md`: `path:` field updated to `products/hopper/engineering/standards/work-order-standard.md`. Bundled into the same commit as the WO-304.9.b STD-13 v1.1 → v1.2 amendments (commit `a27a69cc` on hopper `main`). Doc-only edit; no WO required (STD-13 §2 _Does NOT Apply To_ — front-matter metadata is not a code change).

**Status.** Reconciled (in-cycle by commit `a27a69cc` on hopper `main`).

---

### D26 — Canon snake_case for HTTP/object surfaces is in tension with naming-standard RULE-07 / RULE-10

| Field      | Value                                                                       |
| ---------- | --------------------------------------------------------------------------- |
| Severity   | MAJOR (governance — affects HTTP contract, Pantry signatures, deck content) |
| Phase      | Phase 9.E (v1.7 cascade — surfaced during 305.1 inventory)                  |
| Discovered | Cycle 305, Session 305.1 (during WO-305.1.a A.6 audit against `naming.md`)  |
| Status     | Open (Cycle 306+ candidate)                                                 |

**Discovery.** During Session 305.1 inventory work, Sam asked whether D24's `conversation_id: conversationId` shadow was the only `naming.md`-violating identifier in the deck or whether a broader pattern existed. Audit against `products/hopper/engineering/standards/naming.md` v3.2 (the Naming Standard) surfaced a systematic tension: canon (gold vision §4 HTTP API contract; shipped `pantry.js`, `chef.js`, `converse.js`) deliberately uses **snake_case** for HTTP request/response body fields (`{conversation_id, content}`), Pantry-method object-parameter property names (`{conversation_id, role, content, token_usage, owner_id}`), and the local variables destructured from them. This conflicts with naming-standard **RULE-07** (JS variables = camelCase) and **RULE-10** (API request/response fields = camelCase; JSON config fields = camelCase). The choice is defensible on engineering grounds — one identifier from DB column → object property → API field eliminates a translation layer — but it diverges from the dominant industry convention (camelCase JSON + snake_case DB + translate at boundary).

**Concrete exposure.** Every Implementing deck slide that shows a Pantry call (13, 26, 28, 29, 35, 36, 37, 38, 44, 46, 47), the HTTP-contract slide (11), and the marker-payload slides (18, 19) carries the same canon-vs-naming-standard tension. The README HTTP-contract subsection and Pantry-method enumeration carry it. The shipped `pantry.js`, `chef.js`, `converse.js` carry it. The DB DDL is correct per RULE-08 (snake_case columns); the violations live above the DB boundary.

**Evidence.** Session 305.1 conversation (Bob inventory + Sam GOLD ruling): "Industry-standard convention (camelCase API + snake_case DB + boundary translation) is the destination, but the Cycle 305 baseline Package A scope-discipline holds. The tension is logged here as D26 for Cycle 306+ candidate slate." Repo verification at 305.0: `appendMessage` signature `{conversation_id, role, content, token_usage, owner_id}` confirms snake_case object-parameter convention shipped. Naming standard RULE-10 row 2 (API request/response fields) and RULE-07 (JS variables) verbatim require camelCase.

**Workaround applied.** None at code level. WO-305.1.a A.6 brings Slide 47 into consistency with Slide 36 and shipped `pantry.js` — preserves canon snake_case rather than aligning to RULE-10. Naming-standard tension is acknowledged but unresolved in this WO.

**Reconciliation target.** Cycle 306+ OBJ. Three options surfaced in Session 305.1 strategy:
(a) Amend naming standard with an exception: "Fields with 1:1 DB column mapping may use snake_case throughout (DB → object → HTTP) for boundary-translation avoidance." Cheapest; canon already conforms.
(b) **GOLD path — rewrite canon to RULE-10.** Switch HTTP body fields and Pantry-method object parameters to camelCase; introduce DB-boundary translation; refactor `pantry.js`, `chef.js`, `converse.js`; bump gold vision v1.7 → v1.8; cascade against Implementing deck, README, Mgmt deck. Estimated 5–10 sessions across multiple repos. Aligns with industry standard, drops impedance for every consumer, simplifies onboarding for any developer who has worked with modern JS APIs.
(c) Acknowledge tension as deliberate — file an ADR documenting the snake_case-throughout choice; note RULE-10 as not-applicable to canon-spec'd surfaces. Middle cost; codifies divergence.

Sam's GOLD-thinking ruling at Session 305.1: option (b) is GOLD — it wins on industry-standard alignment, reliability for consumers, prudence (cascade cost paid once vs. perpetual impedance tax), flexibility (camelCase JSON drops into every JS framework), and educational value (decks teach the dominant pattern). Holds for Cycle 306+ baseline drafting.

**Status.** Open (Cycle 306+ candidate).

---

### D27 — Hopper monorepo pre-commit hook fails on clean `main` (validator false-positives blocking doc-only commits)

| Field      | Value                                                                    |
| ---------- | ------------------------------------------------------------------------ |
| Severity   | MAJOR (governance — blocks every doc-only commit on hopper monorepo)     |
| Phase      | Phase 9.E (surfaced during WO-305.1.a execution, Session 305.1)          |
| Discovered | Cycle 305, Session 305.1 (Edits 5 + 7 attempted on ServiceBridge `main`) |
| Status     | Open (Cycle 306+ candidate — validator-triage WO)                        |

**Discovery.** During WO-305.1.a execution, Claude Code attempted to commit Edits 5 (gold vision Appendix B closure annotations) and 7 (`backlog-_index.md` propagation) to `ParadigmPilot/ServiceBridge`. The hopper monorepo's pre-commit hook failed on a freshly-pulled clean `main`, with multiple validator errors that have nothing to do with the staged changes: JWT validator self-references inside its own validator code; a11y-checker pointed at a path that no longer exists; EJS template violations in template files (which are pattern definitions, not deployable code); `dist/*` build artifacts tripping the JWT validator. Both Edits 5 and 7 had to be committed with `--no-verify` to land. The PR body documented the bypass.

**Concrete exposure.** Every doc-only commit to hopper `main` now requires `--no-verify`. Routine governance work (checkpoint authoring, build-discovery logging, archetype amendments, cycle baseline drafting) cannot pass the pre-commit hook even though none of it touches code or templates the validators are meant to police. Two failure modes: (a) contributors learn to bypass the hook reflexively, defeating its purpose; (b) some contributor someday lands a real validator-relevant defect with `--no-verify`, and the hook's value evaporates.

**Evidence.** Session 305.1 conversation (Claude Code execution report, post-PR-open): "Hook bypass on ServiceBridge#2 — both commits used `--no-verify` because the hopper-monorepo pre-commit hook fails on a clean `main` (JWT validator self-references, broken a11y-checker path, EJS template violations, `dist/*` artifacts tripping JWT validator). Documented in the PR body. Suggest a follow-up WO to triage." Confirmed independently when the v2.9 archetype propagation commit (`78777dd8`) and the cycle-305 governance docs commit (`b41491a1`) also required `--no-verify`.

**Workaround applied.** `--no-verify` flag on all five doc-only commits during WO-305.1.a execution and the two follow-on housekeeping commits.

**Reconciliation target.** Cycle 306+ OBJ — validator-triage WO. Three deliverables: (1) enumerate every validator that fires on a clean `main`, classify each as false-positive vs. legitimate-but-misplaced; (2) for false positives, either fix the validator or scope-narrow it (skip `dist/*`, skip self-references, skip files matching `*.md` unless under `engineering/standards/` or archetypes); (3) add a `[doc-only]` commit-message tag or path-based detection that lets the hook short-circuit cleanly. Test against the WO-305.1.a commits — expect zero false-positive fires.

**Status.** Open (Cycle 306+ candidate — validator-triage WO).

---

### D28 — Python heredoc escape collapse during PPTX-WO Edit composition (Slide 5 `\n` near-miss)

| Field      | Value                                                                  |
| ---------- | ---------------------------------------------------------------------- |
| Severity   | MINOR (process — caught at visual QA before commit)                    |
| Phase      | Phase 9.E (surfaced during WO-305.1.a execution Edit 4, Session 305.1) |
| Discovered | Cycle 305, Session 305.1                                               |
| Status     | Open (STD-13 §"XML edit conventions" amendment candidate)              |

**Discovery.** During WO-305.1.a Edit 4 (Slide 5 right-pane `prompt-injection.js` excerpt addition), Claude Code's first composition attempt passed the find/replace through a Python heredoc. The replacement text contained two literal `\n` escape sequences inside a JavaScript template-literal body — `return \`${OPEN}\n${safe}\n${CLOSE}\`;`— intended to render as the four characters`\`, `n`, `\`, `n` in the slide (i.e., displayed source code showing the template literal). The heredoc collapsed both `\n` into actual newline characters in the buffer, which then wrote into the slide as line-breaks in the middle of the `return` statement. Visual QA on the JPEG render caught the mis-rendering before the commit. Claude Code re-composed Edit 4 using a non-heredoc path (direct string assignment with explicit escape doubling), re-ran the OOXML-semantic gate, re-rendered the JPEG, confirmed correct rendering, then committed.

**Concrete exposure.** Any future PPTX-WO that includes code fragments with literal escape sequences (`\n`, `\t`, `\r`, `\\`, `\"`, etc.) and composes the find/replace through a Python heredoc carries the same risk. The OOXML-semantic gate does not catch this — the resulting XML is structurally valid; the rendered slide is wrong. Only visual QA at JPEG render time detects it. WO-305.1.a's mandatory visual-QA step is what made this a near-miss instead of a defect.

**Evidence.** Session 305.1 Claude Code execution report (Caveat #3, verbatim): "Slide 5 `\n` correction during Edit 4 — first attempt rendered the JS template-literal `\n` escapes as actual newlines (heredoc-to-Python escape collapse). Caught by visual QA, fixed before committing; final commit ships the corrected bytes (verified in JPEG render)." STD-13 v1.2 §"XML edit conventions" (added via WO-305.1.a v1.1 amendment) lists five conventions (entity encoding, multi-run span, `xml:space`, smart-quote, em-dash/ellipsis) — escape-sequence preservation is not among them, so the WO did not pre-warn the executor.

**Workaround applied.** Re-composed Edit 4 with explicit escape doubling on the second attempt; ran visual QA between the two attempts; final commit on `training-decks/main` ships corrected bytes.

**Reconciliation target.** STD-13 amendment — extend §"XML edit conventions" with a sixth convention (Convention 6 — Escape-sequence preservation): "When find/replace strings contain literal escape sequences (`\n`, `\t`, `\r`, `\\`, `\"`, etc.) inside displayed code fragments, the executor must preserve the escape as literal characters in the slide XML. If the composition path uses a Python heredoc or any string-templating layer that interprets escape sequences, double-escape (`\\n` → renders `\n`) before passing to the heredoc, or use a path that does not interpret escapes (raw strings, direct file write)." Add to §"XML edit conventions" alongside the existing five conventions; update STD-13 v1.2 → v1.3 with the addition logged in §Change History. Existing PPTX WOs not retroactively edited.

**Status.** Open (STD-13 §"XML edit conventions" amendment candidate).

---

### D29 — Gold vision §4 _Repo structure_ tree omits `test/server-boot.test.js` shipped in Session 305.2

| Field      | Value                                                                                         |
| ---------- | --------------------------------------------------------------------------------------------- |
| Severity   | MINOR (canon hygiene — editorial only, no behavioral semantics)                               |
| Phase      | Phase 9.E (surfaced during WO-305.3.a inventory pass, Session 305.3)                          |
| Discovered | Cycle 305, Session 305.3                                                                      |
| Status     | Reconciled (gold vision §4 tree amended + version bumped 1.7 → 1.7.1 in same WO — WO-305.3.a) |

**Discovery.** The Phase 9.E.2 inventory pass (`phase-9e2-readme-inventory.md`) preparing the README v1.7 cascade WO surfaced a canon-vs-repo gap: gold vision §4 _Repo structure_ tree (lines 225–282 at v1.7) enumerates 9 files in the test/ block (converse, cors, cost-ceiling, expediter, handlers, input-validation, prompt-assembler, prompt-injection, rate-limit). The 10th file — `test/server-boot.test.js`, shipped in Cycle 305 Session 305.2 via WO-305.2.a (D18 code-side reconciliation, merge commit `978cbf9`) — was not enumerated in canon. The gap was editorial-only; behavioral semantics of the boot-validation rule are canonized correctly in v1.7 §10 _Configuration_ Boot-time validation subsection. The §4 tree comment for `server.js` similarly does not name boot-validation responsibility, but that is a separate editorial gap left for a future cycle.

**Concrete exposure.** The README v1.7 cascade obligation A.6 ("Update repo-tour file tree to reflect the v1.7 structure") was disposition-locked as **verbatim copy of gold vision §4 tree**. Without amending §4 first, the README would either ship internally inconsistent (A.8's amended unit-test prose declaring "10 files / 85 tests" alongside a tree showing 9 test files) or introduce README-vs-canon drift (the very problem the cascade is designed to eliminate).

**Resolution applied.** Hard-pause amendment to gold vision §4 invoked under the explicit CRITICAL exception clause in `cycle-305-baseline.md` v1.1 ("no further canon bumps in 305 unless a CRITICAL discovery forces a hard-pause amendment"). Amendment is editorial-only: (a) §4 tree gains one line — `├── server-boot.test.js          # server.js boot-validation unit tests`; (b) YAML version bumps 1.7 → 1.7.1 (patch-level hygiene, not a v1.8 amendment); (c) Appendix A gains a new v1.7.1 hygiene patch entry above the v1.7 entry. v1.7 GOLD-graduation status preserved; v1.7's enumeration of v1.6→v1.7 amendments retained verbatim. README A.6 then mirrors the amended canon faithfully.

**Reconciliation target.** Reconciled in WO-305.3.a Edits 1–3 (gold vision YAML + §4 tree + Appendix A patch entry on `ServiceBridge`). README mirroring lands in Edit 6 on `intake-triager`. Future canon-vs-repo audit candidates not in this WO scope: (i) §4 tree comment for `server.js` does not name boot-validation responsibility (Cycle 306+ candidate); (ii) any other file-tree drift introduced by future work — surface as new D-entries.

**Status.** Reconciled (canon edit landed in same WO; born Reconciled).

---

### D30 — PPTX slide-clone WOs must include explicit rels-file amendment step when source slide carries a notesSlide reference

| Field      | Value                                                                 |
| ---------- | --------------------------------------------------------------------- |
| Severity   | MINOR (WO-authoring discipline — caught at execution; bug suppressed) |
| Phase      | Phase 9.E (surfaced during WO-306.3a D.3.2 execution)                 |
| Discovered | Cycle 306, Session 306.3                                              |
| Status     | Open (STD-13 RULE-10 amendment candidate)                             |

**Discovery.** WO-306.3a D.3.2 instructed verbatim clone of `ppt/slides/_rels/slide21.xml.rels` → `ppt/slides/_rels/slide35.xml.rels` with the explicit assertion "no edit is required to the rels file itself" — written under the assumption that slide rels files only reference the layout. The actual `slide21.xml.rels` carried two relationships: `rId1` → `slideLayout2.xml` (expected) AND `rId2` → `notesSlide18.xml` (not anticipated by the WO). A verbatim clone would have made slides 21 and 35 share `notesSlide18.xml` — a subtle "edit-one-affects-the-other" defect across PowerPoint's Notes view. The defect was caught at execution time and resolved by trimming the `notesSlide` ref from the cloned rels; documented in the WO-306.3a D.3 commit message as a deviation-with-rationale. PRECEDENT lineage: D20 (PPTX-WO Office-content-validation gap), D21 (inventory-time shape-topology blindspot), D22 (structural-gate ZIP-member under-count). D30 is the same class of hazard — WO author working from an incomplete model of OOXML — caught one round earlier in the loop because the executor inspected before cloning.

**Concrete exposure.** Every PPTX slide-clone deliverable in the STD-13 RULE-10 lineage (D.3-class structural insertions) is designed assuming slide rels files carry only the layout reference. Real OOXML practice attaches per-slide `notesSlide` rels routinely (PowerPoint generates them for every slide unless explicitly stripped). Any future slide-clone WO that doesn't enumerate the source rels file's full relationship list at WO-draft time can produce shared-notes-slide defects at executor discretion (depending on whether the executor catches the issue). The same hazard generalizes to other rels classes — `image`, `chart`, `oleObject`, `hyperlink` — any per-slide relationship that conceptually belongs to the source slide rather than the new clone.

**Reconciliation target.** STD-13 RULE-10 amendment in a future cycle: extend the slide-clone-deliverable spec (currently RULE-10 clause 3 — "Full ZIP-member enumeration for new-slide-insertion deliverables") to require explicit enumeration of the source slide's rels file contents at WO-draft time, with a per-relationship disposition (clone-verbatim / drop / re-target). Pairs naturally with the existing ZIP-member enumeration discipline. Likely framed as a new sub-clause of RULE-10 ("Rels-file enumeration for slide-clone deliverables").

**Status.** Open (Cycle 307+ STD-13 RULE-10 amendment candidate).

---

### D31 — Input box loses focus across pending→idle transitions and is not auto-restored

| Field      | Value                                                              |
| ---------- | ------------------------------------------------------------------ |
| Severity   | MAJOR (UX defect — every-turn occurrence; manual-click workaround) |
| Phase      | Phase 7 (Frontend — Dining Room + Runner)                          |
| Discovered | Cycle 306, Session 306.0                                           |
| Status     | Reconciled (Session 306.4, intake-triager a4a3622)                 |

**Discovery.** On the intake-triager UX, after a system reply lands the input box stays unresponsive to keystrokes until the user clicks into it. Reproduces on every turn except the initial mount. Manual workaround: click the input before typing the next message. Surfaced during interactive use after the Phase 7 frontend shipped (`303.8.a` Phase 7 Gate); named D31 at Cycle 306 baseline scoping (`cycle-306-baseline.md` v1.1 OBJ-2) and tracked as BL-143 (Cycle 306, Session 306.4 capture).

**Root cause.** Mechanically demonstrable from `App.jsx` + `MessageInput.jsx` source (verified Session 306.4):

1. `App.handleSend` sets `pending=true` before the `fetch`, then `pending=false` in the `finally` block. The `finally` runs on every path — happy path, 4xx/5xx early-return, network throw — so `pending` correctly transitions back to false. Hypothesis "pending-flip miss" is falsified.
2. `MessageInput` computes `disabled = terminal || pending` and binds it to the `<input>` element. While `pending=true`, the input is genuinely `disabled`.
3. Per the HTMLInputElement spec a `disabled` input cannot hold focus — the browser blurs the input the instant the `disabled` attribute is added.
4. When `pending` flips back to `false`, React reconciles the same DOM node from `disabled=true` to `disabled=false`. The input is again enabled, but **focus is not automatically restored**. `autoFocus` is a mount-only attribute and does not re-fire on the disabled→enabled transition.
5. The user must therefore click into the input to refocus before typing. This matches the observed symptom exactly — a truly-still-disabled input would not respond to a click at all (a click on a `disabled` input is a no-op per spec).

**Concrete exposure.** Every turn after the first carries this friction: the user sends a message, the input blurs while the system replies, and on receipt the user must click before continuing. Compounds with WCAG 2.4.3 (Focus Order) — keyboard-only and assistive-tech users experience it as a navigation discontinuity on every turn rather than a continuous typing flow.

**Reconciliation target.** Surgical fix in `MessageInput.jsx` only — add `useRef` for the input element and a `useEffect` keyed on `[pending, terminal]` that calls `inputRef.current?.focus()` when both are false. Four edits, single file. RULE-06 boundary: D31 surface limited to input-box auto-focus restoration; broader focus-management work (e.g., focusing a transcript-end live-region for screen-reader announcements on response receipt) surfaces as separate build-discoveries (D32+) and defers to a future cycle. Tracked in WO-306.4.a.

**Status.** Reconciled (Session 306.4, intake-triager `a4a3622`).

---

### D32 — TAKEAWAY block template body font drift (20pt template, 16pt deck reality)

| Field      | Value                                                                          |
| ---------- | ------------------------------------------------------------------------------ |
| Severity   | MINOR (cosmetic / template hygiene — body font drift; no behavioral impact)    |
| Phase      | Phase 9.E (surfaced during Cycle 306 Implementing-deck enrichment pass)        |
| Discovered | Cycle 306, Session 306.5                                                       |
| Status     | Reconciled (template fix applied in WO-307.1a — born Reconciled)               |

**Discovery.** The TAKEAWAY block template at `.tmp/takeaway-block-template.xml` (extracted Session 306.3 from Mgmt-deck slide 29 sp[5] + sp[6]) was authored with body font `sz="2000"` (20pt). During the Cycle 306 Implementing-deck universal-TAKEAWAY adoption pass (WO-306.3c through WO-306.5g; 33 of 35 in-scope slides), Sam intervened in PowerPoint to reduce the body font from 20pt to 16pt to fit the available bottom-band geometry. Subsequent WOs that referenced the template implicitly carried the 20pt size in their as-authored form — but the deck reality (post-Sam-intervention) is 16pt. The template and the deck disagreed.

**Concrete exposure.** Any future TAKEAWAY-block dispatch consuming the template verbatim — e.g., the planned Cycle 307 OBJ-3 dense-slide WO (slides 4 and 35) — would re-introduce 20pt body text and break deck-wide font consistency. The OOXML-semantic gate does not catch font-size drift; the divergence surfaces only at visual QA.

**Reconciliation target.** Update the body `<p:sp>` `sz` attributes from `2000` to `1600` in `.tmp/takeaway-block-template.xml`. Kicker `<p:sp>` unchanged. Single-file edit; born Reconciled in the same WO that logs the discovery, matching the D29 precedent. **Durability caveat:** the template is gitignored under the `.tmp/` convention; D.1's correction lives on the executor's working copy only. Any future workstation or fresh clone consuming the template would either need to re-extract from the deck or use a tracked-template artifact. A canonical-home decision for the template — stay local, force-add, or relocate to `products/hopper/engineering/templates/` — surfaces as a separate Cycle 308+ candidate. A separable STD-13 RULE-10 amendment candidate — requiring template-vs-deck font-size verification at WO-authoring time — also remains as a Cycle 308+ process-closure item per the 307.1 checkpoint D32 disposition.

**Status.** Reconciled on the executor's working copy (Cycle 307, Session 307.1 — template body font corrected to `sz="1600"` in WO-307.1a D.1). Durability follow-up tracked as a separate backlog candidate.

---

### D33 — PowerPoint Compare deprecated by Microsoft; PPTX-WO visual-diff workflow shifts to XML-diff default

| Field      | Value                                                                          |
| ---------- | ------------------------------------------------------------------------------ |
| Severity   | MINOR (process / tooling — vendor-side deprecation of an optional QA path)     |
| Phase      | Phase 9.E (surfaced during Cycle 307 closure-trio review)                      |
| Discovered | Cycle 307, Session 307.5                                                       |
| Status     | Open (codification deferred to Cycle 308+ per IP-launch theme)                 |

**Discovery.** Microsoft has deprecated the PowerPoint Compare feature in current Microsoft 365 builds. PPTX-WO discipline documentation (e.g., the WO-306.3a–WO-306.5g lineage and STD-13 RULE-10 verification clauses) references PowerPoint Compare as an optional visual-diff QA path alongside the canonical unpack-and-XML-diff workflow. With Compare deprecated, the canonical path collapses to a single workflow: unpack → diff XML → repack → `soffice` PDF render → `pdftoppm` JPEG QA (and/or PowerPoint COM PNG render at execution time). The optional Compare path no longer exists; references to it in process docs are now stale.

**Concrete exposure.** Any future PPTX-WO that cites PowerPoint Compare as an acceptable verification step would direct an executor toward an unavailable tool. The workflow itself is robust (unpack-and-XML-diff is the default path in WO-306.3a forward and was exercised cleanly through WO-307.5a), but the discipline documentation carries stale references.

**Reconciliation target.** Documentation refresh, not workflow change. Update STD-13 RULE-10 verification clauses and any PPTX-WO discipline references to remove PowerPoint Compare callouts; affirm unpack-and-XML-diff + COM PNG render as the sole canonical visual-QA path. Single-WO scope when prioritized; no urgent action required because the workflow itself was already operating on the canonical path. Tracked as a Cycle 308+ codification candidate per IP-launch theme separation in Cycle 307.

**Status.** Open. Codification deferred to Cycle 308+.

---

### D34 — WO-drafting paragraph-index dual-form spec causes reader index drift

| Field      | Value                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| Severity   | MINOR (WO authoring discipline — caught at pre-flight; no execution defect; one-line spec amendment)   |
| Phase      | Phase 9.E (surfaced during Cycle 307 Session 307.5 WO-307.5a execution)                                |
| Discovered | Cycle 307, Session 307.5                                                                               |
| Status     | Open (STD-13 RULE-10 amendment candidate deferred to Cycle 308+)                                       |

**Discovery.** WO-307.5a (slides 4 + 35 universal-TAKEAWAY closure) specified each target paragraph in two forms — ordinal natural-language ("11th `<a:p>` element") AND 0-indexed bracket notation ("a:p[10]; 0-indexed"). The two forms were internally consistent (11th = a:p[10]) but the dual specification caused Claude Code at Pre-flight C to read the ordinal numbers as if they were 0-indexed indices, producing an off-by-one halt: WO said "delete a:p[25, 26, 27]" while reality had paragraphs 0–26 inclusive (27 did not exist); WO said "delete a:p[11]" while reality had paragraphs 0–10 inclusive (11 did not exist). The text-content guards in the WO ("delete the paragraph whose `<a:t>` reads `Three tables you'll always have...`") were unambiguous and protected against the wrong deletion. Pre-flight C correctly halted; owner ruled Option 2 (text-anchored deletion); execution proceeded clean.

**Concrete exposure.** Future PPTX-WOs that specify paragraph indices in dual ordinal-plus-bracket form risk the same reader-index-drift halt. The text-content guard is robust (every target was correctly anchored to its `<a:t>` content), so the practical risk is a pre-flight halt + owner ruling round-trip — not a deletion at the wrong index. The cost is one pre-flight cycle per affected WO, not a content-integrity defect.

**Reconciliation target.** STD-13 RULE-10 amendment candidate: specify paragraph indices in ONE form only — 0-indexed bracket notation `a:p[N]`. Ordinal natural-language ("11th paragraph", "first element", "last child") is prohibited in deletion specifications. Text-content guards (verbatim `<a:t>` substring) remain required as the primary contract. Scope: one-line spec amendment in STD-13 RULE-10 verification clauses; no retroactive WO edits. Tracked as a Cycle 308+ codification candidate per IP-launch theme separation in Cycle 307.

**Status.** Open. STD-13 RULE-10 amendment deferred to Cycle 308+.

---

### D35 — Vite `build.outDir` relative path is anchored to `root`, not repo root; build-log path string is misleading

| Field      | Value                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------ |
| Severity   | MINOR (build-time semantic; correctly resolved; risk is reader misinterpretation only)           |
| Phase      | Phase 9.G (surfaced during Cycle 310 Session 310.8 WO-310.8a Render-deploy hardening pass)       |
| Discovered | Cycle 310, Session 310.8                                                                         |
| Status     | Reconciled (documented in `src/backend/app.js` DIST_DIR comment + this D-item)                   |

**Discovery.** WO-310.8a Edit 2 introduces a production static-serving block in `src/backend/app.js` that resolves the built-frontend directory via `path.resolve(__dirname, '../../dist')` — relative to `src/backend/`, that resolves to `intake-triager/dist/`. At verification time, `npm run build` (Vite) printed its output paths as `../../dist/index.html` and `../../dist/assets/...`. Those path strings are relative to Vite's configured `root: 'src/frontend'` (set in `vite.config.js`), not relative to the repo root or the build's CWD. From `src/frontend/`, `../../dist` resolves to `intake-triager/dist/` — the same location the backend's DIST_DIR resolves to. Both ends of the contract land in the same place, but the build-log path string reads as if the bundle is being written two levels above the repo (into `hopper/dist/`). Confirming the actual landing required `ls intake-triager/dist/` and inspecting `vite.config.js`.

**Concrete exposure.** A future engineer debugging a production-deploy 404 on `/` (Express returning `Cannot GET /` instead of the SPA index) might trust the Vite log line and look for `dist/` two levels up from intake-triager, conclude the path math in `app.js` is wrong, and "fix" it in the wrong direction — moving DIST_DIR off the actual bundle location and breaking the deploy. The risk is misdirection, not a current defect.

**Reconciliation target.** Documentation-only. The `app.js` comment block introduced by WO-310.8a Edit 2 already documents the math ("Vite builds the React frontend to `<repo-root>/dist/`. From `src/backend/`, that is two levels up. Resolved once at module load."). This D-item supplements that comment with the Vite-side context — that `build.outDir` is anchored to the configured `root`, not the repo root, and that the build-log paths read accordingly. No code change required; understanding both sides of the contract is the reconciliation. **Optional codification candidate** (Cycle 311+): add a one-line comment to `vite.config.js` explaining the `outDir` relative-to-root convention so the Vite side carries the same context as the Express side.

**Status.** Reconciled at discovery (no defect; documentation now exists on both sides of the contract). Optional `vite.config.js` comment addition deferred to Cycle 311+ as a backlog candidate.

---

### D36 — Same-origin CORS verification path used in WO-310.8a local validation

| Field      | Value                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------ |
| Severity   | MINOR (operational note; matches pre-identified WO discovery risk #5)                            |
| Phase      | Phase 9.G (surfaced during Cycle 310 Session 310.8 WO-310.8a local verification)                 |
| Discovered | Cycle 310, Session 310.8                                                                         |
| Status     | Open (full cross-origin verification deferred to first hosted-deploy smoke test)                 |

**Discovery.** Once `NODE_ENV=production` and the Express server serves the built SPA from the same port that handles `/converse`, the production posture is same-origin: the browser fetches `/converse` from the same host that served the SPA, so the request carries no `Origin` header (or carries one matching `Host`, depending on browser) and the CORS middleware's allow-list is not consulted on the hot path. Local verification at WO-310.8a Edit 2 used plain `curl` without an explicit `-H "Origin: ..."` header — equivalent to same-origin, exercising the static-serve + catch-all + `/converse` route precedence but NOT exercising `CORS_ALLOWED_ORIGINS` enforcement. That gap is by design: the WO's pre-identified discovery risk #5 anticipated it and asked that the verification path used be logged here.

**Concrete exposure.** Two follow-on verifications remain unexercised by local WO-310.8a execution and must be confirmed in the hosted-deploy runbook:

1. **Cross-origin reject** — from an explicit foreign origin (e.g., `curl -H "Origin: https://evil.example.com" -X POST https://intake-triager.onrender.com/converse`), the CORS middleware should reject the response without CORS headers. Verify the first time the service is live on Render.
2. **DNS-cutover re-allow** — when Cycle 311 cuts DNS to `demo.restaurantpattern.com`, the `CORS_ALLOWED_ORIGINS` env var must be updated to the new public host (via Render dashboard, since the render.yaml value is overridden at runtime). If missed, the production SPA on the new host would be served same-origin (no CORS check) but any cross-origin client tooling would silently break.

**Reconciliation target.** Capture both verifications in the 310.8 checkpoint Runbook section as post-deploy smoke-test items. No code change required — the CORS middleware is already in place and exercised by the unit suite (`test/cors.test.js`, 9 tests). The gap is purely the integration-level cross-origin path, which is testable only against the running service.

**Status.** Open. Verification deferred to the first hosted-deploy smoke test (310.8 runbook scope, not this WO).

---

_Last updated: 2026-05-23 — Cycle 310, Session 310.8 (D35 + D36 logged at WO-310.8a; D37 logged at WO-310.8b)._

---

### D37 — Render build environment inherits `NODE_ENV=production`; `npm install` skips `devDependencies`; Vite build fails with exit 127

| Field    | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Severity | MAJOR (blocks first deploy; trivial to fix once root cause known)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Phase    | Cycle 310, Session 310.8, Render first-deploy (post-WO-310.8a)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Observed | First Render deploy of the `intake-triager` Web Service failed at the build step with exit 127. Log excerpt: `sh: 1: vite: not found` immediately after `npm install` reported `added 119 packages`. Subsequent `npm run build` invoked `vite build`; `vite` was not present in `node_modules/.bin/`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Root cause | `render.yaml` sets `NODE_ENV: production` as a service env var. Render's build environment inherits service env vars at build time. With `NODE_ENV=production` in scope, npm's documented behavior is to skip `devDependencies` during `npm install`. `vite`, `@vitejs/plugin-react`, `vitest`, and `concurrently` are correctly classified as `devDependencies` in `package.json` (they are build-time / test-time tools, not runtime dependencies). The skip removed them from the install set; the subsequent `vite build` had nothing to invoke.                                                                                                                                                                                                                                              |
| Decision | Three options evaluated. (A) `--include=dev` flag on buildCommand `npm install` — selected. (B) Move `vite` + `@vitejs/plugin-react` to `dependencies` — rejected; misclassifies build tools as runtime deps. (C) Override `NODE_ENV` via Render dashboard at build time — rejected; breaks IaC single-source-of-truth. Option A preserves semantic correctness (dev deps stay dev deps; `NODE_ENV=production` stays correct at runtime where `app.js` gates the static-serving block on it), keeps the fix in the IaC blueprint next to the env var that caused the problem, and is self-documenting.                                                                                                                                                                                              |
| Fix | WO-310.8b Edit 1 — `render.yaml` buildCommand: `npm install` → `npm install --include=dev`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Verification | Render auto-deploy on `main` post-merge of WO-310.8b commit. Build log shows `npm install --include=dev` resolves `vite`; `vite build` succeeds; `dist/` is emitted; `npm start` boots `server.js`; structured log emits `server_listening` on the Render-injected PORT.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Prevention | Going forward, any Render Web Service blueprint that (a) sets `NODE_ENV=production` AND (b) depends on a `devDependencies` build tool MUST include `--include=dev` (or `--production=false`) in the build command. This applies to every future Hopper-generated SaaS product that uses Vite, webpack, esbuild, or any other build-tool-as-dev-dep pattern.                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Status | Reconciled at WO-310.8b merge to `intake-triager/main`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

---

_Last updated: 2026-05-23 — Cycle 310, Session 310.8 (D35 + D36 + D37 + D38 logged)._

---

### D38 — Frontend `BACKEND_URL` hardcoded to `http://localhost:3000`; baked into the Vite build; production SPA fetches from the user's own localhost (`net::ERR_CONNECTION_REFUSED`)

| Field    | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Severity | MAJOR (blocked first successful end-to-end smoke test; trivial to fix once root cause known)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Phase    | Cycle 310, Session 310.8, first end-to-end smoke test against `https://intake-triager.onrender.com` (post-WO-310.8b deploy)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Observed | SPA loaded at `https://intake-triager.onrender.com/`; user submitted a turn; UI surfaced the generic frontend error `"we had a problem recording this — please try again"`. DevTools Network tab showed two failed `converse` rows (one `preflight`, one `fetch`). DevTools Headers panel: Request URL `http://localhost:3000/converse`. DevTools Console: `POST http://localhost:3000/converse net::ERR_CONNECTION_REFUSED`.                                                                                                                                                                                                                                                                                                                                                                |
| Root cause | `src/frontend/components/App.jsx` line 21 hardcoded `const BACKEND_URL = 'http://localhost:3000/converse';`. Vite baked this absolute URL into the JavaScript bundle at build time. From a user's browser, `fetch('http://localhost:3000/converse')` targets **the user's own machine**, not the production backend. The pre-existing comment block in App.jsx (lines 14–18) explicitly flagged the value as "hardcoded for the teaching artifact" and offered two prod paths (Vite env var or same-origin reverse-proxy) — those paths were never implemented before deploy because WO-310.8a's hardening audit was scoped to backend files only. The frontend URL constant slipped through.                                                                                            |
| Decision | Two options evaluated. (A) Relative URL `'/converse'` + Vite `server.proxy` for dev — selected. (B) `VITE_BACKEND_URL` env var — rejected; adds three moving parts (`.env.example`, `render.yaml`, build pipeline), introduces cross-origin CORS handling on the hot path. Option A honors WO-310.8a's same-origin architecture, preserves the existing dev workflow exactly (concurrently still launches Vite + Express; only the request path inside `npm run dev` changes from direct Express hit to proxy hop), and converts cleanly to Option B in any future cycle that splits the frontend off as a separate service.                                                                                                                                                                |
| Fix | WO-310.8c Edit 1 — App.jsx `BACKEND_URL` → `'/converse'`; refresh stale prod-options comment. Edit 2 — `vite.config.js` add `server.proxy` block. Edit 3 — this entry.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Verification | Render auto-deploy on `main` post-merge of WO-310.8c. Build green, deploy Live. Browser at `https://intake-triager.onrender.com` submits a turn; DevTools Network shows one `converse` row at status 200 with Request URL `https://intake-triager.onrender.com/converse` (same-origin; no preflight). Local dev: `npm run dev` launches Vite (5173) + Express (3000); browser at `http://localhost:5173` submits a turn; Vite proxies `/converse` to `http://localhost:3000/converse`; round-trip green.                                                                                                                                                                                                                                                                                       |
| Prevention | Going forward, any Hopper-generated SaaS product that runs a separated frontend dev server (Vite, webpack-dev-server, etc.) on one port + a backend on another port MUST default to **relative URLs in client code + a dev-server proxy block** rather than hardcoded absolute URLs. The "hardcoded for the teaching artifact" pattern is acceptable for early-phase build artifacts but MUST be resolved before any hosted-deploy WO closes. Future hardening WOs (analog of WO-310.8a) must add a `Select-String` audit step for hardcoded `localhost:` strings across the frontend tree as part of their pre-deploy inventory.                                                                                                                                                                |
| Status | Reconciled at WO-310.8c merge to `intake-triager/main`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

---

_Last updated: 2026-05-23 — Cycle 310, Session 310.8 (D35 + D36 + D37 + D38 + D39 logged)._

---

### D39 — Render Postgres provisioned empty by `render.yaml`; `src/db/schema.sql` never applied; first `/converse` turn returns 500 `INTERNAL_ERROR` with log `relation "conversations" does not exist`

| Field    | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Severity | MAJOR (production demo non-functional; trivial to fix once root cause known)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Phase    | Cycle 310, Session 310.8, first successful end-to-end same-origin request against `https://intake-triager.onrender.com` (post-WO-310.8c deploy)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Observed | UI surfaced `"we had a problem recording this — please try again"`. DevTools Network: one `converse` row at status **500** (same-origin; zero preflight rows — D38 fix confirmed working). Response body: `{"error":{"code":"INTERNAL_ERROR","message":"we had a problem recording this — please try again"}}`. Render logs surfaced the structured error event: `{level:'error', event:'converse_handler_error', conversation_id:null, owner_id:'00000000-0000-0000-0000-000000000001', error:'relation "conversations" does not exist'}`. Three identical errors logged across three test turns.                                                                                                                                                                                                                                                                                                                                                                                       |
| Root cause | Render's Blueprint provisioning created the Postgres instance `intake-triager-db` cleanly, but `src/db/schema.sql` was never applied to it. The Cycle 303 build comment in `schema.sql` itself acknowledges the gap: "To provision a fresh database: `psql $DATABASE_URL -f src/db/schema.sql`" — assumed manual operator action against `$DATABASE_URL`. Local dev environments always had a developer available to run that command (or one of the PowerShell helpers `run-migrations.ps1` / `reset-dev-db.ps1`). On Render's Linux runtime, no equivalent operator step exists in the deploy pipeline. WO-310.8a's hardening audit was scoped to env-var hygiene + URL configuration + build-pipeline; database-bootstrap was a parallel gap not in audit scope.                                                                                                                                                                                                                       |
| Decision | Four options evaluated. (A) Idempotent boot-time bootstrap module called from server.js — selected. (B) Manual one-time `psql` via Render Shell — rejected; reintroduces operator burden on every Postgres recreation. (C) Render `preDeployCommand` — rejected; requires paid plan. (D) Bake bootstrap script into `npm start` chain — rejected; splits boot across two processes, breaks structured-log continuity. Option A is GOLD because it honors gold-vision v1.5 §11 (no migration tooling: bootstrap is single-shot apply of schema.sql guarded by an existence check, with no version table / ordering / rollback), is idempotent (cheap `pg_tables` check on every spin-up), survives free-tier realities (15-min spin-down, 90-day Postgres recreation), and co-locates bootstrap with the existing boot sequence in server.js (required-env validation lives there too).                                                                                                       |
| Fix | WO-310.8d Edit 1 — create `src/db/bootstrap-schema.js`. Edit 2 — server.js calls `bootstrapSchema()` after required-env validation, before `app.listen()`; structured-log `bootstrap_applied` / `bootstrap_skipped` / `bootstrap_failed` events emitted per outcome. Edit 3 — this entry.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Verification | Render auto-deploy on `main` post-merge of WO-310.8d. First spin-up post-deploy emits `bootstrap_applied` (schema absent on the existing empty `intake-triager-db`); subsequent spin-ups emit `bootstrap_skipped` with `reason: 'schema_already_applied'`. Browser at `https://intake-triager.onrender.com` submits a real turn; response status 200; conversation persists across follow-up turns. Render Logs tab confirms zero `converse_handler_error` events with `relation "conversations" does not exist`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Prevention | Going forward, any Hopper-generated SaaS product whose first hosted-deploy WO covers backend hardening MUST include a database-bootstrap inventory check: "where does the schema come from at production boot, and is the path automatic or manual?" If manual (operator-driven), promote bootstrap automation into the hardening WO. The "comments say `psql -f`" pattern is acceptable for early-phase build artifacts but MUST be resolved before any hosted-deploy WO closes. WO-310.8a-class audits going forward must include `Select-String` for `psql -f` and similar manual-bootstrap hints across the deployed code tree.                                                                                                                                                                                                                                                                                                                                                       |
| Status | Reconciled at WO-310.8d merge to `intake-triager/main`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

---

_Last updated: 2026-05-23 — Cycle 310, Session 310.8 (D35 + D36 + D37 + D38 + D39 logged)._
