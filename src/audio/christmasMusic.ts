import { getAudioContext, midiToFreq, type CountdownSoundtrack } from './countdownMusic';

/**
 * Christmas countdown music: the "Jingle Bells" chorus (James Lord Pierpont, 1857 –
 * public domain) on a synthesized glockenspiel, with sleigh bells and a simple bass.
 * Tempo and sleigh-bell density increase with `intensity`.
 */

// Notes in G major. Each entry: [midi, length in eighth notes]. 8 eighths per bar.
const G4 = 67;
const A4 = 69;
const B4 = 71;
const C5 = 72;
const D5 = 74;

type Note = readonly [midi: number, eighths: number];

const PHRASE_START: Note[] = [
  [B4, 2], [B4, 2], [B4, 4],
  [B4, 2], [B4, 2], [B4, 4],
  [B4, 2], [D5, 2], [G4, 3], [A4, 1],
  [B4, 8],
  [C5, 2], [C5, 2], [C5, 3], [C5, 1],
];

const MELODY: Note[] = [
  ...PHRASE_START,
  [C5, 2], [B4, 2], [B4, 2], [B4, 1], [B4, 1],
  [B4, 2], [A4, 2], [A4, 2], [B4, 2],
  [A4, 4], [D5, 4],
  ...PHRASE_START,
  [C5, 2], [B4, 2], [B4, 2], [B4, 1], [B4, 1],
  [D5, 2], [D5, 2], [C5, 2], [A4, 2],
  [G4, 8],
];

/** Melody indexed by start step (eighth notes). */
const MELODY_BY_STEP = new Map<number, number>();
let LOOP_STEPS = 0;
for (const [midi, len] of MELODY) {
  MELODY_BY_STEP.set(LOOP_STEPS, midi);
  LOOP_STEPS += len;
}

/** One bass root per bar (G, C, D/A chords). */
const BASS_BY_BAR = [43, 43, 43, 43, 48, 43, 45, 50, 43, 43, 43, 43, 48, 43, 50, 43];

const STEPS_PER_BAR = 8;
const MIN_BPM = 110;
const MAX_BPM = 160;
const LOOKAHEAD_S = 0.12;
const SCHEDULER_MS = 25;
const MASTER_VOLUME = 0.38;

export class ChristmasCountdownMusic implements CountdownSoundtrack {
  private readonly ctx: AudioContext;
  private readonly master: GainNode;
  private readonly noise: AudioBuffer;
  private timer: number | null = null;
  private step = 0;
  private nextTime = 0;
  private intensity = 0;

  private constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);
    this.noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.25), ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }

  /** Returns null when Web Audio is unavailable (e.g. in tests). */
  static create(): ChristmasCountdownMusic | null {
    const ctx = getAudioContext();
    return ctx ? new ChristmasCountdownMusic(ctx) : null;
  }

  setIntensity(value: number): void {
    this.intensity = Math.min(1, Math.max(0, value));
  }

  start(): void {
    if (this.timer !== null) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(0, now);
    this.master.gain.linearRampToValueAtTime(MASTER_VOLUME, now + 0.3);
    this.step = 0;
    this.nextTime = now + 0.05;
    this.timer = window.setInterval(() => this.schedule(), SCHEDULER_MS);
    this.schedule();
  }

  /** Fades out and releases the audio graph. The instance cannot be restarted. */
  stop(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0, now + 0.2);
    window.setTimeout(() => this.master.disconnect(), 500);
  }

  private schedule(): void {
    while (this.nextTime < this.ctx.currentTime + LOOKAHEAD_S) {
      const bpm = MIN_BPM + (MAX_BPM - MIN_BPM) * this.intensity;
      const eighth = 60 / bpm / 2;
      this.playStep(this.step, this.nextTime, eighth);
      this.nextTime += eighth;
      this.step++;
    }
  }

  private playStep(step: number, t: number, eighth: number): void {
    const loopStep = step % LOOP_STEPS;
    const tense = this.intensity;

    const melody = MELODY_BY_STEP.get(loopStep);
    if (melody !== undefined) this.glockenspiel(midiToFreq(melody), t, 0.16 + tense * 0.05);

    // Bass on beats 1 and 3, root then fifth.
    const s = loopStep % STEPS_PER_BAR;
    if (s === 0 || s === 4) {
      const root = BASS_BY_BAR[Math.floor(loopStep / STEPS_PER_BAR) % BASS_BY_BAR.length];
      this.bass(midiToFreq(root + (s === 4 ? 7 : 0)), t, eighth * 1.8);
    }

    // Sleigh bells: every eighth, plus sixteenths when time is running out.
    this.sleighBells(t, s % 2 === 0 ? 0.09 : 0.05);
    if (tense > 0.55) this.sleighBells(t + eighth / 2, 0.045 + tense * 0.03);
  }

  /** Bell-like tone: fundamental plus an inharmonic partial, quick decay. */
  private glockenspiel(freq: number, t: number, volume: number): void {
    const out = this.ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(volume, t + 0.004);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    out.connect(this.master);
    for (const [ratio, level] of [
      [1, 1],
      [2.76, 0.35],
      [5.4, 0.12],
    ] as const) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 2 * ratio, t);
      gain.gain.value = level;
      osc.connect(gain).connect(out);
      osc.start(t);
      osc.stop(t + 0.75);
    }
  }

  private bass(freq: number, t: number, dur: number): void {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.28, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private sleighBells(t: number, volume: number): void {
    const src = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    src.buffer = this.noise;
    filter.type = 'bandpass';
    filter.frequency.value = 9000;
    filter.Q.value = 1.2;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    src.connect(filter).connect(gain).connect(this.master);
    src.start(t);
    src.stop(t + 0.14);
  }
}

/** Deep, slowly decaying church-bell strike with a slight downward pitch. Used when time is up. */
export function playTimeUpBell(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  const base = 73.4; // D2
  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime(0.5, t + 0.01);
  out.gain.exponentialRampToValueAtTime(0.0001, t + 4);
  out.connect(ctx.destination);

  // Partials of a tuned bell: hum, prime, tierce (minor third), quint, nominal.
  const partials = [
    [0.5, 0.6, 4],
    [1, 1, 3.5],
    [1.2, 0.45, 2.5],
    [1.5, 0.3, 2],
    [2, 0.4, 1.8],
    [2.76, 0.15, 1.2],
  ] as const;
  for (const [ratio, level, decay] of partials) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(base * ratio, t);
    osc.frequency.exponentialRampToValueAtTime(base * ratio * 0.97, t + decay);
    gain.gain.setValueAtTime(level, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    osc.connect(gain).connect(out);
    osc.start(t);
    osc.stop(t + decay + 0.05);
  }
}
