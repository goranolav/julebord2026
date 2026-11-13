import { useMemo, type ReactNode } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import AppBackground from './components/AppBackground';
import { useAppearance } from './styles/appearanceMode';
import { createAppTheme } from './theme';

/** MUI theme + background that follow the active appearance (neon / christmas). */
export default function AppShell({ children }: { children: ReactNode }) {
  const appearance = useAppearance();
  const theme = useMemo(() => createAppTheme(appearance), [appearance]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBackground />
      {children}
    </ThemeProvider>
  );
}
