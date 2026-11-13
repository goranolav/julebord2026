import { no } from '../i18n/no';
import type { Board, Category, Clue } from '../types/game';
import { createId } from '../utils/id';

export const MIN_TIMER_SECONDS = 5;
export const MAX_TIMER_SECONDS = 300;
export const DEFAULT_TIMER_SECONDS = 30;
export const DEFAULT_CATEGORY_COUNT = 5;
export const DEFAULT_CLUES_PER_CATEGORY = 5;
export const VALUE_STEP = 100;

export function createEmptyClue(value: number): Clue {
  return { id: createId(), value, question: '', answer: '' };
}

export function createEmptyCategory(clueCount = DEFAULT_CLUES_PER_CATEGORY): Category {
  return {
    id: createId(),
    title: '',
    clues: Array.from({ length: clueCount }, (_, i) => createEmptyClue((i + 1) * VALUE_STEP)),
  };
}

export function createEmptyBoard(name: string): Board {
  return {
    id: createId(),
    name,
    timerSeconds: DEFAULT_TIMER_SECONDS,
    categories: Array.from({ length: DEFAULT_CATEGORY_COUNT }, () => createEmptyCategory()),
    updatedAt: new Date().toISOString(),
  };
}

/** Deep copy with fresh ids for the board, categories and clues. */
export function cloneBoardWithNewIds(board: Board, name = board.name): Board {
  return {
    ...board,
    id: createId(),
    name,
    updatedAt: new Date().toISOString(),
    categories: board.categories.map((category) => ({
      ...category,
      id: createId(),
      clues: category.clues.map((clue) => ({ ...clue, id: createId() })),
    })),
  };
}

export function nextClueValue(category: Category): number {
  const max = category.clues.reduce((acc, clue) => Math.max(acc, clue.value), 0);
  return max + VALUE_STEP;
}

export function countClues(board: Board): number {
  return board.categories.reduce((acc, category) => acc + category.clues.length, 0);
}

export function findClue(board: Board, clueId: string): { category: Category; clue: Clue } | null {
  for (const category of board.categories) {
    const clue = category.clues.find((c) => c.id === clueId);
    if (clue) return { category, clue };
  }
  return null;
}

/** Returns a list of human-readable (Norwegian) validation errors. Empty list = valid. */
export function validateBoard(board: Board): string[] {
  const errors: string[] = [];
  const v = no.validation;

  if (!board.name.trim()) errors.push(v.boardNameRequired);

  if (
    !Number.isFinite(board.timerSeconds) ||
    board.timerSeconds < MIN_TIMER_SECONDS ||
    board.timerSeconds > MAX_TIMER_SECONDS
  ) {
    errors.push(v.timerRange(MIN_TIMER_SECONDS, MAX_TIMER_SECONDS));
  }

  if (board.categories.length === 0) errors.push(v.atLeastOneCategory);

  board.categories.forEach((category, categoryIndex) => {
    const title = category.title.trim();
    if (!title) errors.push(v.categoryTitleRequired(categoryIndex + 1));
    const label = title || `${no.editor.category} ${categoryIndex + 1}`;

    if (category.clues.length === 0) errors.push(v.categoryNeedsClues(label));

    category.clues.forEach((clue, clueIndex) => {
      if (!clue.question.trim()) errors.push(v.clueQuestionRequired(label, clueIndex + 1));
      if (!clue.answer.trim()) errors.push(v.clueAnswerRequired(label, clueIndex + 1));
      if (!Number.isFinite(clue.value) || clue.value <= 0) {
        errors.push(v.clueValuePositive(label, clueIndex + 1));
      }
    });
  });

  return errors;
}
