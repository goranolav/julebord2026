import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { BoardsProvider } from '../game/BoardsContext';
import { createSampleBoard } from '../data/sampleBoard';
import { saveBoards } from '../storage/boardStorage';
import { theme } from '../theme';
import AnswerSheetPage from './AnswerSheetPage';

function renderSheet(boardId: string) {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[`/fasit/${boardId}`]}>
        <BoardsProvider>
          <Routes>
            <Route path="/fasit/:boardId" element={<AnswerSheetPage />} />
          </Routes>
        </BoardsProvider>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('AnswerSheetPage', () => {
  it('shows categories, points and answers but not the question text', () => {
    const board = createSampleBoard();
    board.categories[0].clues[1].imageUrl = 'https://example.com/elv.jpg';
    saveBoards([board]);
    renderSheet(board.id);

    expect(screen.getByText(`Fasit: ${board.name}`)).toBeInTheDocument();
    for (const category of board.categories) {
      expect(screen.getByRole('columnheader', { name: category.title })).toBeInTheDocument();
      for (const clue of category.clues) {
        const cell = screen.getByTestId(`answer-${clue.id}`);
        expect(cell).toHaveTextContent(clue.answer);
        expect(cell).toHaveTextContent(String(clue.value));
        expect(cell).not.toHaveTextContent(clue.question);
      }
    }
    // Clues with an image are marked.
    const imageCell = screen.getByTestId(`answer-${board.categories[0].clues[1].id}`);
    expect(within(imageCell).getByLabelText('Spørsmålet har bilde')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Spørsmålet har bilde')).toHaveLength(1);
  });

  it('lays out the board with categories as columns and clue levels as rows', () => {
    const board = createSampleBoard();
    saveBoards([board]);
    renderSheet(board.id);
    const rows = screen.getAllByRole('row');
    // Header row + 5 clue rows, 5 categories each.
    expect(rows).toHaveLength(6);
    expect(within(rows[1]).getAllByRole('cell')).toHaveLength(5);
    expect(within(rows[1]).getByText('Oslo')).toBeInTheDocument();
    expect(within(rows[5]).getByText('Tromsø')).toBeInTheDocument();
  });

  it('prints with the print button', async () => {
    const board = createSampleBoard();
    saveBoards([board]);
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    renderSheet(board.id);
    await userEvent.setup().click(screen.getByRole('button', { name: /skriv ut/i }));
    expect(print).toHaveBeenCalledTimes(1);
    print.mockRestore();
  });

  it('shows an error for an unknown board', () => {
    saveBoards([createSampleBoard()]);
    renderSheet('finnes-ikke');
    expect(screen.getByText('Fant ikke brettet.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /skriv ut/i })).not.toBeInTheDocument();
  });
});
