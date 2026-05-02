// Server bootstrap — calls app.listen().
//
// Per WO-304.1.a (Phase 8 E2E infrastructure): app.js exports the
// configured Express app without side-effects so tests can import it
// without auto-starting a listener. server.js owns the listen call.

import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[backend] listening on port ${PORT}`);
});
