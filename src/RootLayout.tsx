import { Outlet } from 'react-router-dom';
import { BoardsProvider } from './game/BoardsContext';
import { GameProvider } from './game/GameContext';

/** Providers live inside the router so pages can use both router and app state. */
export default function RootLayout() {
  return (
    <BoardsProvider>
      <GameProvider>
        <Outlet />
      </GameProvider>
    </BoardsProvider>
  );
}
