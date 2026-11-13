import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCountdown } from './useCountdown';
import { useCountdownMusic } from './useCountdownMusic';

const music = vi.hoisted(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  setIntensity: vi.fn(),
  buzzer: vi.fn(),
}));

vi.mock('../audio/countdownMusic', () => ({
  CountdownMusic: {
    create: () => ({ start: music.start, stop: music.stop, setIntensity: music.setIntensity }),
  },
  playTimeUpBuzzer: music.buzzer,
}));

function useTimerWithMusic(seconds: number, enabled: boolean) {
  const countdown = useCountdown(seconds);
  useCountdownMusic(countdown, enabled);
  return countdown;
}

describe('useCountdownMusic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.values(music).forEach((fn) => fn.mockClear());
  });
  afterEach(() => vi.useRealTimers());

  const tick = (seconds: number) => {
    for (let i = 0; i < seconds; i++) act(() => void vi.advanceTimersByTime(1000));
  };

  it('plays while running, raises intensity, then stops and buzzes at time up', () => {
    renderHook(() => useTimerWithMusic(4, true));
    expect(music.start).toHaveBeenCalled();

    tick(2);
    expect(music.setIntensity).toHaveBeenLastCalledWith(0.5);
    expect(music.buzzer).not.toHaveBeenCalled();

    tick(2);
    expect(music.stop).toHaveBeenCalled();
    expect(music.buzzer).toHaveBeenCalledTimes(1);
  });

  it('stops when paused and when unmounted', () => {
    const { result, unmount } = renderHook(() => useTimerWithMusic(10, true));
    const stopsBefore = music.stop.mock.calls.length;
    act(() => result.current.pause());
    expect(music.stop.mock.calls.length).toBeGreaterThan(stopsBefore);

    act(() => result.current.start());
    const stopsAfterResume = music.stop.mock.calls.length;
    unmount();
    expect(music.stop.mock.calls.length).toBeGreaterThan(stopsAfterResume);
  });

  it('is silent when sound is disabled', () => {
    renderHook(() => useTimerWithMusic(2, false));
    tick(2);
    expect(music.start).not.toHaveBeenCalled();
    expect(music.buzzer).not.toHaveBeenCalled();
  });
});
