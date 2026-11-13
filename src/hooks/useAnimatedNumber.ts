import { useEffect, useRef, useState } from 'react';

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

/**
 * Returns a number that animates (ease-out) towards `target` whenever it changes.
 * The first render shows `target` immediately.
 */
export function useAnimatedNumber(target: number, durationMs = 600): number {
  const [display, setDisplay] = useState(target);
  const currentRef = useRef(target);

  useEffect(() => {
    const from = currentRef.current;
    if (from === target) return undefined;

    const duration = prefersReducedMotion() ? 0 : durationMs;
    let startTime: number | null = null;
    let frame = 0;

    const step = (now: number) => {
      if (startTime === null) startTime = now;
      const t = duration <= 0 ? 1 : Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = t >= 1 ? target : Math.round(from + (target - from) * eased);
      currentRef.current = value;
      setDisplay(value);
      if (t < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return display;
}
