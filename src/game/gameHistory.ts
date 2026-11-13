import type { GameState } from '../types/game';
import { gameReducer, type GameAction } from './gameReducer';

/** How many host actions can be undone. */
export const MAX_UNDO = 20;

export interface GameHistory {
  present: GameState | null;
  /** Earlier states, most recent last. Kept in memory only. */
  past: GameState[];
}

export type HistoryAction = GameAction | { type: 'UNDO' };

/** Host decisions that can be taken back (e.g. after a misclick). */
const UNDOABLE: ReadonlySet<GameAction['type']> = new Set([
  'MARK_CORRECT',
  'MARK_WRONG',
  'REVEAL_ANSWER',
  'FINISH_CLUE',
  'ADJUST_SCORE',
]);

export function createHistory(present: GameState | null): GameHistory {
  return { present, past: [] };
}

/**
 * Wraps the game reducer with undo. Choosing a clue, starting/ending a game
 * and resetting clear the history, so a chosen clue can never be undone.
 */
export function historyReducer(history: GameHistory, action: HistoryAction): GameHistory {
  if (action.type === 'UNDO') {
    if (history.past.length === 0) return history;
    return { present: history.past[history.past.length - 1], past: history.past.slice(0, -1) };
  }

  const next = gameReducer(history.present, action);
  if (next === history.present) return history;

  if (UNDOABLE.has(action.type) && history.present !== null) {
    return { present: next, past: [...history.past, history.present].slice(-MAX_UNDO) };
  }
  return { present: next, past: [] };
}
