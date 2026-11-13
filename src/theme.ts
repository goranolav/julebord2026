import { createTheme } from '@mui/material/styles';
import { alpha, BG_DARK, BG_DEEP, BODY_FONT, DISPLAY_FONT, NEON, neonBox, neonText, SURFACE } from './styles/neon';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: NEON.cyan, contrastText: '#000' },
    secondary: { main: NEON.magenta, contrastText: '#000' },
    warning: { main: NEON.yellow, contrastText: '#000' },
    success: { main: NEON.green, contrastText: '#000' },
    error: { main: '#ff3864' },
    background: { default: BG_DARK, paper: SURFACE },
    text: { primary: '#f4f0ff', secondary: '#b9a9e6' },
    divider: alpha(NEON.purple, 0.35),
  },
  typography: {
    fontFamily: BODY_FONT,
    h1: { fontFamily: DISPLAY_FONT, fontWeight: 900 },
    h2: { fontFamily: DISPLAY_FONT, fontWeight: 900 },
    h3: { fontFamily: DISPLAY_FONT, fontWeight: 800 },
    h4: { fontFamily: DISPLAY_FONT, fontWeight: 800 },
    h5: { fontFamily: DISPLAY_FONT, fontWeight: 700 },
    h6: { fontFamily: DISPLAY_FONT, fontWeight: 700, letterSpacing: '0.04em' },
    overline: { fontFamily: DISPLAY_FONT, letterSpacing: '0.2em' },
    button: { fontFamily: DISPLAY_FONT, fontWeight: 700, letterSpacing: '0.06em' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: BG_DARK,
          backgroundImage: `radial-gradient(ellipse at top, ${BG_DEEP} 0%, ${BG_DARK} 70%)`,
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
        '::selection': { background: alpha(NEON.magenta, 0.5) },
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
                '&:not(.Mui-disabled)': { boxShadow: `0 0 12px ${alpha(NEON.cyan, 0.6)}` },
                '&:not(.Mui-disabled):hover': { boxShadow: neonBox(NEON.cyan, 0.8) },
              },
            },
            {
              props: { color: 'secondary' },
              style: {
                '&:not(.Mui-disabled)': { boxShadow: `0 0 12px ${alpha(NEON.magenta, 0.6)}` },
                '&:not(.Mui-disabled):hover': { boxShadow: neonBox(NEON.magenta, 0.8) },
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
                  boxShadow: neonBox(NEON.cyan, 0.6),
                  textShadow: neonText(NEON.cyan, 0.4),
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
          borderColor: alpha(NEON.purple, 0.5),
          boxShadow: `0 0 18px ${alpha(NEON.purple, 0.25)}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { backgroundColor: SURFACE },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: alpha(BG_DARK, 0.7), backdropFilter: 'blur(8px)' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { backgroundColor: BG_DEEP, border: `1px solid ${alpha(NEON.purple, 0.5)}` },
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
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { boxShadow: `0 0 10px ${alpha(NEON.cyan, 0.5)}` },
        },
      },
    },
  },
});
