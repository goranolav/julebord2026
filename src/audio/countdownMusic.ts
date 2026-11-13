/**
 * Procedurally generated "thinking" music using the Web Audio API.
 * No audio files: a driving minor-key loop (bass, arpeggio, drums) whose tempo
 * and density increase with `intensity` (0 = calm start, 1 = time almost up).
 */

let sharedContext: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedContext) sharedContext = new Ctor();
  if (sharedContext.state === 'suspended') void sharedContext.resume();
  return sharedContext;
}

export const midiToFreq = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

/** Am – F – Dm – E, one chord per bar. */
const PROGRESSION = [
  { bass: 45, chord: [57, 60, 64] },
  { bass: 41, chord: [57, 60, 65] },
  { bass: 38, chord: [57, 62, 65] },
  { bass: 40, chord: [56, 59, 64] },
] as const;

const STEPS_PER_BAR = 16;
const BASS_STEPS = new Set([0, 3, 6, 8, 11, 14]);
const ARP_PATTERN = [0, 1, 2, 1] as const;
const MIN_BPM = 116;
const MAX_BPM = 170;
const LOOKAHEAD_S = 0.12;
const SCHEDULER_MS = 25;
const MASTER_VOLUME = 0.32;

/** Common interface for the countdown soundtracks. */
export interface CountdownSoundtrack {
  setIntensity(value: number): void;
  start(): void;
  stop(): void;
}

export class CountdownMusic implements CountdownSoundtrack {
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
    this.noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.2), ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }

  /** Returns null when Web Audio is unavailable (e.g. in tests). */
  static create(): CountdownMusic | null {
    const ctx = getAudioContext();
    return ctx ? new CountdownMusic(ctx) : null;
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
    this.master.gain.linearRampToValueAtTime(0, now + 0.15);
    window.setTimeout(() => this.master.disconnect(), 400);
  }

  private schedule(): void {
    while (this.nextTime < this.ctx.currentTime + LOOKAHEAD_S) {
      this.playStep(this.step, this.nextTime);
      const bpm = MIN_BPM + (MAX_BPM - MIN_BPM) * this.intensity;
      this.nextTime += 60 / bpm / 4;
      this.step++;
    }
  }

  private playStep(step: number, t: number): void {
    const { bass, chord } = PROGRESSION[Math.floor(step / STEPS_PER_BAR) % PROGRESSION.length];
    const s = step % STEPS_PER_BAR;
    const tense = this.intensity;

    // Drums: kick on the beat (every beat when tension rises), hi-hat on every 16th.
    if (s % 8 === 0 || (tense > 0.45 && s % 4 === 0)) this.kick(t);
    this.hat(t, s % 4 === 2 ? 0.1 : 0.035);
    if (tense > 0.8 && s % 2 === 1) this.hat(t, 0.05);

    // Driving bass.
    if (BASS_STEPS.has(s)) {
      const octave = s === 6 || s === 14 ? 12 : 0;
      this.tone(midiToFreq(bass + octave), t, 0.17, 'sawtooth', 0.2, 520 + tense * 500);
    }

    // Arpeggio climbing an octave in the second half of each bar.
    const arpNote = chord[ARP_PATTERN[s % 4]] + (s >= 8 ? 12 : 0);
    this.tone(midiToFreq(arpNote), t, 0.08, 'square', 0.05 + tense * 0.04, 2200 + tense * 2500);

    // Shrill high stabs when time is nearly up.
    if (tense > 0.7 && s % 2 === 0) {
      this.tone(midiToFreq(chord[2] + 24), t, 0.05, 'triangle', 0.045, 7000);
    }
  }

  private tone(freq: number, t: number, dur: number, type: OscillatorType, volume: number, cutoff: number): void {
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(filter).connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private kick(t: number): void {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  private hat(t: number, volume: number): void {
    const src = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    src.buffer = this.noise;
    filter.type = 'highpass';
    filter.frequency.value = 7000;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
    src.connect(filter).connect(gain).connect(this.master);
    src.start(t);
    src.stop(t + 0.05);
  }
}

/** Harsh game-show buzzer for when the time runs out. */
export function playTimeUpBuzzer(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  filter.type = 'lowpass';
  filter.frequency.value = 1800;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.35, t + 0.02);
  gain.gain.setValueAtTime(0.35, t + 0.75);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.95);
  filter.connect(gain).connect(ctx.destination);
  for (const freq of [98, 104, 196]) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    osc.connect(filter);
    osc.start(t);
    osc.stop(t + 1);
  }
}
