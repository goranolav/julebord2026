import { keyframes } from '@mui/material/styles';

export const NEON = {
  cyan: '#00f0ff',
  magenta: '#ff2bd6',
  yellow: '#ffe600',
  green: '#39ff14',
  orange: '#ff8a00',
  purple: '#b026ff',
} as const;

export const BG_DARK = '#07021a';
export const BG_DEEP = '#14052e';
export const SURFACE = 'rgba(20, 8, 48, 0.72)';

export const DISPLAY_FONT = '"Orbitron", "Segoe UI", sans-serif';
export const BODY_FONT = '"Exo 2", "Segoe UI", Roboto, sans-serif';

/** One distinct neon colour per team, in the order teams are created. */
export const TEAM_COLORS: readonly string[] = [
  NEON.cyan,
  NEON.magenta,
  NEON.yellow,
  NEON.green,
  NEON.orange,
  NEON.purple,
];

export function teamColor(index: number): string {
  return TEAM_COLORS[((index % TEAM_COLORS.length) + TEAM_COLORS.length) % TEAM_COLORS.length];
}

/** Layered text-shadow that makes text look like a neon tube. */
export function neonText(color: string, intensity = 1): string {
  const i = intensity;
  return [
    `0 0 ${2 * i}px #fff`,
    `0 0 ${6 * i}px ${color}`,
    `0 0 ${14 * i}px ${color}`,
    `0 0 ${28 * i}px ${color}`,
  ].join(', ');
}

/** Layered box-shadow for glowing borders (outer glow + inner glow). */
export function neonBox(color: string, intensity = 1): string {
  const i = intensity;
  return [
    `0 0 ${4 * i}px ${color}`,
    `0 0 ${14 * i}px ${color}`,
    `inset 0 0 ${8 * i}px ${color}`,
  ].join(', ');
}

/** Appends an alpha channel (0–1) to a #rrggbb colour. */
export function alpha(hex: string, opacity: number): string {
  const a = Math.round(Math.min(1, Math.max(0, opacity)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

export const flicker = keyframes`
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
  20%, 24%, 55% { opacity: 0.45; }
`;

export const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
`;

/** Neon "power on": dark → flicker → lit. */
export const powerOn = keyframes`
  0% { opacity: 0; transform: scale(0.85); filter: brightness(0.3); }
  40% { opacity: 1; filter: brightness(1.8); }
  55% { opacity: 0.4; }
  70% { opacity: 1; transform: scale(1); filter: brightness(1.2); }
  100% { opacity: 1; transform: scale(1); filter: brightness(1); }
`;

export const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const revealGlow = keyframes`
  0% { opacity: 0; transform: scale(0.9); letter-spacing: 0.3em; filter: blur(6px); }
  100% { opacity: 1; transform: scale(1); letter-spacing: normal; filter: blur(0); }
`;

export const scoreFlash = keyframes`
  0% { filter: brightness(2.2); transform: scale(1.06); }
  100% { filter: brightness(1); transform: scale(1); }
`;

/**
 * Near-identical copy (must differ, since Emotion names keyframes by content hash):
 * alternating animation names restarts the animation without remounting.
 */
export const scoreFlashAlt = keyframes`
  0% { filter: brightness(2.2); transform: scale(1.0601); }
  100% { filter: brightness(1); transform: scale(1); }
`;

export const gridScroll = keyframes`
  from { background-position: 0 0; }
  to { background-position: 0 60px; }
`;

export const reducedMotion = '@media (prefers-reduced-motion: reduce)';
