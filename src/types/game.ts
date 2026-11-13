export interface Clue {
  id: string;
  value: number;
  question: string;
  answer: string;
}

export interface Category {
  id: string;
  title: string;
  clues: Clue[];
}

export interface Board {
  id: string;
  name: string;
  timerSeconds: number;
  categories: Category[];
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  score: number;
  /** Neon colour used for this team throughout the game UI. */
  color: string;
}

export type GamePhase = 'playing' | 'finished';

export interface ClueResult {
  /** Team that answered correctly, or null if nobody did. */
  teamId: string | null;
  points: number;
}

export interface GameState {
  /** Snapshot of the board, so editing in admin never breaks a running game. */
  board: Board;
  teams: Team[];
  usedClueIds: string[];
  activeClueId: string | null;
  answerRevealed: boolean;
  phase: GamePhase;
  /** Index of the team whose turn it is to pick (and first answer) a clue. */
  turnIndex: number;
  /** Team currently allowed to answer the active clue. */
  answeringTeamId: string | null;
  /** Teams that already answered the active clue wrong. */
  failedTeamIds: string[];
  /** Outcome of the active clue once it has been resolved. */
  clueResult: ClueResult | null;
}
