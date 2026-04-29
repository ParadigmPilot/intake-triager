-- Intake Triager — Database Schema
-- Per intake-triager-gold-vision.md v1.5 §9 *Data contract* and
-- §10 *Security floor* item 10 (owner_id discipline).
--
-- To provision a fresh database:
--   psql $DATABASE_URL -f src/db/schema.sql
--
-- migrations/001-initial.sql is byte-for-byte identical to this file
-- per §9 and exists as the seed for future migrations. Until migration
-- tooling lands (taught in *Implementing Standards for LLM Apps* per
-- §11 *Non-goals*), only schema.sql is run.
--
-- Single-tenant by design; multi-tenant isolation is taught in
-- *Implementing Standards for LLM Apps* per §11.

-- =====================================================================
-- conversations — one row per intake
-- =====================================================================
CREATE TABLE conversations (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id    UUID         NOT NULL,
    status      TEXT         NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','complete','escalated','abandoned')),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- =====================================================================
-- messages — append-only by convention; no DDL trigger blocks UPDATE/DELETE
-- =====================================================================
CREATE TABLE messages (
    id               BIGSERIAL    PRIMARY KEY,
    conversation_id  UUID         NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    owner_id         UUID         NOT NULL,
    role             TEXT         NOT NULL
                       CHECK (role IN ('user','assistant','system')),
    content          TEXT         NOT NULL,
    token_usage      JSONB,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation_created
    ON messages (conversation_id, created_at);

-- =====================================================================
-- triage_records — one row per completed intake
-- UNIQUE (conversation_id) enforces "one record per conversation" per §9.
-- =====================================================================
CREATE TABLE triage_records (
    id                     BIGSERIAL    PRIMARY KEY,
    conversation_id        UUID         NOT NULL REFERENCES conversations(id),
    owner_id               UUID         NOT NULL,
    severity               TEXT         NOT NULL
                             CHECK (severity IN ('low','medium','high','urgent')),
    category               TEXT         NOT NULL
                             CHECK (category IN (
                               'interpersonal_conflict',
                               'harassment_or_discrimination',
                               'policy_violation',
                               'safety_concern',
                               'working_conditions',
                               'management_issue',
                               'retaliation',
                               'other'
                             )),
    suggested_owner        TEXT         NOT NULL
                             CHECK (suggested_owner IN (
                               'HR_Partner',
                               'Legal',
                               'Compliance',
                               'Manager_Chain',
                               'Executive'
                             )),
    required_timeline      TEXT         NOT NULL
                             CHECK (required_timeline IN (
                               'immediate',
                               '48_hours',
                               '1_week',
                               '2_weeks',
                               'standard'
                             )),
    summary                TEXT         NOT NULL
                             CHECK (length(summary) <= 160),
    escalation_flag        BOOLEAN      NOT NULL DEFAULT false,
    confidentiality_level  TEXT         NOT NULL DEFAULT 'standard'
                             CHECK (confidentiality_level IN (
                               'standard',
                               'sensitive',
                               'executive_only'
                             )),
    anonymous              BOOLEAN      NOT NULL DEFAULT false,
    raw_marker             JSONB        NOT NULL,
    created_at             TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE (conversation_id)
);
