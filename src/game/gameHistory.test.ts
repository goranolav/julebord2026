import { describe, expect, it } from 'vitest';
import type { Board } from '../types/game';
import { createGame } from './gameReducer';
import { createHistory, historyReducer, MAX_UNDO, type GameHistory, type HistoryAction } from './gameHistory';

const board: Board = {
  id: 'b1',
  name: 'Test',
  timerSeconds: 30,
  updatedAt: '2026-01-01T00:00:00.000Z',
  categories: [
    {
      id: 'c1',
      title: 'Tema',
      clues: [
        { id: 'q1', value: 100, question: 'Q1', answer: 'A1' },
        { id: 'q2', value: 200, question: 'Q2', answer: 'A2' },
      ],
    },
  ],
};

function run(history: GameHistory, ...actions: HistoryAction[]): GameHistory {
  return actions.reduce(historyReducer, history);
}

const start = () => createHistory(createGame(board, ['A', 'B']));

describe('undo history', () => {
  it('undoes a correct answer: points and answering team come back', () => {
    let h = run(start(), { type: 'SELECT_CLUE', clueId: 'q2' }, { type: 'MARK_CORRECT' });
    expect(h.present!.teams[0].score).toBe(200);
    h = run(h, { type: 'UNDO' });
    expect(h.present!.teams[0].score).toBe(0);
    expect(h.present!.answerRevealed).toBe(false);
    expect(h.present!.answeringTeamId).toBe(h.present!.teams[0].id);
  });

  it('undoes a wrong answer, giving the clue back to the first team', () => {
    let h = run(start(), { type: 'SELECT_CLUE', clueId: 'q1' }, { type: 'MARK_WRONG' });
    expect(h.present!.answeringTeamId).toBe(h.present!.teams[1].id);
    h = run(h, { type: 'UNDO' });
    expect(h.present!.answeringTeamId).toBe(h.present!.teams[0].id);
    expect(h.present!.failedTeamIds).toEqual([]);
  });

  it('undoing "continue" reopens the clue and takes the turn back', () => {
    let h = run(start(), { type: 'SELECT_CLUE', clueId: 'q1' }, { type: 'MARK_CORRECT' }, { type: 'FINISH_CLUE' });
    expect(h.present!.turnIndex).toBe(1);
    h = run(h, { type: 'UNDO' });
    expect(h.present!.activeClueId).toBe('q1');
    expect(h.present!.usedClueIds).toEqual([]);
    expect(h.present!.turnIndex).toBe(0);
  });

  it('never undoes past choosing a clue', () => {
    let h = run(start(), { type: 'SELECT_CLUE', clueId: 'q1' });
    expect(h.past).toEqual([]);
    h = run(h, { type: 'MARK_WRONG' }, { type: 'UNDO' }, { type: 'UNDO' }, { type: 'UNDO' });
    expect(h.present!.activeClueId).toBe('q1');

    // After the next clue is chosen, the previous clue can no longer be reopened.
    h = run(h, { type: 'REVEAL_ANSWER' }, { type: 'FINISH_CLUE' }, { type: 'SELECT_CLUE', clueId: 'q2' });
    expect(h.past).toEqual([]);
  });

  it('undoes manual score adjustments', () => {
    const h0 = start();
    const teamId = h0.present!.teams[1].id;
    const h = run(h0, { type: 'ADJUST_SCORE', teamId, delta: 100 }, { type: 'UNDO' });
    expect(h.present!.teams[1].score).toBe(0);
  });

  it('ignores no-op actions and caps the history', () => {
    const h0 = start();
    expect(run(h0, { type: 'MARK_CORRECT' })).toBe(h0);
    expect(run(h0, { type: 'UNDO' })).toBe(h0);
    const teamId = h0.present!.teams[0].id;
    const many = Array.from({ length: MAX_UNDO + 5 }, () => ({ type: 'ADJUST_SCORE' as const, teamId, delta: 1 }));
    expect(run(h0, ...many).past).toHaveLength(MAX_UNDO);
  });

  it('starting a new game clears the history', () => {
    const teamId = start().present!.teams[0].id;
    const h = run(start(), { type: 'ADJUST_SCORE', teamId, delta: 100 }, {
      type: 'START_GAME',
      board,
      teamNames: ['X', 'Y'],
    });
    expect(h.past).toEqual([]);
  });
});
