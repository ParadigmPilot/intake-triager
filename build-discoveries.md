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

| ID    | Severity | Phase   | Discovered  | Status | Title                                                              |
| ----- | -------- | ------- | ----------- | ------ | ------------------------------------------------------------------ |
| D1    | MINOR    | Phase 2 | Cycle 303.3 | Open   | WO-303.3a smoke-test ESM `import` uses bare Windows path           |
| D2    | MINOR    | Phase 2 | Cycle 303.3 | Open   | WO-303.3a Success Criteria says "ten checks"; smoke test runs eleven |
| D3    | MINOR    | Phase 3 | Cycle 303.3 | Open   | Gold vision silent on per-call `max_tokens` for Chef               |

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

_Last updated: 2026-04-29 — Cycle 303, Session 303.3._
