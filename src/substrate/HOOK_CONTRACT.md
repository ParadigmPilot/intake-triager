# Pattern-in-Motion Substrate — Hook Contract

> **Moved.** The canonical Pattern-in-Motion substrate contract now lives in the overlay repository:
>
> - **Contract:** [`pattern-in-motion-overlay/CONTRACT.md`](https://github.com/ParadigmPilot/pattern-in-motion-overlay/blob/main/CONTRACT.md)
> - **Per-export signatures:** [`pattern-in-motion-overlay/SIGNATURES.md`](https://github.com/ParadigmPilot/pattern-in-motion-overlay/blob/main/SIGNATURES.md)

The relocation was ratified at Cycle 313 breakout 313.3.a per [`decision-memo-contract-signatures-location.md`](https://github.com/ParadigmPilot/ServiceBridge/blob/main/products/hopper/project-management/cycles/313/decision-memo-contract-signatures-location.md) and the amended [`reference-implementation-vs-overlay-scoping-document.md`](https://github.com/ParadigmPilot/ServiceBridge/blob/main/products/hopper/project-management/cycles/312/reference-implementation-vs-overlay-scoping-document.md). The full pre-relocation contract content is preserved in this file's git history.

## For substrate implementers

JSDoc on the source files in this directory (`state-machine.js`, `event-stream.js`, `manifest-loader.js`, `content-validator.js`) remains the authoritative signature source. `pattern-in-motion-overlay/SIGNATURES.md` is a consumer-facing mirror of that JSDoc. When a public export's signature changes, update both in the same release cycle.
