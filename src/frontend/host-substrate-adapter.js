// src/frontend/host-substrate-adapter.js
//
// Host substrate adapter (WO-316.1a).
//
// Wraps intake-triager's LIVE event stream + canon manifests into the
// { subscribe, loadManifest } shape the pattern-in-motion overlay consumes
// (A2 read-only-consumer contract; overlay CONTRACT.md / SIGNATURES.md).
// Mirrors the overlay's example/mock-substrate.js host-bound wrapper, but
// sourced from host canon (src/substrate/manifests) rather than a fixture.
//
// A2 contract surface satisfied:
//   - subscribe(callback): pass-through to the live EventStream.subscribe;
//     delivers { type, stepId, timestamp } step events; returns the
//     unsubscribe function unchanged.
//   - loadManifest(stepId): one-argument wrapper resolving the seven-field
//     host manifest for stepId from host canon (D-WS1-6), by closing over the
//     host per-state manifest dictionary.
//
// Host-pure: imports ONLY from ../substrate/* — never the overlay. Overlay
// composition lives entirely on the consumer's side of the A2 contract (P-9:
// the cloneable source stays overlay-free). No JSX, no CSS, no design tokens.

import { loadManifest } from '../substrate/index.js';
import { manifests } from '../substrate/manifests/index.js';

/**
 * Adapt a live host event stream into the overlay's read-only consumer shape.
 *
 * @param {import('../substrate/event-stream.js').EventStream} stream - The live
 *   event stream from `createEventStream(createStateMachine())`.
 * @returns {Readonly<{
 *   subscribe: (callback: (event: import('../substrate/event-stream.js').StepEvent) => void) => (() => void),
 *   loadManifest: (stepId: string) => Readonly<import('../substrate/manifest-loader.js').Manifest>,
 * }>} A frozen `{ subscribe, loadManifest }` facade bound to the live stream
 *   and host canon manifests.
 * @throws {Error} If `stream` is falsy or does not expose a `subscribe` function.
 */
export function createHostSubstrate(stream) {
  if (!stream || typeof stream.subscribe !== 'function') {
    throw new Error(
      'createHostSubstrate: requires an event stream exposing subscribe',
    );
  }

  return Object.freeze({
    subscribe: (callback) => stream.subscribe(callback),
    loadManifest: (stepId) => loadManifest(stepId, manifests),
  });
}
