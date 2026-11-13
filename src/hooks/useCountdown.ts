import { useCallback, useEffect, useState } from 'react';

export interface Countdown {
  remaining: number;
  total: number;
  isRunning: boolean;
  isExpired: boolean;
  start: () => void;
  pause: () => void;
  restart: () => void;
}

/** Simple per-second countdown. Remount (e.g. with a `key`) to reset for a new clue. */
export function useCountdown(totalSeconds: number, autoStart = true): Countdown {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(autoStart);

  const isExpired = remaining <= 0;
  const isRunning = running && !isExpired;

  useEffect(() => {
    if (!isRunning) return undefined;
    const id = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const restart = useCallback(() => {
    setRemaining(totalSeconds);
    setRunning(true);
  }, [totalSeconds]);

  return { remaining, total: totalSeconds, isRunning, isExpired, start, pause, restart };
}
