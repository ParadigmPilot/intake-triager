// The composed view — consumer-side composition seam (WO-316.2a).
//
// This is the SOLE importer of @paradigmpilot/pattern-in-motion-overlay in
// src/** (P-9 / A2): main.jsx mounts <ComposedView>, App.jsx and mount-app.jsx
// import nothing from the overlay. The cloneable host source stays overlay-free;
// composition lives entirely here, on the consumer's side of the A2 contract.
//
// It ports the composed view from the overlay's /example harness into
// intake-triager's own frontend, swapping the example's MOCK substrate for the
// REAL one: the host event stream drives the six Service steps from App's real
// turn lifecycle (createTurnDriver), the overlay reads the live stream through
// the host adapter (createHostSubstrate), and the Manual gate (createModeGate)
// paces the reveal so the learner walks steps 02-06 via App's Send control.
//
// ── Substrate construction (D1/D2) ───────────────────────────────────────
// Constructed ONCE at module scope (outside React, StrictMode-safe — no
// double-construction under StrictMode's double-invoke), exactly as
// mount-app.jsx constructs the host substrate. The state machine is held
// SEPARATELY from the event stream: the stream facade exposes only
// { startStep, endStep, subscribe } (no reset), but failure recovery must
// reset the machine — the driver opens plate_the_dish on turnSubmitted and
// assumes a CLEAN machine at the next turn (createTurnDriver JSDoc: "Failure
// handling (abort + reset) is the composition's job — it owns the state
// machine + gate"). Without the reset, a failed turn leaves plate_the_dish
// active and the next turnSubmitted throws "already active".
//
// One stream, shared three ways: passed to <App> as `substrate`, wrapped for
// the overlay via createHostSubstrate, and written by the driver. App, driver,
// and overlay all observe the same stream.

import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Trace,
  ManualOverlay,
  createModeGate,
  createTurnDriver,
} from '@paradigmpilot/pattern-in-motion-overlay';
import App from './components/App.jsx';
import { createHostSubstrate } from './host-substrate-adapter.js';
import { createStateMachine, createEventStream } from '../substrate/index.js';

// Overlay design tokens + the composed-view layout. The overlay's package
// `exports` map publishes only the JS barrel, so these CSS assets are pulled
// by relative path. Component CSS (Trace / ManualOverlay / Pill) is bundled
// transitively by the barrel import above. Zero new design tokens — every
// var(--*) resolves in the overlay token set already (Robin Malfait Rule).
import '../../node_modules/@paradigmpilot/pattern-in-motion-overlay/src/tokens.css';
import '../../node_modules/@paradigmpilot/pattern-in-motion-overlay/example/example.css';

// The six Service steps, in canonical order (mirrors substrate HOOK_CONTRACT).
const SERVICE_STEP_COUNT = 6;

// Construct the real substrate once, outside React. The machine reference is
// retained alongside the stream so onTurnFailed can reset it (see header note).
const machine = createStateMachine();
const stream = createEventStream(machine);
const hostSubstrate = createHostSubstrate(stream);

// Manual gate (D3): buffers the stream's events and releases one Service step
// per advance(), so the learner walks steps 02-06 via App's Send control —
// matching the /example composed view (Manual-only, D-WS2-1/8/12/13).
const gate = createModeGate(hostSubstrate, 'manual');

// Turn driver (D3): maps App's generic turn lifecycle onto the six step events.
// Writes to the raw stream (not the gate) — the gate observes the stream and
// paces the reveal downstream.
const driver = createTurnDriver(stream);

function ComposedView() {
  // Released (post-gate) events — drives the live render and the Event log.
  const [events, setEvents] = useState([]);
  // The walk is in progress (a turn has been submitted, not yet archived).
  const [started, setStarted] = useState(false);
  // The served answer prose, carried out of band from onTurnResponded (the
  // stream is sealed to events-only — A2 contract — so the reply rides here).
  const [replyProse, setReplyProse] = useState(null);
  // Whether any turn has been submitted yet — gates the idle welcome surface.
  const [everSubmitted, setEverSubmitted] = useState(false);
  // First-step release (mount-before-advance): the live Trace must be mounted
  // and subscribed before the gate releases step 01. Armed on submit; consumed
  // by the post-commit effect below.
  const [pendingFirstStep, setPendingFirstStep] = useState(false);
  // Remounts the live Trace per turn so step state starts clean.
  const [activeTurnKey, setActiveTurnKey] = useState(0);

  // Event log disclosure (BL-13). Non-modal: persists through the walk, toggled
  // from the line-2 button. Open by default on wide (fills the dock beside the
  // walk), closed on narrow.
  const [logOpen, setLogOpen] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(min-width: 64rem)').matches,
  );

  // The live step block snaps top-aligned on each advance (Zone 2).
  const liveBlockRef = useRef(null);

  // Subscribe the composed view to the gate (the released-event timeline). One
  // subscription for the lifetime of the view; gate is module-stable.
  useEffect(() => {
    const unsubscribe = gate.subscribe((event) => {
      setEvents((prev) => [...prev, event]);
    });
    return unsubscribe;
  }, []);

  const completedCount = events.filter((e) => e.type === 'step_ended').length;
  const turnComplete = started && completedCount >= SERVICE_STEP_COUNT;

  // serve_by_type reached (Step 05): the served answer is host-owned (D-WS2-27),
  // so the host renders the reply prose here as a normal assistant bubble.
  const atServe = events.some(
    (e) => e.type === 'step_started' && e.stepId === 'serve_by_type',
  );
  // stock_the_pantry reached (Step 06): the interim background signal.
  const atPantry = events.some(
    (e) => e.type === 'step_started' && e.stepId === 'stock_the_pantry',
  );

  // Mount-before-advance: release step 01 once the live block has subscribed.
  // One-shot per turn (flag-gated) so turn 2+ does not double-advance.
  useEffect(() => {
    if (!pendingFirstStep) return;
    gate.advance();
    setPendingFirstStep(false);
  }, [pendingFirstStep]);

  // Turn archived: when all six steps have ended, end the walk. started flips
  // false, which (a) unmounts the live block, (b) re-enables App's input
  // (controlsLocked clears), and (c) reveals the reply in App's transcript
  // (hideLatestAssistant clears). The machine self-returned to at_the_table
  // when stock_the_pantry ended, so only the gate/UI need clearing.
  useEffect(() => {
    if (!turnComplete) return;
    setStarted(false);
    setReplyProse(null);
    gate.reset();
    setEvents([]);
  }, [turnComplete]);

  // Snap-to-top: whenever a step is released the live block scrolls top-aligned
  // beneath the Title band. Guarded for non-DOM environments.
  useEffect(() => {
    if (!started) return;
    liveBlockRef.current?.scrollIntoView?.({ block: 'start' });
  }, [events.length, started]);

  // App turn lifecycle → six-step walk (D3). These run inside App.handleSend.
  // onTurnSubmitted opens the walk; onTurnResponded carries the served answer
  // and emits the back half; onTurnFailed unwinds.
  function onTurnSubmitted() {
    // Clear any stale buffer FIRST, then emit the fresh front half (take +
    // brief fully, plate opened) into the now-empty gate queue.
    gate.reset();
    setEvents([]);
    driver.turnSubmitted();
    setReplyProse(null);
    setEverSubmitted(true);
    setActiveTurnKey((k) => k + 1);
    setStarted(true);
    setPendingFirstStep(true);
  }

  function onTurnResponded(prose) {
    setReplyProse(prose);
    // Back half: plate ends (response-ready), then read + serve + stock fire.
    // Buffered by the Manual gate; revealed as the learner advances.
    driver.turnResponded();
  }

  function onTurnFailed() {
    // Unwind: reset the machine (closes the still-open plate_the_dish so the
    // next turn starts clean), drop the buffered backlog, and exit the walk.
    // App surfaces its own error banner.
    machine.reset();
    gate.reset();
    setEvents([]);
    setReplyProse(null);
    setPendingFirstStep(false);
    setStarted(false);
  }

  // Mid-turn Send (App asserts controlsLocked, so its Send press reports here
  // as onLockedSend rather than submitting): release the next Service step.
  function nextStep() {
    gate.advance();
  }

  return (
    <div className="composed-shell">
      <div className="composed">
        {/* Zone 1 — Title band. The host app name is the title (h1); the overlay
            announces itself in the subtitle beneath (title = host, subtitle =
            overlay applied). The line-2 sub-row hosts the Event log trigger. */}
        <div className="composed-head">
          <div className="composed-title">
            <h1>Intake Triager</h1>
            <div className="composed-subrow">
              <p className="composed-meta">
                <span className="composed-with">with</span>
                <span className="composed-badge">Pattern in Motion</span>
                <span className="composed-sep" aria-hidden="true">·</span>
                <span className="composed-preview">Preview</span>
              </p>
              <button
                className="log-trigger"
                onClick={() => setLogOpen((open) => !open)}
                aria-expanded={logOpen}
                aria-controls="event-log-panel"
              >
                Event log
              </button>
            </div>
          </div>
        </div>

        {/* Zones 2 + 3 — App owns transcript + input; the composer places them:
            transcript + banners ride the scroll region (Zone 2); the input pins
            to the .control-bar footer (Zone 3). Welcome + live-block are
            composer-owned and ride the scroll region above the transcript. App's
            render-prop returns a fragment, so .composed-scroll and the footer
            become direct flex children of .composed. */}
        <App
          substrate={stream}
          onTurnSubmitted={onTurnSubmitted}
          onTurnResponded={onTurnResponded}
          onTurnFailed={onTurnFailed}
          controlsLocked={started}
          onLockedSend={nextStep}
          hideLatestAssistant={started}
          formClassName="control-bar"
          inputClassName="intake-input"
        >
          {({ banners, transcript, footer }) => (
            <>
              <div className="composed-scroll">
                <div className="chat">
            {!everSubmitted && (
              <div className="composed-welcome">
                <h2 className="composed-welcome-title">
                  The six steps you don’t normally see
                </h2>
                <p className="composed-welcome-body">
                  Every LLM app turns your message into an answer. The Restaurant
                  Pattern is a way to see that work as six Service steps — the way
                  a kitchen turns an order into a finished plate. Normally you only
                  see the two ends: your message in, the answer out. That’s one{' '}
                  <em>turn</em>, and the six steps inside it stay hidden. This
                  overlay opens them up — describe an intake below, then walk the
                  turn one step at a time and study each one.
                </p>
              </div>
            )}

            {/* Live walk block (mounted only during the walk). The Trace owns the
                amber emphasis; the served answer below renders plain — the
                recognition beat (D-WS2-27). ManualOverlay teaches steps 01-04
                and renders nothing from serve_by_type on (host-owned answer). */}
            {started && (
              <div className="turn turn-live">
                <div className="live-block" ref={liveBlockRef}>
                  <div className="trace--compact">
                    <Trace key={activeTurnKey} substrate={gate} />
                  </div>
                  {atServe && (
                    <p className="recognition-line">
                      Those six steps are what produce the answer you normally
                      just see.
                    </p>
                  )}
                  <div className="assistant-area">
                    <ManualOverlay substrate={gate} />
                    {atServe && replyProse && (
                      <div className="msg msg-assistant">{replyProse}</div>
                    )}
                    {atPantry && (
                      <p className="step-six-signal">
                        Behind the scenes — saving this turn to your recent
                        history.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

                  {/* The real host's transcript (banners above it). During the
                      walk the input is locked and the just-arrived reply is
                      withheld until the Step-05 reveal — both driven by the
                      props passed to <App> above. */}
                  {banners}
                  {transcript}
                </div>
              </div>
              {footer}
            </>
          )}
        </App>
      </div>

      {/* Zone 3 — Event log (BL-13): a non-modal disclosure. Docks beside the
          walk on wide; slides over from the right on narrow. Toggled only from
          the line-2 button (and its own ×) — no backdrop, no click-outside. */}
      {logOpen && (
        <aside className="log-dock" id="event-log-panel" aria-label="Event log">
          <div className="log-drawer-head">
            <h2>Event log</h2>
            <button
              className="drawer-close"
              onClick={() => setLogOpen(false)}
              aria-label="Close event log"
            >
              ×
            </button>
          </div>
          <div id="event-log">
            {events.length === 0 ? (
              <div className="event-row">
                <em>Events will appear here once a turn runs.</em>
              </div>
            ) : (
              events.map((e, i) => (
                <div key={i} className={`event-row ${e.type}`}>
                  <strong>{e.type}</strong> &nbsp; {e.stepId} &nbsp;{' '}
                  <code>{new Date(e.timestamp).toISOString().slice(11, 23)}</code>
                </div>
              ))
            )}
          </div>
        </aside>
      )}
    </div>
  );
}

export function mountComposedView(rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ComposedView />
    </StrictMode>,
  );
}

export default ComposedView;
