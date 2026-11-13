import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { HashRouter } from 'react-router-dom';
import '@fontsource/orbitron/latin-500.css';
import '@fontsource/orbitron/latin-700.css';
import '@fontsource/orbitron/latin-900.css';
import '@fontsource/exo-2/latin-400.css';
import '@fontsource/exo-2/latin-600.css';
import '@fontsource/exo-2/latin-700.css';
import '@fontsource/exo-2/latin-ext-400.css';
import '@fontsource/exo-2/latin-ext-700.css';
import App from './App';
import { theme } from './theme';
import { BoardsProvider } from './game/BoardsContext';
import { GameProvider } from './game/GameContext';
import NeonBackground from './components/NeonBackground';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NeonBackground />
      <HashRouter>
        <BoardsProvider>
          <GameProvider>
            <App />
          </GameProvider>
        </BoardsProvider>
      </HashRouter>
    </ThemeProvider>
  </StrictMode>,
);
