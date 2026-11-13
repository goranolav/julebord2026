import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
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
import AppShell from './AppShell';
import { routes } from './routes';

const router = createHashRouter(routes);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppShell>
      <RouterProvider router={router} />
    </AppShell>
  </StrictMode>,
);
