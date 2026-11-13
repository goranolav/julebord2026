import type { Board, GameState, Team } from '../types/game';
import { createId } from '../utils/id';
import { teamColor } from '../styles/neon';
import { countClues, findClue } from './boardUtils';

export const MIN_TEAMS = 2;
export const MAX_TEAMS = 6;

export type GameAction =
  | { type: 'START_GAME'; board: Board; teamNames: string[] }
  | { type: 'SELECT_CLUE'; clueId: string }
  /** The answering team answered correctly. */
  | { type: 'MARK_CORRECT' }
  /** The answering team answered wrong; the clue passes to the next team. */
  | { type: 'MARK_WRONG' }
  /** Give up on the clue: reveal the answer without awarding points. */
  | { type: 'REVEAL_ANSWER' }
  /** Mark the resolved clue as used and pass the turn to the next team. */
  | { type: 'FINISH_CLUE' }
  | { type: 'ADJUST_SCORE'; teamId: string; delta: number }
  | { type: 'END_GAME' }
  | { type: 'RESET' };

const clearedClue = {
  activeClueId: null,
  answerRevealed: false,
  answeringTeamId: null,
  failedTeamIds: [],
  clueResult: null,
} satisfies Partial<GameState>;

export function createGame(board: Board, teamNames: string[]): GameState {
  const teams: Team[] = teamNames.map((name, index) => ({
    id: createId(),
    name: name.trim(),
    score: 0,
    color: teamColor(index),
  }));
  return {
    board,
    teams,
    usedClueIds: [],
    phase: 'playing',
    turnIndex: 0,
    ...clearedClue,
  };
}

/** Points for a correct answer after another team has answered wrong. */
export function stealValue(value: number): number {
  return Math.round(value / 2);
}

/** Points the currently answering team would get for a correct answer. */
export function currentClueValue(value: number, failedCount: number): number {
  return failedCount === 0 ? value : stealValue(value);
}

export function currentTurnTeam(state: GameState): Team | undefined {
  if (state.teams.length === 0) return undefined;
  return state.teams[state.turnIndex % state.teams.length];
}

/** Next team (in seating order after `fromTeamId`) that has not yet answered wrong. */
export function nextAnsweringTeam(teams: Team[], fromTeamId: string, failedTeamIds: string[]): Team | null {
  const start = teams.findIndex((t) => t.id === fromTeamId);
  for (let step = 1; step < teams.length; step++) {
    const candidate = teams[(start + step) % teams.length];
    if (!failedTeamIds.includes(candidate.id)) return candidate;
  }
  return null;
}

export function isClueUsed(state: GameState, clueId: string): boolean {
  return state.usedClueIds.includes(clueId);
}

export function allCluesUsed(state: GameState): boolean {
  return state.usedClueIds.length >= countClues(state.board);
}

/** Teams sorted by score (highest first). Stable for equal scores. */
export function rankTeams(teams: Team[]): Team[] {
  return [...teams].sort((a, b) => b.score - a.score);
}

/** All teams sharing the top score (more than one = tie). Empty if no teams. */
export function getWinners(teams: Team[]): Team[] {
  if (teams.length === 0) return [];
  const top = Math.max(...teams.map((t) => t.score));
  return teams.filter((t) => t.score === top);
}

function finishClue(state: GameState): GameState {
  if (state.activeClueId === null || !state.answerRevealed) return state;
  const next: GameState = {
    ...state,
    ...clearedClue,
    usedClueIds: [...state.usedClueIds, state.activeClueId],
    turnIndex: (state.turnIndex + 1) % Math.max(1, state.teams.length),
  };
  return allCluesUsed(next) ? { ...next, phase: 'finished' } : next;
}

export function gameReducer(state: GameState | null, action: GameAction): GameState | null {
  if (action.type === 'START_GAME') return createGame(action.board, action.teamNames);
  if (action.type === 'RESET') return null;
  if (state === null) return state;

  const resolving = state.activeClueId !== null && !state.answerRevealed;

  switch (action.type) {
    case 'SELECT_CLUE': {
      if (state.phase !== 'playing' || state.activeClueId !== null) return state;
      if (isClueUsed(state, action.clueId) || !findClue(state.board, action.clueId)) return state;
      const turnTeam = currentTurnTeam(state);
      if (!turnTeam) return state;
      return { ...state, ...clearedClue, activeClueId: action.clueId, answeringTeamId: turnTeam.id };
    }

    case 'MARK_CORRECT': {
      if (!resolving || state.answeringTeamId === null) return state;
      const found = findClue(state.board, state.activeClueId!);
      if (!found) return state;
      const teamId = state.answeringTeamId;
      const points = currentClueValue(found.clue.value, state.failedTeamIds.length);
      return {
        ...state,
        teams: state.teams.map((t) => (t.id === teamId ? { ...t, score: t.score + points } : t)),
        answerRevealed: true,
        answeringTeamId: null,
        clueResult: { teamId, points },
      };
    }

    case 'MARK_WRONG': {
      if (!resolving || state.answeringTeamId === null) return state;
      const failedTeamIds = [...state.failedTeamIds, state.answeringTeamId];
      const next = nextAnsweringTeam(state.teams, state.answeringTeamId, failedTeamIds);
      if (next) return { ...state, failedTeamIds, answeringTeamId: next.id };
      return {
        ...state,
        failedTeamIds,
        answeringTeamId: null,
        answerRevealed: true,
        clueResult: { teamId: null, points: 0 },
      };
    }

    case 'REVEAL_ANSWER': {
      if (!resolving) return state;
      return { ...state, answerRevealed: true, answeringTeamId: null, clueResult: { teamId: null, points: 0 } };
    }

    case 'FINISH_CLUE':
      return finishClue(state);

    case 'ADJUST_SCORE':
      return {
        ...state,
        teams: state.teams.map((team) =>
          team.id === action.teamId ? { ...team, score: team.score + action.delta } : team,
        ),
      };

    case 'END_GAME':
      return { ...state, ...clearedClue, phase: 'finished' };

    default:
      return state;
  }
}
