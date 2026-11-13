import { describe, expect, it, vi } from 'vitest';
import { createEmptyBoard, validateBoard } from '../game/boardUtils';
import { createSampleBoard } from '../data/sampleBoard';
import { createGame } from '../game/gameReducer';
import { onStorageError } from './safeStorage';
import {
  BOARDS_KEY,
  exportBoardsJson,
  GAME_KEY,
  loadBoards,
  loadGame,
  parseBoardsJson,
  saveBoards,
  saveGame,
} from './boardStorage';

describe('boardStorage', () => {
  it('seeds a valid sample board on first load', () => {
    const boards = loadBoards();
    expect(boards).toHaveLength(1);
    expect(validateBoard(boards[0])).toEqual([]);
    expect(localStorage.getItem(BOARDS_KEY)).not.toBeNull();
  });

  it('does not re-seed when the user has deleted all boards', () => {
    saveBoards([]);
    expect(loadBoards()).toEqual([]);
  });

  it('round-trips boards through save and load', () => {
    const board = createSampleBoard();
    saveBoards([board]);
    expect(loadBoards()).toEqual([board]);
  });

  it('returns an empty list for corrupt storage', () => {
    localStorage.setItem(BOARDS_KEY, '{not json');
    expect(loadBoards()).toEqual([]);
  });

  it('upgrades older saved games: drops stored colours and adds a game id', () => {
    const board = createSampleBoard();
    localStorage.setItem(
      GAME_KEY,
      JSON.stringify({
        board,
        teams: [{ id: 't1', name: 'Rød', score: 100, color: '#123456' }],
        usedClueIds: [],
        phase: 'playing',
      }),
    );
    const game = loadGame()!;
    expect(game.teams[0]).toEqual({ id: 't1', name: 'Rød', score: 100 });
    expect(game.id).toBeTruthy();
  });

  it('does not crash when the browser refuses to save, and reports it', () => {
    const errors: string[] = [];
    const unsubscribe = onStorageError((key) => errors.push(key));
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });
    expect(() => saveBoards([createSampleBoard()])).not.toThrow();
    expect(() => saveGame(createGame(createSampleBoard(), ['A', 'B']))).not.toThrow();
    expect(errors).toEqual([BOARDS_KEY, GAME_KEY]);
    setItem.mockRestore();
    unsubscribe();
  });

  it('upgrades older saved games to turn-based state', () => {
    const board = createSampleBoard();
    const clueId = board.categories[0].clues[0].id;
    localStorage.setItem(
      GAME_KEY,
      JSON.stringify({
        board,
        teams: [{ id: 't1', name: 'Rød', score: 0 }],
        usedClueIds: [],
        activeClueId: clueId,
        answerRevealed: false,
        phase: 'playing',
      }),
    );
    const game = loadGame()!;
    expect(game.turnIndex).toBe(0);
    // The half-open clue from the old version is cancelled rather than left in a broken state.
    expect(game.activeClueId).toBeNull();
    expect(game.answeringTeamId).toBeNull();
    expect(game.failedTeamIds).toEqual([]);
    expect(game.clueResult).toBeNull();
  });

  it('round-trips a turn-based game in progress', () => {
    const board = createSampleBoard();
    const game = {
      id: 'g1',
      board,
      teams: [
        { id: 't1', name: 'A', score: 0 },
        { id: 't2', name: 'B', score: 0 },
      ],
      usedClueIds: [],
      activeClueId: board.categories[0].clues[0].id,
      answerRevealed: false,
      phase: 'playing' as const,
      turnIndex: 1,
      answeringTeamId: 't1',
      failedTeamIds: ['t2'],
      clueResult: null,
    };
    saveGame(game);
    expect(loadGame()).toEqual(game);
  });
});

describe('import / export', () => {
  it('imports what it exports, with new ids', () => {
    const board = createSampleBoard();
    const imported = parseBoardsJson(exportBoardsJson([board]));
    expect(imported).toHaveLength(1);
    expect(imported[0].id).not.toBe(board.id);
    expect(imported[0].name).toBe(board.name);
    expect(imported[0].categories[0].clues[0].question).toBe(board.categories[0].clues[0].question);
  });

  it('accepts a single board object and a plain array', () => {
    const board = createSampleBoard();
    expect(parseBoardsJson(JSON.stringify(board))).toHaveLength(1);
    expect(parseBoardsJson(JSON.stringify([board, board]))).toHaveLength(2);
  });

  it('throws on invalid input', () => {
    expect(() => parseBoardsJson('not json')).toThrow();
    expect(() => parseBoardsJson('{"foo": 1}')).toThrow();
    expect(() => parseBoardsJson('{"boards": [{"bad": true}]}')).toThrow();
  });
});

describe('validateBoard', () => {
  it('reports empty fields on a new board', () => {
    const errors = validateBoard(createEmptyBoard('Nytt'));
    expect(errors.length).toBeGreaterThan(0);
  });

  it('requires a name and a sensible timer', () => {
    const board = { ...createSampleBoard(), name: ' ', timerSeconds: 1 };
    expect(validateBoard(board)).toHaveLength(2);
  });

  it('accepts empty or http(s) image links and rejects others', () => {
    const withImage = (imageUrl: string) => {
      const board = createSampleBoard();
      board.categories[0].clues[0].imageUrl = imageUrl;
      return validateBoard(board);
    };
    expect(withImage('')).toEqual([]);
    expect(withImage('https://example.com/bilde.jpg')).toEqual([]);
    expect(withImage('http://example.com/bilde.png')).toEqual([]);
    expect(withImage('javascript:alert(1)')).toHaveLength(1);
    expect(withImage('bare tekst')).toHaveLength(1);
    expect(withImage('data:image/png;base64,AAAA')).toHaveLength(1);
  });
});

describe('clue images in import / export', () => {
  it('keeps imageUrl through export and import', () => {
    const board = createSampleBoard();
    board.categories[0].clues[0].imageUrl = 'https://example.com/oslo.jpg';
    const [imported] = parseBoardsJson(exportBoardsJson([board]));
    expect(imported.categories[0].clues[0].imageUrl).toBe('https://example.com/oslo.jpg');
    expect(imported.categories[0].clues[1]).not.toHaveProperty('imageUrl');
  });

  it('drops non-string or blank imageUrl values', () => {
    const board = createSampleBoard();
    const raw = JSON.parse(exportBoardsJson([board]));
    raw.boards[0].categories[0].clues[0].imageUrl = 42;
    raw.boards[0].categories[0].clues[1].imageUrl = '   ';
    const [imported] = parseBoardsJson(JSON.stringify(raw));
    expect(imported.categories[0].clues[0]).not.toHaveProperty('imageUrl');
    expect(imported.categories[0].clues[1]).not.toHaveProperty('imageUrl');
  });
});
