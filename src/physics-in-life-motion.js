/*
 * «حرّك القوى» — the motion clock behind the three Lesson 1 experiments.
 *
 * The controller owns *only* the drawing progress (0 → 1). It never touches a
 * force value: every frame the scenes rebuild their arrows from the current
 * inputs, so the motion can never disagree with the physics. `reveal` is a pure
 * drawing factor: 0 means "nothing drawn yet", 1 means "the full, exact diagram".
 *
 * DOM-free on purpose: the frame clock is injectable, so `node --test` can prove
 * play / pause / replay / reduced-motion behaviour without a browser, and the
 * lesson mount only wires buttons and scenes to it.
 */

export const MOTION_DURATION_MS = 1800;

const clamp01 = (value) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));

/* Resolve the browser clock lazily: the controller can be imported before the
   frame globals exist (tests, jsdom) and still animate when a real one is
   available. `null` means "this environment cannot animate". */
const defaultRequestFrame = (callback) => (
  typeof requestAnimationFrame === 'function' ? requestAnimationFrame(callback) : null
);
const defaultCancelFrame = (id) => {
  if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(id);
};

/**
 * @param {object} [options]
 * @param {number} [options.duration]  one full run in milliseconds
 * @param {(callback: (time: number) => void) => number | null} [options.requestFrame]
 * @param {(id: number) => void} [options.cancelFrame]
 * @param {(reveal: number) => void} [options.onFrame]     called for every drawing value
 * @param {(state: object) => void} [options.onStateChange] called when play/pause/… changes
 * @param {() => boolean} [options.reducedMotion]           honours the OS setting
 */
export function createMotionController(options = {}) {
  const duration = Number.isFinite(options.duration) && options.duration > 0
    ? options.duration
    : MOTION_DURATION_MS;
  const requestFrame = options.requestFrame ?? defaultRequestFrame;
  const cancelFrame = options.cancelFrame ?? defaultCancelFrame;
  const onFrame = typeof options.onFrame === 'function' ? options.onFrame : () => {};
  const onStateChange = typeof options.onStateChange === 'function' ? options.onStateChange : () => {};
  const prefersReduced = typeof options.reducedMotion === 'function' ? options.reducedMotion : () => false;

  let status = 'idle'; // idle | playing | paused | done
  let reveal = 1; // the static diagram is complete until a run starts
  let frameId = null;
  let firstTick = null;
  let originElapsed = 0;
  let reducedLastRun = false;

  const snapshot = () => ({
    status,
    reveal,
    playing: status === 'playing',
    paused: status === 'paused',
    done: status === 'done',
    reduced: reducedLastRun,
  });

  function cancel() {
    if (frameId !== null && cancelFrame) cancelFrame(frameId);
    frameId = null;
  }

  function paint() {
    onFrame(reveal);
  }

  function emit() {
    onStateChange(snapshot());
  }

  function finish() {
    cancel();
    reveal = 1;
    status = 'done';
    paint();
    emit();
  }

  function tick(time) {
    frameId = null;
    if (status !== 'playing') return;
    if (firstTick === null) firstTick = time;
    if (!Number.isFinite(time)) return finish();
    const elapsed = originElapsed + Math.max(0, time - firstTick);
    const next = clamp01(elapsed / duration);
    reveal = next;
    if (next >= 1) {
      finish();
      return;
    }
    paint();
    frameId = requestFrame(tick);
    if (frameId === null) finish();
  }

  /** Start a fresh run, or resume a paused one from exactly where it stopped. */
  function play() {
    if (status === 'playing') return snapshot();
    const resuming = status === 'paused';
    cancel();
    reducedLastRun = Boolean(prefersReduced());
    /* Respect the OS setting: show the finished diagram at once, no animation. */
    if (reducedLastRun) {
      reveal = 1;
      status = 'done';
      paint();
      emit();
      return snapshot();
    }
    if (!resuming) reveal = 0;
    originElapsed = resuming ? reveal * duration : 0;
    firstTick = null;
    status = 'playing';
    paint(); // clears the scene for a new run (or resumes the paused drawing)
    emit();
    frameId = requestFrame(tick);
    if (frameId === null) finish();
    return snapshot();
  }

  /** Freeze the drawing where it is; the next play() resumes from here. */
  function pause() {
    if (status !== 'playing') return snapshot();
    cancel();
    status = 'paused';
    emit();
    return snapshot();
  }

  /**
   * Return to a clean experiment. The default settles on the complete diagram
   * (reveal 1) because a reset experiment still shows its full default state;
   * pass `{ reveal: 0 }` to preview the blank starting frame instead.
   */
  function reset({ reveal: nextReveal = 1 } = {}) {
    cancel();
    firstTick = null;
    originElapsed = 0;
    reducedLastRun = false;
    reveal = clamp01(nextReveal);
    status = 'idle';
    paint();
    emit();
    return snapshot();
  }

  /** Stop immediately; used when the station is left or hidden. */
  function stop({ settle = true } = {}) {
    cancel();
    firstTick = null;
    originElapsed = 0;
    reducedLastRun = false;
    status = 'idle';
    if (settle) reveal = 1;
    paint();
    emit();
    return snapshot();
  }

  function destroy() {
    cancel();
    status = 'idle';
  }

  return {
    play,
    pause,
    reset,
    stop,
    destroy,
    getState: snapshot,
  };
}
