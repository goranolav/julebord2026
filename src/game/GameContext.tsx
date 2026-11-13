import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import { loadGame, saveGame } from '../storage/boardStorage';
import type { GameState } from '../types/game';
import { gameReducer, type GameAction } from './gameReducer';

interface GameContextValue {
  game: GameState | null;
  dispatch: Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, dispatch] = useReducer(gameReducer, null, loadGame);

  useEffect(() => {
    saveGame(game);
  }, [game]);

  return <GameContext.Provider value={{ game, dispatch }}>{children}</GameContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>');
  return ctx;
}
