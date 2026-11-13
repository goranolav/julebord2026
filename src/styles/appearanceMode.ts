import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type { Team } from '../types/game';
import { appearances, type Appearance } from './appearance';

export const THEME_KEY = 'jeopardy.theme.v1';

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readChristmas(): boolean {
  return localStorage.getItem(THEME_KEY) === 'christmas';
}

/** Global, persisted Christmas theme on/off (off by default). */
export function useChristmasMode(): [boolean, (enabled: boolean) => void] {
  const enabled = useSyncExternalStore(subscribe, readChristmas, () => false);
  const setEnabled = useCallback((value: boolean) => {
    localStorage.setItem(THEME_KEY, value ? 'christmas' : 'neon');
    listeners.forEach((listener) => listener());
  }, []);
  return [enabled, setEnabled];
}

/** The active visual theme. */
export function useAppearance(): Appearance {
  const [christmas] = useChristmasMode();
  return christmas ? appearances.christmas : appearances.neon;
}

/** Teams with colours taken from the active theme (by seating order). */
export function useThemedTeams(teams: Team[]): Team[] {
  const { teamColors } = useAppearance();
  return useMemo(
    () => teams.map((team, index) => ({ ...team, color: teamColors[index % teamColors.length] })),
    [teams, teamColors],
  );
}
