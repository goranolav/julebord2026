import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { loadGame, saveGame } from '../storage/boardStorage';
import type { GameState } from '../types/game';
import { createHistory, historyReducer, type HistoryAction } from './gameHistory';

interface GameContextValue {
  game: GameState | null;
  dispatch: (action: HistoryAction) => void;
  undo: () => void;
  canUndo: boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [history, dispatch] = useReducer(historyReducer, null, () => createHistory(loadGame()));
  const game = history.present;

  useEffect(() => {
    saveGame(game);
  }, [game]);

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const canUndo = history.past.length > 0;
  const value = useMemo(() => ({ game, dispatch, undo, canUndo }), [game, undo, canUndo]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>');
  return ctx;
}
