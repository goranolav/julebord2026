import { keyframes } from '@mui/material/styles';
import {
  alpha,
  BG_DARK,
  BG_DEEP,
  BODY_FONT,
  DISPLAY_FONT,
  flicker,
  NEON,
  neonBox,
  neonText,
  powerOn,
  SURFACE,
  TEAM_COLORS,
} from './neon';

type Keyframes = ReturnType<typeof keyframes>;

export type AppearanceId = 'neon' | 'christmas';

/**
 * Everything a visual theme decides. Components read colours by *role*
 * (e.g. `primary`, `tile.text`) so the same component works in every theme.
 * All colours are #rrggbb so they can be used with `alpha()`.
 */
export interface Appearance {
  id: AppearanceId;
  fonts: { display: string; body: string };
  colors: {
    background: string;
    backgroundDeep: string;
    surface: string;
    text: string;
    textSecondary: string;
    /** Main accent: primary buttons, category headers, calm timer. */
    primary: string;
    /** Second accent: secondary buttons, urgent timer. */
    secondary: string;
    /** Clue values, trophy, highlights. */
    gold: string;
    success: string;
    warning: string;
    danger: string;
    divider: string;
    /** Text drawn on a filled accent colour (e.g. the turn badge). */
    onAccent: string;
    /** Brightest text, used for headlines and the question. */
    strong: string;
  };
  /** Background of the whole page. */
  pageBackground: string;
  /** Background of the clue card. */
  cardBackground: string;
  tile: {
    bg: string;
    border: string;
    shadow: string;
    hoverBg: string;
    hoverBorder: string;
    hoverShadow: string;
    text: string;
    textShadow: string;
    usedBg: string;
    usedBorder: string;
    headerBg: string;
    headerBorder: string;
    headerShadow: string;
    headerText: string;
    headerTextShadow: string;
  };
  teamColors: readonly string[];
  /** Glow (neon) or soft shadow (christmas) for text. */
  glowText: (color: string, intensity?: number) => string;
  /** Glow (neon) or soft shadow (christmas) for boxes. */
  glowBox: (color: string, intensity?: number) => string;
  /** Entrance animation for board tiles. */
  tileIntro: Keyframes;
  /** Attention animation used when time is up. */
  attention: Keyframes;
}

export const neonAppearance: Appearance = {
  id: 'neon',
  fonts: { display: DISPLAY_FONT, body: BODY_FONT },
  colors: {
    background: BG_DARK,
    backgroundDeep: BG_DEEP,
    surface: SURFACE,
    text: '#f4f0ff',
    textSecondary: '#b9a9e6',
    primary: NEON.cyan,
    secondary: NEON.magenta,
    gold: NEON.yellow,
    success: NEON.green,
    warning: NEON.orange,
    danger: '#ff3864',
    divider: NEON.purple,
    onAccent: '#000000',
    strong: '#ffffff',
  },
  pageBackground: `radial-gradient(ellipse at top, ${BG_DEEP} 0%, ${BG_DARK} 70%)`,
  cardBackground: `radial-gradient(ellipse at center, ${BG_DEEP} 0%, ${BG_DARK} 100%)`,
  tile: {
    bg: alpha(NEON.magenta, 0.06),
    border: alpha(NEON.magenta, 0.8),
    shadow: `0 0 10px ${alpha(NEON.magenta, 0.45)}, inset 0 0 14px ${alpha(NEON.magenta, 0.25)}`,
    hoverBg: alpha(NEON.cyan, 0.12),
    hoverBorder: NEON.cyan,
    hoverShadow: neonBox(NEON.cyan, 1),
    text: '#fffbe0',
    textShadow: neonText(NEON.yellow, 0.9),
    usedBg: alpha('#000000', 0.35),
    usedBorder: alpha(NEON.purple, 0.22),
    headerBg: alpha(NEON.cyan, 0.07),
    headerBorder: NEON.cyan,
    headerShadow: neonBox(NEON.cyan, 0.6),
    headerText: '#e9feff',
    headerTextShadow: neonText(NEON.cyan, 0.6),
  },
  teamColors: TEAM_COLORS,
  glowText: neonText,
  glowBox: neonBox,
  tileIntro: powerOn,
  attention: flicker,
};

// ---------- Christmas ----------

const XMAS = {
  wine: '#2a0a10',
  wineLight: '#5a1020',
  forest: '#0f2a1c',
  forestLight: '#1a4a32',
  pine: '#0f3d27',
  cream: '#fbf3e4',
  creamLight: '#fffaf2',
  red: '#b3122e',
  redDark: '#a10e26',
  gold: '#e3b04b',
  goldBright: '#f2c14e',
  green: '#5cb85c',
} as const;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const bellSwing = keyframes`
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(-4deg); }
  40% { transform: rotate(4deg); }
  60% { transform: rotate(-2deg); }
  80% { transform: rotate(2deg); }
`;

function softText(color: string, intensity = 1): string {
  return `0 2px 4px rgba(0, 0, 0, 0.55), 0 0 ${10 * intensity}px ${alpha(color, 0.45)}`;
}

function softBox(color: string, intensity = 1): string {
  return `0 ${3 * intensity}px ${10 * intensity}px rgba(0, 0, 0, 0.45), 0 0 ${8 * intensity}px ${alpha(color, 0.35)}`;
}

export const christmasAppearance: Appearance = {
  id: 'christmas',
  fonts: {
    display: '"Playfair Display", Georgia, "Times New Roman", serif',
    body: 'Lora, Georgia, "Times New Roman", serif',
  },
  colors: {
    background: XMAS.wine,
    backgroundDeep: XMAS.forest,
    surface: 'rgba(15, 42, 28, 0.82)',
    text: XMAS.cream,
    textSecondary: '#d9c7a8',
    primary: XMAS.gold,
    secondary: XMAS.red,
    gold: XMAS.goldBright,
    success: XMAS.green,
    warning: '#e8833a',
    danger: '#e0484f',
    divider: XMAS.gold,
    onAccent: XMAS.wine,
    strong: XMAS.creamLight,
  },
  pageBackground: `radial-gradient(ellipse at top, ${XMAS.wineLight} 0%, ${XMAS.wine} 55%, ${XMAS.forest} 100%)`,
  cardBackground: `radial-gradient(ellipse at center, ${XMAS.forestLight} 0%, ${XMAS.forest} 100%)`,
  tile: {
    bg: XMAS.cream,
    border: XMAS.red,
    shadow: `0 3px 8px rgba(0, 0, 0, 0.4), inset 0 0 0 3px ${XMAS.cream}, inset 0 0 0 4px ${alpha(XMAS.red, 0.35)}`,
    hoverBg: XMAS.creamLight,
    hoverBorder: XMAS.gold,
    hoverShadow: `0 8px 18px rgba(0, 0, 0, 0.5), 0 0 14px ${alpha(XMAS.gold, 0.6)}`,
    text: XMAS.redDark,
    textShadow: '0 1px 0 rgba(255, 255, 255, 0.7)',
    usedBg: 'rgba(0, 0, 0, 0.25)',
    usedBorder: alpha(XMAS.gold, 0.2),
    headerBg: XMAS.pine,
    headerBorder: XMAS.gold,
    headerShadow: `0 3px 8px rgba(0, 0, 0, 0.45), inset 0 0 0 1px ${alpha(XMAS.gold, 0.35)}`,
    headerText: XMAS.cream,
    headerTextShadow: '0 2px 3px rgba(0, 0, 0, 0.6)',
  },
  // Light enough to read on the dark green/wine background.
  teamColors: ['#ff5a5f', '#5ccf7a', '#f2c14e', '#6fa8ff', '#d58fd8', '#e8a066'],
  glowText: softText,
  glowBox: softBox,
  tileIntro: fadeUp,
  attention: bellSwing,
};

export const appearances: Record<AppearanceId, Appearance> = {
  neon: neonAppearance,
  christmas: christmasAppearance,
};
