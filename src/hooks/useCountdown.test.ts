import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCountdown } from './useCountdown';

describe('useCountdown', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const tick = (seconds: number) => {
    for (let i = 0; i < seconds; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }
  };

  it('counts down and expires', () => {
    const { result } = renderHook(() => useCountdown(3));
    expect(result.current.remaining).toBe(3);
    tick(2);
    expect(result.current.remaining).toBe(1);
    tick(1);
    expect(result.current.remaining).toBe(0);
    expect(result.current.isExpired).toBe(true);
    expect(result.current.isRunning).toBe(false);
    tick(2);
    expect(result.current.remaining).toBe(0);
  });

  it('pauses, resumes and restarts', () => {
    const { result } = renderHook(() => useCountdown(10));
    tick(2);
    act(() => result.current.pause());
    tick(3);
    expect(result.current.remaining).toBe(8);
    act(() => result.current.start());
    tick(1);
    expect(result.current.remaining).toBe(7);
    act(() => result.current.restart());
    expect(result.current.remaining).toBe(10);
    expect(result.current.isRunning).toBe(true);
  });

  it('does not start when autoStart is false', () => {
    const { result } = renderHook(() => useCountdown(5, false));
    tick(2);
    expect(result.current.remaining).toBe(5);
  });
});
