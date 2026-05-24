import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the Intake Triager frontend.
// Per intake-triager-gold-vision.md v1.5 §4 *Repo structure*:
//   - index.html lives at src/frontend/index.html (not repo root)
//   - Vite root is set accordingly so module resolution works
// Per Phase 0 gate: Vite serves on :5173.

export default defineConfig({
  root: 'src/frontend',
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    // Dev-only: route /converse from Vite (5173) to Express (3000). In
    // production, Express serves the built SPA + the API at the same
    // origin (WO-310.8a), so this proxy is irrelevant. Per WO-310.8c.
    proxy: {
      '/converse': 'http://localhost:3000',
    },
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
});
