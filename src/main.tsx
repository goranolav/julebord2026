import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import '@fontsource/orbitron/latin-500.css';
import '@fontsource/orbitron/latin-700.css';
import '@fontsource/orbitron/latin-900.css';
import '@fontsource/exo-2/latin-400.css';
import '@fontsource/exo-2/latin-600.css';
import '@fontsource/exo-2/latin-700.css';
import '@fontsource/exo-2/latin-ext-400.css';
import '@fontsource/exo-2/latin-ext-700.css';
import '@fontsource/playfair-display/latin-700.css';
import '@fontsource/playfair-display/latin-900.css';
import '@fontsource/lora/latin-400.css';
import '@fontsource/lora/latin-600.css';
import '@fontsource/lora/latin-700.css';
import App from './App';
import AppShell from './AppShell';
import { BoardsProvider } from './game/BoardsContext';
import { GameProvider } from './game/GameContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppShell>
      <HashRouter>
        <BoardsProvider>
          <GameProvider>
            <App />
          </GameProvider>
        </BoardsProvider>
      </HashRouter>
    </AppShell>
  </StrictMode>,
);
