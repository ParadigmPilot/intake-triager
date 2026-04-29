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
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
});
