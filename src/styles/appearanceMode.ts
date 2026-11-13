import { useCallback, useMemo } from 'react';
import type { Team } from '../types/game';
import { createPersistedSetting } from '../storage/persistedSetting';
import { appearances, type Appearance, type AppearanceId } from './appearance';

export const THEME_KEY = 'jeopardy.theme.v1';

const themeSetting = createPersistedSetting<AppearanceId>(THEME_KEY, 'neon', ['neon', 'christmas']);

/** Global, persisted Christmas theme on/off (off by default). */
export function useChristmasMode(): [boolean, (enabled: boolean) => void] {
  const [value, setValue] = themeSetting.useSetting();
  const setEnabled = useCallback((enabled: boolean) => setValue(enabled ? 'christmas' : 'neon'), [setValue]);
  return [value === 'christmas', setEnabled];
}

/** The active visual theme. */
export function useAppearance(): Appearance {
  const [value] = themeSetting.useSetting();
  return appearances[value];
}

/** A team plus its display colour. Colours are presentation only and never stored. */
export type ColoredTeam = Team & { color: string };

export function colorTeams(teams: Team[], teamColors: readonly string[]): ColoredTeam[] {
  return teams.map((team, index) => ({ ...team, color: teamColors[index % teamColors.length] }));
}

/** Teams with colours from the active theme, by seating order. */
export function useThemedTeams(teams: Team[]): ColoredTeam[] {
  const { teamColors } = useAppearance();
  return useMemo(() => colorTeams(teams, teamColors), [teams, teamColors]);
}
