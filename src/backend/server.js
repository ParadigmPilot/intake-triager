// Server bootstrap — calls app.listen().
//
// Per WO-304.1.a (Phase 8 E2E infrastructure): app.js exports the
// configured Express app without side-effects so tests can import it
// without auto-starting a listener. server.js owns the listen call.
//
// Per WO-305.2.a (D18 reconciliation, Cycle 305): boot-time validation
// of trusted-context placeholders ORG_NAME and CRISIS_LINE per gold
// vision v1.7 §10 Configuration. Both flow through
// prompt-assembler.js's substitute() via String(value), which converts
// undefined to the literal "undefined" and writes it into the system
// prompt's [CONTEXT] block. Rule 7 (crisis-end) surfaces
// {{CRISIS_LINE}} to the patron; without this fail-fast, a
// misconfigured deployment silently emits "Crisis resource line:
// undefined" to an employee in crisis.
//
// Boot log emitted via observability.log per gold vision §10
// (WO-304.2.0).

import 'dotenv/config';
import app from './app.js';
import { log } from './observability.js';
import { bootstrapSchema } from '../db/bootstrap-schema.js';

const REQUIRED_ENV = [
  'ORG_NAME',
  'CRISIS_LINE',
  'RESEND_API_KEY',
  'RESEND_FROM_ADDRESS',
  'MAGIC_LINK_SECRET',
];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  log({
    level: 'error',
    event: 'config_invalid',
    error: `Required environment variable${missing.length > 1 ? 's' : ''} unset or empty: ${missing.join(', ')}`,
  });
  process.exit(1);
}

// Idempotent schema bootstrap. Applies src/db/schema.sql when the
// `conversations` table is absent; no-ops otherwise. Honors gold-vision
// v1.5 §11 (migration tooling remains a non-goal — this is bootstrap, not
// migration). WO-310.8d / D39 reconciliation.
try {
  const result = await bootstrapSchema();
  if (result.applied) {
    log({ level: 'info', event: 'bootstrap_applied' });
  } else {
    log({ level: 'info', event: 'bootstrap_skipped', reason: result.reason });
  }
} catch (err) {
  log({ level: 'error', event: 'bootstrap_failed', error: err.message });
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  log({ level: 'info', event: 'server_listening', port: Number(PORT) });
});
