// Phase 0 placeholder — full Express bootstrap (mounts middleware and routes)
// lands at Phase 6 (The Pass). Per intake-triager-gold-vision.md v1.5 §4.

import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`[backend] listening on port ${PORT}`);
});
