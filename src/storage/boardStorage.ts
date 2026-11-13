import { createSampleBoard } from '../data/sampleBoard';
import { cloneBoardWithNewIds, DEFAULT_TIMER_SECONDS } from '../game/boardUtils';
import type { Board, Category, Clue, GameState } from '../types/game';
import { createId } from '../utils/id';
import { teamColor } from '../styles/neon';

export const BOARDS_KEY = 'jeopardy.boards.v1';
export const GAME_KEY = 'jeopardy.game.v1';
export const EXPORT_VERSION = 1;

function safeParse(text: string | null): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ---------- Boards ----------

/** Loads boards from localStorage. Seeds a sample board the very first time. */
export function loadBoards(): Board[] {
  const raw = localStorage.getItem(BOARDS_KEY);
  if (raw === null) {
    const seeded = [createSampleBoard()];
    saveBoards(seeded);
    return seeded;
  }
  const parsed = safeParse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.map(toBoard).filter((b): b is Board => b !== null);
}

export function saveBoards(boards: Board[]): void {
  localStorage.setItem(BOARDS_KEY, JSON.stringify(boards));
}

export function getBoard(id: string): Board | undefined {
  return loadBoards().find((b) => b.id === id);
}

// ---------- Running game ----------

export function loadGame(): GameState | null {
  const parsed = safeParse(localStorage.getItem(GAME_KEY));
  if (!isObject(parsed)) return null;
  const board = toBoard(parsed.board);
  if (!board || !Array.isArray(parsed.teams) || !Array.isArray(parsed.usedClueIds)) return null;

  const teams = parsed.teams
    .filter(
      (t): t is Record<string, unknown> & { id: string; name: string; score: number } =>
        isObject(t) && typeof t.id === 'string' && typeof t.name === 'string' && typeof t.score === 'number',
    )
    .map((t, index) => ({
      id: t.id,
      name: t.name,
      score: t.score,
      // Games saved before team colours existed get a default colour.
      color: typeof t.color === 'string' ? t.color : teamColor(index),
    }));
  const teamIds = new Set(teams.map((t) => t.id));

  const turnIndex =
    typeof parsed.turnIndex === 'number' && Number.isInteger(parsed.turnIndex) && parsed.turnIndex >= 0
      ? parsed.turnIndex % Math.max(1, teams.length)
      : 0;
  const answeringTeamId =
    typeof parsed.answeringTeamId === 'string' && teamIds.has(parsed.answeringTeamId) ? parsed.answeringTeamId : null;
  const failedTeamIds = Array.isArray(parsed.failedTeamIds)
    ? parsed.failedTeamIds.filter((id): id is string => typeof id === 'string' && teamIds.has(id))
    : [];
  const rawResult = parsed.clueResult;
  const clueResult =
    isObject(rawResult) &&
    typeof rawResult.points === 'number' &&
    (rawResult.teamId === null || typeof rawResult.teamId === 'string')
      ? { teamId: rawResult.teamId as string | null, points: rawResult.points }
      : null;

  let activeClueId = typeof parsed.activeClueId === 'string' ? parsed.activeClueId : null;
  let answerRevealed = parsed.answerRevealed === true;
  // A clue that is open but in an inconsistent state (e.g. saved by an older version) is cancelled.
  if (activeClueId !== null && (answerRevealed ? clueResult === null : answeringTeamId === null)) {
    activeClueId = null;
    answerRevealed = false;
  }
  const clueOpen = activeClueId !== null;

  return {
    board,
    teams,
    usedClueIds: parsed.usedClueIds.filter((id): id is string => typeof id === 'string'),
    activeClueId,
    answerRevealed,
    phase: parsed.phase === 'finished' ? 'finished' : 'playing',
    turnIndex,
    answeringTeamId: clueOpen ? answeringTeamId : null,
    failedTeamIds: clueOpen ? failedTeamIds : [],
    clueResult: clueOpen ? clueResult : null,
  };
}

export function saveGame(game: GameState | null): void {
  if (game === null) localStorage.removeItem(GAME_KEY);
  else localStorage.setItem(GAME_KEY, JSON.stringify(game));
}

// ---------- Import / export ----------

export function exportBoardsJson(boards: Board[]): string {
  return JSON.stringify({ version: EXPORT_VERSION, boards }, null, 2);
}

/**
 * Parses an exported JSON file. Accepts `{ boards: [...] }`, a plain array of boards,
 * or a single board object. Imported boards always get fresh ids to avoid collisions.
 * Throws if nothing valid could be read.
 */
export function parseBoardsJson(text: string): Board[] {
  const parsed = safeParse(text);
  let candidates: unknown[];
  if (Array.isArray(parsed)) candidates = parsed;
  else if (isObject(parsed) && Array.isArray(parsed.boards)) candidates = parsed.boards;
  else if (isObject(parsed) && Array.isArray(parsed.categories)) candidates = [parsed];
  else throw new Error('Invalid JSON format');

  const boards = candidates.map(toBoard).filter((b): b is Board => b !== null);
  if (boards.length === 0) throw new Error('No valid boards found');
  return boards.map((b) => cloneBoardWithNewIds(b));
}

export function downloadJson(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- Runtime validation of untrusted data ----------

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toClue(value: unknown): Clue | null {
  if (!isObject(value)) return null;
  if (typeof value.question !== 'string' || typeof value.answer !== 'string') return null;
  const numeric = Number(value.value);
  return {
    id: typeof value.id === 'string' ? value.id : createId(),
    value: Number.isFinite(numeric) ? numeric : 0,
    question: value.question,
    answer: value.answer,
  };
}

function toCategory(value: unknown): Category | null {
  if (!isObject(value) || typeof value.title !== 'string' || !Array.isArray(value.clues)) return null;
  return {
    id: typeof value.id === 'string' ? value.id : createId(),
    title: value.title,
    clues: value.clues.map(toClue).filter((c): c is Clue => c !== null),
  };
}

function toBoard(value: unknown): Board | null {
  if (!isObject(value) || typeof value.name !== 'string' || !Array.isArray(value.categories)) return null;
  const timer = Number(value.timerSeconds);
  return {
    id: typeof value.id === 'string' ? value.id : createId(),
    name: value.name,
    timerSeconds: Number.isFinite(timer) && timer > 0 ? timer : DEFAULT_TIMER_SECONDS,
    categories: value.categories.map(toCategory).filter((c): c is Category => c !== null),
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date().toISOString(),
  };
}
