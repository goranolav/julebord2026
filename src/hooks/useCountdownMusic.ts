import { useEffect, useRef } from 'react';
import { CountdownMusic, playTimeUpBuzzer } from '../audio/countdownMusic';
import type { Countdown } from './useCountdown';

/** Plays tension music while the countdown runs, and a buzzer when it expires. */
export function useCountdownMusic(countdown: Countdown, enabled: boolean): void {
  const { isRunning, isExpired, remaining, total } = countdown;
  const intensity = total > 0 ? 1 - remaining / total : 1;

  const musicRef = useRef<CountdownMusic | null>(null);
  const intensityRef = useRef(intensity);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    intensityRef.current = intensity;
    enabledRef.current = enabled;
    musicRef.current?.setIntensity(intensity);
  }, [intensity, enabled]);

  useEffect(() => {
    if (!enabled || !isRunning) return undefined;
    const music = CountdownMusic.create();
    if (!music) return undefined;
    music.setIntensity(intensityRef.current);
    music.start();
    musicRef.current = music;
    return () => {
      music.stop();
      if (musicRef.current === music) musicRef.current = null;
    };
  }, [enabled, isRunning]);

  useEffect(() => {
    if (isExpired && enabledRef.current) playTimeUpBuzzer();
  }, [isExpired]);
}
