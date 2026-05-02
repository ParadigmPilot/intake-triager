// Server bootstrap — calls app.listen().
//
// Per WO-304.1.a (Phase 8 E2E infrastructure): app.js exports the
// configured Express app without side-effects so tests can import it
// without auto-starting a listener. server.js owns the listen call.
//
// Boot log emitted via observability.log per gold vision §10
// (WO-304.2.0).

import 'dotenv/config';
import app from './app.js';
import { log } from './observability.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  log({ level: 'info', event: 'server_listening', port: Number(PORT) });
});
