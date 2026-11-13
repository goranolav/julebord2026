/**
 * Procedurally generated "thinking" music using the Web Audio API.
 * No audio files: a driving minor-key loop (bass, arpeggio, drums) whose tempo
 * and density increase with `intensity` (0 = calm start, 1 = time almost up).
 */

import { getAudioContext, midiToFreq, ScheduledSoundtrack } from './audioEngine';

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
const MASTER_VOLUME = 0.32;

export class CountdownMusic extends ScheduledSoundtrack {
  private constructor(ctx: AudioContext) {
    super(ctx, MASTER_VOLUME);
  }

  /** Returns null when Web Audio is unavailable (e.g. in tests). */
  static create(): CountdownMusic | null {
    const ctx = getAudioContext();
    return ctx ? new CountdownMusic(ctx) : null;
  }

  /** One sixteenth note at the current tempo. */
  protected stepDuration(): number {
    const bpm = MIN_BPM + (MAX_BPM - MIN_BPM) * this.intensity;
    return 60 / bpm / 4;
  }

  protected playStep(step: number, t: number): void {
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
