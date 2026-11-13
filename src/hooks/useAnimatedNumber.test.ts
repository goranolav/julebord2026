import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAnimatedNumber } from './useAnimatedNumber';

describe('useAnimatedNumber', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'Date'] });
  });
  afterEach(() => vi.useRealTimers());

  it('shows the initial value immediately', () => {
    const { result } = renderHook(() => useAnimatedNumber(300));
    expect(result.current).toBe(300);
  });

  it('animates towards a new target and lands exactly on it', () => {
    const { result, rerender } = renderHook(({ value }) => useAnimatedNumber(value, 600), {
      initialProps: { value: 0 },
    });
    rerender({ value: 500 });

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBeGreaterThan(0);
    expect(result.current).toBeLessThan(500);

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe(500);
  });

  it('animates downwards too', () => {
    const { result, rerender } = renderHook(({ value }) => useAnimatedNumber(value, 200), {
      initialProps: { value: 200 },
    });
    rerender({ value: -100 });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe(-100);
  });
});
