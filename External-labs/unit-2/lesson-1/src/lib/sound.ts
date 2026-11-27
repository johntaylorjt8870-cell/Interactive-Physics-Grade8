/**
 * Tiny WebAudio layer: every sound is tied to a visible event
 * (electron transfer, spark, correct / wrong answer, leaf movement).
 */
type Voice = "spark" | "tick" | "transfer" | "correct" | "wrong" | "whoosh";

let ctx: AudioContext | null = null;
let muted = false;
const listeners = new Set<(m: boolean) => void>();

export function isMuted() {
  return muted;
}

export function setMuted(next: boolean) {
  muted = next;
  listeners.forEach((l) => l(muted));
}

export function toggleMuted() {
  setMuted(!muted);
  return muted;
}

export function onMuteChange(cb: (m: boolean) => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function audio(): AudioContext | null {
  if (muted) return null;
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function blip(
  ac: AudioContext,
  opts: { freq: number; to?: number; dur: number; type?: OscillatorType; gain?: number; delay?: number },
) {
  const t0 = ac.currentTime + (opts.delay ?? 0);
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(opts.freq, t0);
  if (opts.to) osc.frequency.exponentialRampToValueAtTime(Math.max(40, opts.to), t0 + opts.dur);
  const peak = opts.gain ?? 0.05;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + opts.dur + 0.03);
}

function noise(ac: AudioContext, dur: number, gain = 0.05, hp = 1600) {
  const frames = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames) ** 2;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = hp;
  const g = ac.createGain();
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(ac.destination);
  src.start();
}

export function play(voice: Voice) {
  const ac = audio();
  if (!ac) return;
  switch (voice) {
    case "spark":
      noise(ac, 0.16, 0.07, 2200);
      blip(ac, { freq: 1500, to: 420, dur: 0.14, type: "triangle", gain: 0.035 });
      break;
    case "tick":
      blip(ac, { freq: 660, dur: 0.05, type: "sine", gain: 0.028 });
      break;
    case "transfer":
      blip(ac, { freq: 880, to: 1320, dur: 0.09, type: "sine", gain: 0.03 });
      break;
    case "correct":
      blip(ac, { freq: 587.33, dur: 0.12, gain: 0.04 });
      blip(ac, { freq: 880, dur: 0.18, gain: 0.04, delay: 0.1 });
      break;
    case "wrong":
      blip(ac, { freq: 220, to: 160, dur: 0.22, type: "sawtooth", gain: 0.03 });
      break;
    case "whoosh":
      noise(ac, 0.3, 0.03, 700);
      break;
  }
}