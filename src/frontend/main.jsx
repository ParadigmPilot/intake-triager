// React entry. Loaded by index.html as a module script.
//
// Per WO-316.2a: the composed view (host + Pattern-in-Motion overlay) is the
// app entry. main.jsx mounts <ComposedView> via mountComposedView
// (./composed-view.jsx), which constructs intake-triager's own substrate,
// subscribes the overlay to it, drives the six Service steps from App's real
// turn, and renders the header + Trace + ManualOverlay around <App>.
//
// The overlay is imported ONLY inside composed-view.jsx (P-9 / A2): main.jsx
// imports the seam, not the overlay. The bare-host mount (mount-app.jsx) stays
// overlay-free for a standalone intake-triager clone.

import { mountComposedView } from './composed-view.jsx';

mountComposedView(document.getElementById('root'));
