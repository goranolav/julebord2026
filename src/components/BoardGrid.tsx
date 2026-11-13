import { Fragment } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import type { Board } from '../types/game';
import { alpha, DISPLAY_FONT, NEON, neonBox, neonText, powerOn, slideDown } from '../styles/neon';

interface BoardGridProps {
  board: Board;
  usedClueIds: string[];
  onSelectClue: (clueId: string) => void;
  /** Play the "power on" intro animation (only wanted when a game starts). */
  animateIn?: boolean;
}

const HEADER_STAGGER_MS = 90;
const CELL_STAGGER_MS = 35;

const cellBase = {
  borderRadius: 1.5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  minHeight: 0,
  minWidth: 0,
} as const;

export default function BoardGrid({ board, usedClueIds, onSelectClue, animateIn = false }: BoardGridProps) {
  const used = new Set(usedClueIds);
  const columns = board.categories.map((category) => ({
    ...category,
    clues: [...category.clues].sort((a, b) => a.value - b.value),
  }));
  const columnCount = columns.length;
  const rowCount = Math.max(1, ...columns.map((c) => c.clues.length));
  const headersDoneMs = columnCount * HEADER_STAGGER_MS + 200;

  return (
    <Box
      sx={{
        display: 'grid',
        gridAutoFlow: 'column',
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
        gridTemplateRows: `minmax(80px, auto) repeat(${rowCount}, minmax(64px, 1fr))`,
        gap: { xs: 0.75, md: 1.25 },
        height: '100%',
      }}
    >
      {columns.map((category, col) => (
        <Fragment key={category.id}>
          <Box
            sx={{
              ...cellBase,
              p: 1,
              border: `2px solid ${NEON.cyan}`,
              bgcolor: alpha(NEON.cyan, 0.07),
              boxShadow: neonBox(NEON.cyan, 0.6),
              ...(animateIn && {
                animation: `${slideDown} 500ms ease-out backwards`,
                animationDelay: `${col * HEADER_STAGGER_MS}ms`,
              }),
            }}
          >
            <Typography
              component="h2"
              sx={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#e9feff',
                fontSize: 'clamp(0.7rem, 1.35vw, 1.4rem)',
                lineHeight: 1.2,
                letterSpacing: '0.04em',
                textShadow: neonText(NEON.cyan, 0.6),
                overflowWrap: 'anywhere',
              }}
            >
              {category.title}
            </Typography>
          </Box>
          {Array.from({ length: rowCount }, (_, row) => {
            const clue = category.clues[row];
            if (!clue) {
              return (
                <Box key={`empty-${row}`} sx={{ ...cellBase, border: `1px dashed ${alpha(NEON.purple, 0.25)}` }} />
              );
            }
            const isUsed = used.has(clue.id);
            return (
              <ButtonBase
                key={clue.id}
                disabled={isUsed}
                onClick={() => onSelectClue(clue.id)}
                aria-label={`${category.title}, ${clue.value}`}
                sx={{
                  ...cellBase,
                  border: `2px solid ${alpha(NEON.magenta, 0.8)}`,
                  bgcolor: alpha(NEON.magenta, 0.06),
                  boxShadow: `0 0 10px ${alpha(NEON.magenta, 0.45)}, inset 0 0 14px ${alpha(NEON.magenta, 0.25)}`,
                  transition: 'transform 150ms, box-shadow 150ms, border-color 150ms, background-color 150ms',
                  ...(animateIn && {
                    animation: `${powerOn} 600ms ease-out backwards`,
                    animationDelay: `${headersDoneMs + (row * columnCount + col) * CELL_STAGGER_MS}ms`,
                  }),
                  '&:hover': {
                    borderColor: NEON.cyan,
                    bgcolor: alpha(NEON.cyan, 0.12),
                    boxShadow: neonBox(NEON.cyan, 1),
                    transform: 'translateY(-3px) scale(1.03)',
                  },
                  '&.Mui-focusVisible': { borderColor: NEON.yellow, boxShadow: neonBox(NEON.yellow, 1) },
                  '&.Mui-disabled': {
                    border: `1px solid ${alpha(NEON.purple, 0.22)}`,
                    bgcolor: alpha('#000000', 0.35),
                    boxShadow: 'none',
                  },
                }}
              >
                {!isUsed && (
                  <Typography
                    sx={{
                      fontFamily: DISPLAY_FONT,
                      color: '#fffbe0',
                      fontWeight: 900,
                      fontSize: 'clamp(1.1rem, 3.2vw, 3.2rem)',
                      textShadow: neonText(NEON.yellow, 0.9),
                    }}
                  >
                    {clue.value}
                  </Typography>
                )}
              </ButtonBase>
            );
          })}
        </Fragment>
      ))}
    </Box>
  );
}
