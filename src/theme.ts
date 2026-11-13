import { createTheme, type Theme } from '@mui/material/styles';
import { alpha } from './styles/neon';
import { neonAppearance, type Appearance } from './styles/appearance';

/** Builds the MUI theme for a visual appearance (neon or christmas). */
export function createAppTheme(a: Appearance): Theme {
  const { colors: c, fonts } = a;
  const christmas = a.id === 'christmas';

  return createTheme({
    palette: {
      mode: 'dark',
      primary: { main: c.primary, contrastText: c.onAccent },
      secondary: { main: c.secondary, contrastText: christmas ? c.strong : c.onAccent },
      warning: { main: c.gold, contrastText: c.onAccent },
      success: { main: c.success, contrastText: c.onAccent },
      error: { main: c.danger },
      background: { default: c.background, paper: c.surface },
      text: { primary: c.text, secondary: c.textSecondary },
      divider: alpha(c.divider, 0.35),
    },
    typography: {
      fontFamily: fonts.body,
      h1: { fontFamily: fonts.display, fontWeight: 900 },
      h2: { fontFamily: fonts.display, fontWeight: 900 },
      h3: { fontFamily: fonts.display, fontWeight: 800 },
      h4: { fontFamily: fonts.display, fontWeight: 800 },
      h5: { fontFamily: fonts.display, fontWeight: 700 },
      h6: { fontFamily: fonts.display, fontWeight: 700, letterSpacing: '0.04em' },
      overline: { fontFamily: fonts.display, letterSpacing: '0.2em' },
      button: { fontFamily: fonts.display, fontWeight: 700, letterSpacing: christmas ? '0.03em' : '0.06em' },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: c.background,
            backgroundImage: a.pageBackground,
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
          },
          '::selection': { background: alpha(c.secondary, 0.5) },
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              animationDuration: '0.01ms !important',
              animationIterationCount: '1 !important',
              animationDelay: '0ms !important',
              transitionDuration: '0.01ms !important',
            },
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 999,
            transition: 'box-shadow 150ms, transform 150ms, background-color 150ms',
            '&:hover': { transform: 'translateY(-1px)' },
          },
          contained: {
            variants: [
              {
                props: { color: 'primary' },
                style: {
                  '&:not(.Mui-disabled)': { boxShadow: `0 0 12px ${alpha(c.primary, 0.6)}` },
                  '&:not(.Mui-disabled):hover': { boxShadow: a.glowBox(c.primary, 0.8) },
                },
              },
              {
                props: { color: 'secondary' },
                style: {
                  '&:not(.Mui-disabled)': { boxShadow: `0 0 12px ${alpha(c.secondary, 0.6)}` },
                  '&:not(.Mui-disabled):hover': { boxShadow: a.glowBox(c.secondary, 0.8) },
                },
              },
            ],
          },
          outlined: {
            borderWidth: 2,
            '&:hover': { borderWidth: 2 },
            variants: [
              {
                props: { color: 'primary' },
                style: {
                  '&:not(.Mui-disabled):hover': {
                    boxShadow: a.glowBox(c.primary, 0.6),
                    textShadow: a.glowText(c.primary, 0.4),
                  },
                },
              },
            ],
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backdropFilter: 'blur(8px)',
          },
          outlined: {
            borderColor: alpha(c.divider, 0.5),
            boxShadow: `0 0 18px ${alpha(c.divider, 0.25)}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { backgroundColor: c.surface },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: { backgroundColor: alpha(c.background, 0.7), backdropFilter: 'blur(8px)' },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { backgroundColor: c.backgroundDeep, border: `1px solid ${alpha(c.divider, 0.5)}` },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { backgroundColor: alpha('#ffffff', 0.08) },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { boxShadow: `0 0 10px ${alpha(c.primary, 0.5)}` },
          },
        },
      },
    },
  });
}

/** Default (neon) theme. */
export const theme = createAppTheme(neonAppearance);
