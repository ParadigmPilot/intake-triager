import { defineConfig } from 'vitest/config';
import { config as loadEnv } from 'dotenv';

// Phase 8 E2E config (per WO-304.1.a).
// Loads .env.test with override BEFORE any test imports app code so the
// test DB URL and E2E_TEMPERATURE=0 take effect over any pre-existing
// process.env values from .env. Without override:true, dev DATABASE_URL
// would leak into the test process and tests would destroy dev data.
// Longer hookTimeout/testTimeout to allow real Anthropic SDK calls.

loadEnv({ path: '.env.test', override: true });

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/e2e/**/*.test.js'],
    reporters: ['default'],
    hookTimeout: 30_000,
    testTimeout: 60_000,
  },
});
