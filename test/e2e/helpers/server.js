// Test server lifecycle for Phase 8 E2E (per WO-304.1.a).
// Starts the app on an ephemeral port (PORT=0); returns base URL +
// close fn. Tests fetch against base URL and call close() in afterAll.

import app from '../../../src/backend/app.js';

export async function startTestServer() {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({
        baseUrl: `http://127.0.0.1:${port}`,
        close: () =>
          new Promise((res, rej) =>
            server.close((err) => (err ? rej(err) : res()))
          ),
      });
    });
    server.on('error', reject);
  });
}
