import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { THEME_KEY, useAppearance, useChristmasMode, useThemedTeams } from './appearanceMode';
import { christmasAppearance, neonAppearance } from './appearance';

const teams = [
  { id: 'a', name: 'A', score: 0 },
  { id: 'b', name: 'B', score: 0 },
];

describe('christmas mode', () => {
  it('is off by default and uses the neon appearance', () => {
    const { result } = renderHook(() => [useChristmasMode()[0], useAppearance()] as const);
    expect(result.current[0]).toBe(false);
    expect(result.current[1]).toBe(neonAppearance);
  });

  it('persists and is shared between hooks', () => {
    const toggle = renderHook(() => useChristmasMode());
    const other = renderHook(() => useAppearance());
    act(() => toggle.result.current[1](true));
    expect(localStorage.getItem(THEME_KEY)).toBe('christmas');
    expect(other.result.current).toBe(christmasAppearance);
    act(() => toggle.result.current[1](false));
    expect(other.result.current).toBe(neonAppearance);
  });

  it('follows changes made in another browser tab', () => {
    const { result } = renderHook(() => useChristmasMode()[0]);
    act(() => {
      localStorage.setItem(THEME_KEY, 'christmas');
      window.dispatchEvent(new StorageEvent('storage', { key: THEME_KEY }));
    });
    expect(result.current).toBe(true);
  });

  it('ignores unknown stored values', () => {
    localStorage.setItem(THEME_KEY, 'tull');
    const { result } = renderHook(() => useAppearance());
    expect(result.current).toBe(neonAppearance);
  });

  it('colours teams from the active theme', () => {
    const toggle = renderHook(() => useChristmasMode());
    const themed = renderHook(() => useThemedTeams(teams));
    expect(themed.result.current.map((t) => t.color)).toEqual(neonAppearance.teamColors.slice(0, 2));
    act(() => toggle.result.current[1](true));
    expect(themed.result.current.map((t) => t.color)).toEqual(christmasAppearance.teamColors.slice(0, 2));
  });

  it('defines distinct, valid team colours in both themes', () => {
    for (const appearance of [neonAppearance, christmasAppearance]) {
      expect(new Set(appearance.teamColors).size).toBe(6);
      appearance.teamColors.forEach((c) => expect(c).toMatch(/^#[0-9a-f]{6}$/i));
    }
  });
});
