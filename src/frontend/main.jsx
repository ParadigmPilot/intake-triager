// React entry. Loaded by index.html as a module script.
// Per intake-triager-gold-vision.md v1.5 §4 Restaurant map (line 115),
// the Dining Room root is App.jsx; this file does nothing but mount it.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
