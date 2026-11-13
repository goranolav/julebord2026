import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App';
import { BoardsProvider } from './game/BoardsContext';
import { GameProvider } from './game/GameContext';
import { theme } from './theme';

function renderApp(path = '/') {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[path]}>
        <BoardsProvider>
          <GameProvider>
            <App />
          </GameProvider>
        </BoardsProvider>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('App smoke test', () => {
  it('plays turn-based: wrong answer passes, the next team steals for half', async () => {
    const user = userEvent.setup();
    renderApp();

    expect(screen.getByText('Eksempelbrett')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: /spill/i }));

    await user.clear(screen.getByLabelText('Lagnavn 1'));
    await user.type(screen.getByLabelText('Lagnavn 1'), 'Rød');
    await user.clear(screen.getByLabelText('Lagnavn 2'));
    await user.type(screen.getByLabelText('Lagnavn 2'), 'Blå');
    await user.click(screen.getByRole('button', { name: /start spill/i }));

    expect(screen.getByText('Rød sin tur – velg et spørsmål')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Norsk geografi, 200' }));
    expect(screen.getByText('Hva heter Norges lengste elv?')).toBeInTheDocument();
    expect(screen.getByText('Rød svarer')).toBeInTheDocument();
    expect(screen.getByRole('timer')).toHaveTextContent('30 s');
    expect(screen.queryByText('Glomma')).not.toBeInTheDocument();

    // A chosen clue cannot be backed out of.
    expect(screen.queryByRole('button', { name: /lukk/i })).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.getByText('Rød svarer')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^feil$/i }));
    expect(screen.getByText('Blå svarer')).toBeInTheDocument();
    expect(screen.getByText(/halv poengsum: 100 poeng/)).toBeInTheDocument();
    expect(screen.queryByText('Glomma')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^riktig$/i }));
    expect(screen.getByText('Glomma')).toBeInTheDocument();
    expect(screen.getByText('Blå får 100 poeng!')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /fortsett/i }));

    const scoreboard = screen.getByRole('region', { name: 'Poengtavle' });
    // Score counts up with an animation, so wait for the final value.
    await waitFor(() => expect(within(scoreboard).getByLabelText('Blå: 100 poeng')).toHaveTextContent('100'));
    expect(screen.getByRole('button', { name: 'Norsk geografi, 200' })).toBeDisabled();
    expect(screen.getByText('Blå sin tur – velg et spørsmål')).toBeInTheDocument();
  });

  it('opens the admin editor for the sample board', async () => {
    const user = userEvent.setup();
    renderApp('/admin');
    await user.click(screen.getByText('Eksempelbrett'));
    expect(screen.getByDisplayValue('Norsk geografi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /lagre/i })).toBeDisabled();
  });
});
