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
import './composed-view.css';

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

// Fold a turn's raw event stream to one row per Service step for the Event log
// (BL-7). Steps arrive as step_started/step_ended pairs at the same instant, so
// a single row per stepId reads cleanest. plate_the_dish is the exception — it
// spans the real LLM latency (opened on submit, ended on response), so its row
// carries the elapsed milliseconds.
function foldTurnEvents(turnEvents) {
  const order = [];
  const byStep = new Map();
  for (const event of turnEvents) {
    if (!byStep.has(event.stepId)) {
      order.push(event.stepId);
      byStep.set(event.stepId, { stepId: event.stepId });
    }
    const record = byStep.get(event.stepId);
    if (event.type === 'step_started') record.started = event.timestamp;
    if (event.type === 'step_ended') record.ended = event.timestamp;
  }
  return order.map((stepId) => {
    const { started, ended } = byStep.get(stepId);
    const latency =
      stepId === 'plate_the_dish' && started != null && ended != null
        ? ended - started
        : null;
    return { stepId, latency };
  });
}

// One collapsible turn in the cumulative Event log (BL-7). Completed turns
// render collapsed; the in-progress turn is forced open via `live`. <details>
// carries the collapse affordance natively (keyboard + screen-reader, WCAG).
function TurnGroup({ index, events, live = false }) {
  const rows = foldTurnEvents(events);
  return (
    <details
      className={live ? 'turn-group turn-group--live' : 'turn-group'}
      open={live || undefined}
    >
      <summary className="turn-group__header">
        Round {index + 1}
        {live && <span className="turn-group__live-tag">in progress</span>}
      </summary>
      <div className="turn-group__body">
        {rows.map((row) => (
          <div key={row.stepId} className="event-row folded">
            <strong>{row.stepId}</strong>
            {row.latency != null && (
              <code className="event-latency">{row.latency} ms</code>
            )}
          </div>
        ))}
      </div>
    </details>
  );
}

// Payload detail seam (BL-8). 'standard' surfaces the minimum-credible per-turn
// artifacts; 'full' is reserved for the deferred richer tier — the renderer is
// not built, but this constant is the seam it drops behind with no rework.
// Promotable to a prop/config later without touching the call sites.
const DETAIL_LEVEL = 'standard';

// Per-turn payload block (BL-8). Sits BENEATH a Service step's constant teaching
// line (ManualOverlay) — paired, lesson-primary, payload-subordinate (D-RPR-4);
// it never replaces the lesson. 'standard' surfaces, per step: take_the_order's
// input (the order as placed), plate_the_dish's model call (model + latency +
// tokens), read_the_ticket's detected marker types, and stock_the_pantry's filed
// records. Marker payload bytes never leave the server (TYPE only, §10); the
// plate receipt is metadata only (model id + token counts, no values).
function TurnPayload({ stepId, orderText, artifacts, latency }) {
  if (DETAIL_LEVEL !== 'standard') return null; // 'full' renderer reserved

  if (stepId === 'take_the_order' && orderText) {
    return (
      <div className="turn-payload">
        <span className="turn-payload__label">What this step just did</span>
        <p className="turn-payload__body turn-payload__body--muted">
          Your message, now the order the Runner carries:
        </p>
        <p className="turn-payload__body">{orderText}</p>
      </div>
    );
  }

  if (stepId === 'plate_the_dish') {
    const model = artifacts?.model ?? null;
    const usage = artifacts?.usage ?? null;
    return (
      <div className="turn-payload">
        <span className="turn-payload__label">What this step just did</span>
        <ul className="turn-payload__list">
          {model && (
            <li className="turn-payload__item">
              model <code>{model}</code>
            </li>
          )}
          {latency != null && (
            <li className="turn-payload__item">
              latency <code>{latency} ms</code>
            </li>
          )}
          {usage && (
            <li className="turn-payload__item">
              tokens{' '}
              <code>
                {usage.input_tokens} in · {usage.output_tokens} out
              </code>
            </li>
          )}
        </ul>
      </div>
    );
  }

  // read_the_ticket (step 04) READS the ticket — the marker types the expediter
  // parsed from the chef's output. Filing happens later at stock_the_pantry
  // (step 06); this block names detection, not filing (BL-8 part-1 mislabel fix).
  if (stepId === 'read_the_ticket') {
    const markers = artifacts?.markers ?? [];
    return (
      <div className="turn-payload">
        <span className="turn-payload__label">What this step just did</span>
        {markers.length === 0 ? (
          <p className="turn-payload__body turn-payload__body--muted">
            No record on this ticket yet — the Chef writes one only once the
            intake has enough to triage.
          </p>
        ) : (
          <ul className="turn-payload__list">
            {markers.map((marker, i) => (
              <li key={i} className="turn-payload__item">
                <code>{marker.type}</code>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // stock_the_pantry (step 06) FILES the records — the side-effect that actually
  // persists (dispatch). Same marker types as read_the_ticket, now framed as
  // filed (BL-8 part 2: the "records filed" beat moves here, where it is true).
  if (stepId === 'stock_the_pantry') {
    const markers = artifacts?.markers ?? [];
    return (
      <div className="turn-payload">
        <span className="turn-payload__label">What this step just did</span>
        {markers.length === 0 ? (
          <p className="turn-payload__body turn-payload__body--muted">
            Nothing to file yet — a record is filed only once the intake is
            complete.
          </p>
        ) : (
          <ul className="turn-payload__list">
            {markers.map((marker, i) => (
              <li key={i} className="turn-payload__item">
                <code>{marker.type}</code>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return null;
}

function ComposedView() {
  // Released (post-gate) events for the CURRENT turn — the live list. Drives
  // the live render, the walk's six-step completion gate, and the in-progress
  // group in the Event log. Reset per turn (BL-7).
  const [events, setEvents] = useState([]);
  // Completed turns, append-only across the conversation — the archive. Each
  // entry is one finished turn's event list, rendered as a collapsed group in
  // the Event log. Never wiped within a conversation (BL-7 cumulative log).
  const [archive, setArchive] = useState([]);
  // The walk is in progress (a turn has been submitted, not yet archived).
  const [started, setStarted] = useState(false);
  // The served answer prose, carried out of band from onTurnResponded (the
  // stream is sealed to events-only — A2 contract — so the reply rides here).
  const [replyProse, setReplyProse] = useState(null);
  // The order as placed — surfaced as take_the_order's input beat (BL-8).
  const [orderText, setOrderText] = useState(null);
  // Per-turn artifacts from /converse (type-only markers; no payload bytes,
  // §10) — surfaced beneath read_the_ticket (BL-8). Rides the same out-of-band
  // channel as replyProse (the event stream carries no payload — A2).
  const [artifacts, setArtifacts] = useState(null);
  // Whether any turn has been submitted yet — gates the idle welcome surface.
  const [everSubmitted, setEverSubmitted] = useState(false);
  // First-step release (mount-before-advance): the live Trace must be mounted
  // and subscribed before the gate releases step 01. Armed on submit; consumed
  // by the post-commit effect below.
  const [pendingFirstStep, setPendingFirstStep] = useState(false);
  // Remounts the live Trace per turn so step state starts clean.
  const [activeTurnKey, setActiveTurnKey] = useState(0);
  // plate_the_dish call latency (BL-8, WO-317.6b). Read from the RAW stream so
  // the receipt shows real latency WHILE the learner is on plate_the_dish — see
  // the subscription effect below. Cleared per turn on submit / reset / fail.
  const [plateLatency, setPlateLatency] = useState(null);

  // Event log disclosure (BL-13). Non-modal: persists through the walk, toggled
  // from the line-2 button. Open by default on wide (fills the dock beside the
  // walk), closed on narrow.
  const [logOpen, setLogOpen] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(min-width: 64rem)').matches,
  );

  // The live step block snaps into view on each advance (Zone 2).
  const liveBlockRef = useRef(null);
  // The scroll region — rested at the bottom when no walk is running so the
  // newest message stays in view (BL-12 scroll discipline).
  const scrollRef = useRef(null);

  // Subscribe the composed view to the gate (the released-event timeline). One
  // subscription for the lifetime of the view; gate is module-stable.
  useEffect(() => {
    const unsubscribe = gate.subscribe((event) => {
      setEvents((prev) => [...prev, event]);
    });
    return unsubscribe;
  }, []);

  // plate_the_dish latency (BL-8, WO-317.6b). Read from the RAW stream, not the
  // gated events: plate_ended lands on the raw stream the instant the response
  // returns (driver.turnResponded), so the receipt shows real call latency WHILE
  // the learner is on plate_the_dish. The gated events release plate_ended a step
  // late (at read_the_ticket), which stranded latency in the Event log only.
  useEffect(() => {
    let plateStarted = null;
    const unsubscribe = stream.subscribe((event) => {
      if (event.stepId !== 'plate_the_dish') return;
      if (event.type === 'step_started') plateStarted = event.timestamp;
      if (event.type === 'step_ended' && plateStarted != null) {
        setPlateLatency(event.timestamp - plateStarted);
      }
    });
    return unsubscribe;
  }, []);

  // The active Service step (last step_started) — keys the per-turn payload
  // block to the step currently being walked (BL-8).
  const currentStep =
    [...events].reverse().find((e) => e.type === 'step_started')?.stepId ?? null;

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
    // Archive the just-completed turn (append-only), then reset the live list
    // for the next turn — the log accumulates across the conversation (BL-7).
    setArchive((prev) => [...prev, { events }]);
    setEvents([]);
  }, [turnComplete]);

  // Live-block in view during the walk (BL-12 decision a): whenever a step is
  // released the live block scrolls into view beneath the Title band — the
  // teaching beat. Runs only while a walk is in progress. Guarded for non-DOM.
  useEffect(() => {
    if (!started) return;
    liveBlockRef.current?.scrollIntoView?.({ block: 'start' });
  }, [events.length, started]);

  // Bottom-rest (BL-12 decisions 1 + a): once a walk ends, the scroll region
  // rests at the bottom so the newest message is in view — chat-app default.
  // Gated on !started, so it never fights the live-block snap above. Guarded
  // for non-DOM environments.
  useEffect(() => {
    if (started) return;
    if (!everSubmitted) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [started, everSubmitted]);

  // App turn lifecycle → six-step walk (D3). These run inside App.handleSend.
  // onTurnSubmitted opens the walk; onTurnResponded carries the served answer
  // and emits the back half; onTurnFailed unwinds.
  function onTurnSubmitted(content) {
    // Clear any stale buffer FIRST, then emit the fresh front half (take +
    // brief fully, plate opened) into the now-empty gate queue.
    gate.reset();
    setEvents([]);
    driver.turnSubmitted();
    setReplyProse(null);
    setOrderText(content ?? null);
    setArtifacts(null);
    setPlateLatency(null);
    setEverSubmitted(true);
    setActiveTurnKey((k) => k + 1);
    setStarted(true);
    setPendingFirstStep(true);
  }

  function onTurnResponded(prose, turnArtifacts) {
    setReplyProse(prose);
    setArtifacts(turnArtifacts ?? null);
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
    setOrderText(null);
    setArtifacts(null);
    setPlateLatency(null);
    setPendingFirstStep(false);
    setStarted(false);
  }

  // Mid-turn Send (App asserts controlsLocked, so its Send press reports here
  // as onLockedSend rather than submitting): release the next Service step.
  function nextStep() {
    gate.advance();
  }

  // New conversation (WO-317.4c / BL-14): App fires this after clearing its own
  // conversation state. Clear all host walk state and return to the welcome
  // screen (everSubmitted=false re-shows it; archive=[] empties the Event log).
  // The gate/machine are already idle at terminal — the final turn archived and
  // the machine self-returned to at_the_table — so only UI state resets here.
  // The activeTurnKey bump remounts the live Trace clean for the next walk.
  function onReset() {
    setArchive([]);
    setEvents([]);
    setStarted(false);
    setEverSubmitted(false);
    setReplyProse(null);
    setOrderText(null);
    setArtifacts(null);
    setPlateLatency(null);
    setPendingFirstStep(false);
    setActiveTurnKey((k) => k + 1);
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
          onReset={onReset}
          hideLatestAssistant={started}
          formClassName="control-bar"
          inputClassName="intake-input"
        >
          {({ banners, transcript, footer }) => (
            <>
              <div className="composed-scroll" ref={scrollRef}>
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
                  <em>round</em>, and the six steps inside it stay hidden. This
                  overlay opens them up — describe an intake below, then walk the
                  round one step at a time and study each one.
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
                    <TurnPayload
                      stepId={currentStep}
                      orderText={orderText}
                      artifacts={artifacts}
                      latency={plateLatency}
                    />
                    {atServe && replyProse && (
                      <div className="msg msg-assistant">{replyProse}</div>
                    )}
                    {atPantry && (
                      <p className="step-six-signal">
                        Behind the scenes — saving this round to your recent
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
            {archive.length === 0 && events.length === 0 ? (
              <div className="event-row">
                <em>Events will appear here once a round runs.</em>
              </div>
            ) : (
              <>
                {/* Completed turns — collapsible groups, collapsed by default. */}
                {archive.map((turn, ti) => (
                  <TurnGroup key={ti} index={ti} events={turn.events} />
                ))}
                {/* The in-progress turn — shown expanded during the walk. */}
                {started && events.length > 0 && (
                  <TurnGroup index={archive.length} events={events} live />
                )}
              </>
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
