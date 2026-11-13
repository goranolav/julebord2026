import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { routes } from './routes';
import AppShell from './AppShell';
import { THEME_KEY } from './styles/appearanceMode';
import { createSampleBoard } from './data/sampleBoard';
import { saveBoards } from './storage/boardStorage';

function renderApp(path = '/') {
  return render(
    <AppShell>
      <RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />
    </AppShell>,
  );
}

describe('App smoke test', () => {
  it.each(['neon', 'christmas'])('plays turn-based (%s): wrong answer passes, the next team steals for half', async (mode) => {
    localStorage.setItem(THEME_KEY, mode);
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

  it('shows the clue image in the question view', async () => {
    const board = createSampleBoard();
    board.categories[0].clues[0].imageUrl = 'https://example.com/oslo.jpg';
    saveBoards([board]);

    const user = userEvent.setup();
    renderApp(`/setup/${board.id}`);
    await user.click(screen.getByRole('button', { name: /start spill/i }));
    await user.click(screen.getByRole('button', { name: 'Norsk geografi, 100' }));

    const image = screen.getByRole('img', { name: 'Hva heter Norges hovedstad?' });
    expect(image).toHaveAttribute('src', 'https://example.com/oslo.jpg');
    expect(screen.getByText('Hva heter Norges hovedstad?')).toBeInTheDocument();
  });

  it('lets the admin add an image link to a clue', async () => {
    const user = userEvent.setup();
    renderApp('/admin');
    await user.click(screen.getByText('Eksempelbrett'));
    const [firstImageField] = screen.getAllByPlaceholderText('https://');
    fireEvent.change(firstImageField, { target: { value: 'https://example.com/a.png' } });
    expect(screen.getByAltText('Forhåndsvisning av bilde')).toHaveAttribute('src', 'https://example.com/a.png');
    expect(screen.getByText('Lagre').closest('button')).toBeEnabled();
  });

  it('toggles the Christmas theme from the home page and remembers it', async () => {
    const user = userEvent.setup();
    renderApp();
    expect(screen.getByRole('img', { name: 'Jeopardy!' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Slå på juletema' }));
    expect(screen.getByRole('img', { name: 'Jeopardy! – juleutgave' })).toBeInTheDocument();
    expect(localStorage.getItem(THEME_KEY)).toBe('christmas');

    await user.click(screen.getByRole('button', { name: 'Slå av juletema' }));
    expect(screen.getByRole('img', { name: 'Jeopardy!' })).toBeInTheDocument();
  });

  it('only offers the answer sheet from the admin panel', async () => {
    const user = userEvent.setup();
    renderApp();
    expect(screen.queryByRole('link', { name: /fasit/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: /spill/i }));
    expect(screen.getByRole('button', { name: /start spill/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /fasit/i })).not.toBeInTheDocument();
  });

  it('lets the host undo with Ctrl+Z and uses safe shortcuts', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('link', { name: /spill/i }));
    await user.click(screen.getByRole('button', { name: /start spill/i }));
    await user.click(screen.getByRole('button', { name: 'Norsk geografi, 100' }));
    expect(screen.getByText('Lag 1 svarer')).toBeInTheDocument();

    // Space no longer gives up the clue.
    await user.keyboard(' ');
    expect(screen.queryByText('Oslo')).not.toBeInTheDocument();

    // A held-down F (auto-repeat) only counts once.
    fireEvent.keyDown(window, { key: 'f' });
    fireEvent.keyDown(window, { key: 'f', repeat: true });
    expect(screen.getByText('Lag 2 svarer')).toBeInTheDocument();

    // Ctrl+Z gives the clue back to team 1.
    await user.keyboard('{Control>}z{/Control}');
    expect(screen.getByText('Lag 1 svarer')).toBeInTheDocument();

    // Shift+V gives up and shows the answer.
    await user.keyboard('{Shift>}V{/Shift}');
    expect(screen.getByText('Oslo')).toBeInTheDocument();
    expect(screen.getByText('Ingen svarte riktig')).toBeInTheDocument();

    // The undo button in the clue view takes that back too.
    const undoButtons = screen.getAllByRole('button', { name: 'Angre' });
    await user.click(undoButtons[undoButtons.length - 1]);
    expect(screen.queryByText('Oslo')).not.toBeInTheDocument();
    expect(screen.getByText('Lag 1 svarer')).toBeInTheDocument();
  });

  it('warns before leaving the editor with unsaved changes', async () => {
    const user = userEvent.setup();
    renderApp('/admin');
    await user.click(screen.getByText('Eksempelbrett'));
    fireEvent.change(screen.getByDisplayValue('Eksempelbrett'), { target: { value: 'Julebord' } });

    await user.click(screen.getByRole('link', { name: 'Tilbake' }));
    expect(await screen.findByText('Forlate uten å lagre?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Bli' }));
    await waitFor(() => expect(screen.queryByText('Forlate uten å lagre?')).not.toBeInTheDocument());
    expect(screen.getByDisplayValue('Julebord')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Tilbake' }));
    await user.click(await screen.findByRole('button', { name: 'Forlat' }));
    expect(await screen.findByText('Eksempelbrett')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Julebord')).not.toBeInTheDocument();
  }, 15000);
});