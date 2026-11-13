import { useEffect, useState } from 'react';

/** Game ids whose board intro has already played in this browser session. */
const playedIntros = new Set<string>();

/** True the first time the board is shown for a given game, false afterwards. */
export function useBoardIntro(gameId: string | null): boolean {
  const [animate] = useState(() => gameId !== null && !playedIntros.has(gameId));
  useEffect(() => {
    if (gameId !== null) playedIntros.add(gameId);
  }, [gameId]);
  return animate;
}
