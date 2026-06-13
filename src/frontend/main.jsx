// React entry. Loaded by index.html as a module script.
// Per WO-315.3a: the Dining Room is mounted via mountApp (./mount-app.jsx),
// which constructs intake-triager's own substrate, injects the stream into
// App, and returns it. The pure entry ignores the return value — a standalone
// intake-triager clone drives its substrate but exposes it to no overlay.
// Composition (subscribing the overlay) happens only at the hopper publish
// layer, never here (P-9: cloneable source stays overlay-free).

import { mountApp } from './mount-app.jsx';

mountApp(document.getElementById('root'));
