import { defineConfig } from 'vitest/config';

// Vitest configuration for the Intake Triager test suite.
// Per intake-triager-gold-vision.md v1.5 §4 *Required dependencies* (Vitest)
// and §11 *Non-goals* (frontend unit tests out of scope; backend unit tests
// land at Phase 3+ for Expediter, handlers, prompt-assembler).

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.js'],
    reporters: ['default'],
  },
});
