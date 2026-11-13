/**
 * Shared Web Audio plumbing for the generated countdown soundtracks:
 * one AudioContext, a look-ahead step scheduler, master fade in/out and a noise buffer.
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

/** Common interface for the countdown soundtracks. */
export interface CountdownSoundtrack {
  setIntensity(value: number): void;
  start(): void;
  stop(): void;
}

const LOOKAHEAD_S = 0.12;
const SCHEDULER_MS = 25;
const FADE_IN_S = 0.3;

/**
 * Base class for looped, step-sequenced music. Subclasses decide how long a step is
 * (usually from the tempo and `intensity`) and what plays on each step.
 */
export abstract class ScheduledSoundtrack implements CountdownSoundtrack {
  protected readonly ctx: AudioContext;
  /** All voices connect here; it is faded in on start and out on stop. */
  protected readonly master: GainNode;
  /** A short buffer of white noise for drums and bells. */
  protected readonly noise: AudioBuffer;
  /** 0 = calm start, 1 = time almost up. */
  protected intensity = 0;
  private readonly volume: number;
  private readonly fadeOutS: number;
  private timer: number | null = null;
  private step = 0;
  private nextTime = 0;

  protected constructor(ctx: AudioContext, volume: number, fadeOutS = 0.15) {
    this.ctx = ctx;
    this.volume = volume;
    this.fadeOutS = fadeOutS;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);
    this.noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.25), ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }

  /** Length of the next step in seconds. */
  protected abstract stepDuration(): number;

  /** Schedule everything that sounds on `step`, starting at audio time `time`. */
  protected abstract playStep(step: number, time: number, duration: number): void;

  setIntensity(value: number): void {
    this.intensity = Math.min(1, Math.max(0, value));
  }

  start(): void {
    if (this.timer !== null) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(0, now);
    this.master.gain.linearRampToValueAtTime(this.volume, now + FADE_IN_S);
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
    this.master.gain.linearRampToValueAtTime(0, now + this.fadeOutS);
    window.setTimeout(() => this.master.disconnect(), (this.fadeOutS + 0.3) * 1000);
  }

  private schedule(): void {
    while (this.nextTime < this.ctx.currentTime + LOOKAHEAD_S) {
      const duration = this.stepDuration();
      this.playStep(this.step, this.nextTime, duration);
      this.nextTime += duration;
      this.step++;
    }
  }
}
