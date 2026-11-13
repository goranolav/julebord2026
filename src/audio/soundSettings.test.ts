import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SOUND_KEY, useSoundEnabled } from './soundSettings';

describe('useSoundEnabled', () => {
  it('is on by default', () => {
    const { result } = renderHook(() => useSoundEnabled());
    expect(result.current[0]).toBe(true);
  });

  it('persists and shares the setting between hooks', () => {
    const a = renderHook(() => useSoundEnabled());
    const b = renderHook(() => useSoundEnabled());
    act(() => a.result.current[1](false));
    expect(localStorage.getItem(SOUND_KEY)).toBe('off');
    expect(b.result.current[0]).toBe(false);
    act(() => b.result.current[1](true));
    expect(a.result.current[0]).toBe(true);
  });
});
