import { describe, expect, it } from 'vitest';
import type { Board } from '../types/game';
import { gameReducer, createGame, getWinners, rankTeams, type GameAction } from './gameReducer';

function makeBoard(): Board {
  return {
    id: 'b1',
    name: 'Test',
    timerSeconds: 30,
    updatedAt: '2026-01-01T00:00:00.000Z',
    categories: [
      {
        id: 'c1',
        title: 'Tema 1',
        clues: [
          { id: 'q1', value: 100, question: 'Q1', answer: 'A1' },
          { id: 'q2', value: 200, question: 'Q2', answer: 'A2' },
        ],
      },
      {
        id: 'c2',
        title: 'Tema 2',
        clues: [{ id: 'q3', value: 300, question: 'Q3', answer: 'A3' }],
      },
    ],
  };
}

function run(actions: GameAction[]) {
  return actions.reduce(gameReducer, null);
}

describe('gameReducer', () => {
  it('starts a game with teams at zero', () => {
    const state = run([{ type: 'START_GAME', board: makeBoard(), teamNames: [' Rød ', 'Blå'] }]);
    expect(state?.teams.map((t) => [t.name, t.score])).toEqual([
      ['Rød', 0],
      ['Blå', 0],
    ]);
    expect(state?.phase).toBe('playing');
    expect(state?.usedClueIds).toEqual([]);
  });

  it('gives every new game its own id', () => {
    const a = createGame(makeBoard(), ['A', 'B']);
    const b = createGame(makeBoard(), ['A', 'B']);
    expect(a.id).toBeTruthy();
    expect(a.id).not.toBe(b.id);
  });

  it('ignores actions other than START_GAME when no game exists', () => {
    expect(gameReducer(null, { type: 'SELECT_CLUE', clueId: 'q1' })).toBeNull();
  });


  it('lets the team whose turn it is answer first', () => {
    let state = createGame(makeBoard(), ['A', 'B', 'C']);
    state = gameReducer(state, { type: 'SELECT_CLUE', clueId: 'q1' })!;
    expect(state.activeClueId).toBe('q1');
    expect(state.answeringTeamId).toBe(state.teams[0].id);
    expect(state.answerRevealed).toBe(false);
  });

  it('does not select unknown, used, or a second clue while one is active', () => {
    let state = createGame(makeBoard(), ['A', 'B']);
    expect(gameReducer(state, { type: 'SELECT_CLUE', clueId: 'nope' })).toBe(state);

    state = gameReducer(state, { type: 'SELECT_CLUE', clueId: 'q1' })!;
    expect(gameReducer(state, { type: 'SELECT_CLUE', clueId: 'q2' })).toBe(state);

    state = gameReducer(state, { type: 'REVEAL_ANSWER' })!;
    state = gameReducer(state, { type: 'FINISH_CLUE' })!;
    expect(gameReducer(state, { type: 'SELECT_CLUE', clueId: 'q1' })).toBe(state);
  });

  it('gives full points for a correct first answer and passes the turn', () => {
    let state = createGame(makeBoard(), ['A', 'B']);
    state = gameReducer(state, { type: 'SELECT_CLUE', clueId: 'q2' })!;
    state = gameReducer(state, { type: 'MARK_CORRECT' })!;
    expect(state.teams[0].score).toBe(200);
    expect(state.answerRevealed).toBe(true);
    expect(state.clueResult).toEqual({ teamId: state.teams[0].id, points: 200 });

    state = gameReducer(state, { type: 'FINISH_CLUE' })!;
    expect(state.usedClueIds).toEqual(['q2']);
    expect(state.activeClueId).toBeNull();
    expect(state.turnIndex).toBe(1);
  });

  it('passes a wrong answer to the next team, who gets half the points', () => {
    let state = createGame(makeBoard(), ['A', 'B', 'C']);
    const [a, b] = state.teams;
    state = gameReducer(state, { type: 'SELECT_CLUE', clueId: 'q3' })!;
    state = gameReducer(state, { type: 'MARK_WRONG' })!;
    expect(state.failedTeamIds).toEqual([a.id]);
    expect(state.answeringTeamId).toBe(b.id);
    expect(state.answerRevealed).toBe(false);

    state = gameReducer(state, { type: 'MARK_CORRECT' })!;
    expect(state.teams.map((t) => t.score)).toEqual([0, 150, 0]);
    expect(state.clueResult).toEqual({ teamId: b.id, points: 150 });

    // The turn moves on from the team that had the turn, not from the one who stole.
    state = gameReducer(state, { type: 'FINISH_CLUE' })!;
    expect(state.turnIndex).toBe(1);
  });

  it('keeps passing around the table and wraps from the last team', () => {
    let state = createGame(makeBoard(), ['A', 'B', 'C']);
    state = { ...state, turnIndex: 2 };
    state = gameReducer(state, { type: 'SELECT_CLUE', clueId: 'q1' })!;
    expect(state.answeringTeamId).toBe(state.teams[2].id);
    state = gameReducer(state, { type: 'MARK_WRONG' })!;
    expect(state.answeringTeamId).toBe(state.teams[0].id);
    state = gameReducer(state, { type: 'MARK_WRONG' })!;
    expect(state.answeringTeamId).toBe(state.teams[1].id);
    state = gameReducer(state, { type: 'MARK_CORRECT' })!;
    expect(state.teams[1].score).toBe(50);
    state = gameReducer(state, { type: 'FINISH_CLUE' })!;
    expect(state.turnIndex).toBe(0);
  });

  it('reveals with no points when every team answered wrong', () => {
    let state = createGame(makeBoard(), ['A', 'B']);
    state = gameReducer(state, { type: 'SELECT_CLUE', clueId: 'q1' })!;
    state = gameReducer(state, { type: 'MARK_WRONG' })!;
    state = gameReducer(state, { type: 'MARK_WRONG' })!;
    expect(state.answerRevealed).toBe(true);
    expect(state.answeringTeamId).toBeNull();
    expect(state.clueResult).toEqual({ teamId: null, points: 0 });
    expect(state.teams.every((t) => t.score === 0)).toBe(true);
    // Further answers are ignored once resolved.
    expect(gameReducer(state, { type: 'MARK_CORRECT' })).toBe(state);
  });

  it('can give up on a clue, revealing without points', () => {
    let state = createGame(makeBoard(), ['A', 'B']);
    state = gameReducer(state, { type: 'SELECT_CLUE', clueId: 'q1' })!;
    state = gameReducer(state, { type: 'REVEAL_ANSWER' })!;
    expect(state.answerRevealed).toBe(true);
    expect(state.clueResult).toEqual({ teamId: null, points: 0 });
    state = gameReducer(state, { type: 'FINISH_CLUE' })!;
    expect(state.usedClueIds).toEqual(['q1']);
    expect(state.turnIndex).toBe(1);
  });

  it('cannot back out of a chosen clue before it is resolved', () => {
    let state = createGame(makeBoard(), ['A', 'B']);
    state = gameReducer(state, { type: 'SELECT_CLUE', clueId: 'q1' })!;
    // Finishing an unresolved clue is ignored – it must be answered or given up first.
    expect(gameReducer(state, { type: 'FINISH_CLUE' })).toBe(state);
    // Choosing a different clue is ignored too.
    expect(gameReducer(state, { type: 'SELECT_CLUE', clueId: 'q2' })).toBe(state);
    expect(state.activeClueId).toBe('q1');
  });

  it('finishes the game when all clues are used', () => {
    let state = createGame(makeBoard(), ['A', 'B']);
    for (const clueId of ['q1', 'q2', 'q3']) {
      expect(state.phase).toBe('playing');
      state = gameReducer(state, { type: 'SELECT_CLUE', clueId })!;
      state = gameReducer(state, { type: 'MARK_CORRECT' })!;
      state = gameReducer(state, { type: 'FINISH_CLUE' })!;
    }
    expect(state.phase).toBe('finished');
    // Turns alternate A, B, A.
    expect(state.teams.map((t) => t.score)).toEqual([400, 200]);
  });

  it('adjusts scores manually, including below zero', () => {
    let state = createGame(makeBoard(), ['A', 'B']);
    const teamA = state.teams[0].id;
    state = gameReducer(state, { type: 'ADJUST_SCORE', teamId: teamA, delta: 100 })!;
    state = gameReducer(state, { type: 'ADJUST_SCORE', teamId: teamA, delta: -300 })!;
    expect(state.teams[0].score).toBe(-200);
  });

  it('can end the game early and reset', () => {
    let state = createGame(makeBoard(), ['A', 'B']);
    state = gameReducer(state, { type: 'END_GAME' })!;
    expect(state.phase).toBe('finished');
    expect(gameReducer(state, { type: 'RESET' })).toBeNull();
  });
});

describe('ranking helpers', () => {
  const teams = [
    { id: '1', name: 'A', score: 100, color: '#000000' },
    { id: '2', name: 'B', score: 300, color: '#000000' },
    { id: '3', name: 'C', score: 300, color: '#000000' },
  ];

  it('ranks teams by score descending', () => {
    expect(rankTeams(teams).map((t) => t.name)).toEqual(['B', 'C', 'A']);
  });

  it('returns all tied winners', () => {
    expect(getWinners(teams).map((t) => t.name)).toEqual(['B', 'C']);
    expect(getWinners([])).toEqual([]);
  });
});
