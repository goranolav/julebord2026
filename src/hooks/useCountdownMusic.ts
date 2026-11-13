import { useEffect, useRef } from 'react';
import type { CountdownSoundtrack } from '../audio/audioEngine';
import { CountdownMusic, playTimeUpBuzzer } from '../audio/countdownMusic';
import { ChristmasCountdownMusic, playTimeUpBell } from '../audio/christmasMusic';
import type { AppearanceId } from '../styles/appearance';
import type { Countdown } from './useCountdown';

const soundtracks: Record<AppearanceId, { create: () => CountdownSoundtrack | null; timeUp: () => void }> = {
  neon: { create: () => CountdownMusic.create(), timeUp: playTimeUpBuzzer },
  christmas: { create: () => ChristmasCountdownMusic.create(), timeUp: playTimeUpBell },
};

/** Plays tension music while the countdown runs, and a time-up sound when it expires. */
export function useCountdownMusic(countdown: Countdown, enabled: boolean, variant: AppearanceId = 'neon'): void {
  const { isRunning, isExpired, remaining, total } = countdown;
  const intensity = total > 0 ? 1 - remaining / total : 1;

  const musicRef = useRef<CountdownSoundtrack | null>(null);
  const intensityRef = useRef(intensity);
  const enabledRef = useRef(enabled);
  const variantRef = useRef(variant);

  useEffect(() => {
    intensityRef.current = intensity;
    enabledRef.current = enabled;
    variantRef.current = variant;
    musicRef.current?.setIntensity(intensity);
  }, [intensity, enabled, variant]);

  // Restarts with the right soundtrack if the theme is switched mid-clue.
  useEffect(() => {
    if (!enabled || !isRunning) return undefined;
    const music = soundtracks[variant].create();
    if (!music) return undefined;
    music.setIntensity(intensityRef.current);
    music.start();
    musicRef.current = music;
    return () => {
      music.stop();
      if (musicRef.current === music) musicRef.current = null;
    };
  }, [enabled, isRunning, variant]);

  useEffect(() => {
    if (isExpired && enabledRef.current) soundtracks[variantRef.current].timeUp();
  }, [isExpired]);
}
