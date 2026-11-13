import { Fragment } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import type { Board } from '../types/game';
import { slideDown } from '../styles/neon';
import { useAppearance } from '../styles/appearanceMode';

interface BoardGridProps {
  board: Board;
  usedClueIds: string[];
  onSelectClue: (clueId: string) => void;
  /** Play the intro animation (only wanted when a game starts). */
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
  const { tile, fonts, colors, tileIntro, id } = useAppearance();
  const christmas = id === 'christmas';
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
              border: `2px solid ${tile.headerBorder}`,
              bgcolor: tile.headerBg,
              boxShadow: tile.headerShadow,
              ...(animateIn && {
                animation: `${slideDown} 500ms ease-out backwards`,
                animationDelay: `${col * HEADER_STAGGER_MS}ms`,
              }),
            }}
          >
            <Typography
              component="h2"
              sx={{
                fontFamily: fonts.display,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: tile.headerText,
                fontSize: 'clamp(0.7rem, 1.35vw, 1.4rem)',
                lineHeight: 1.2,
                letterSpacing: '0.04em',
                textShadow: tile.headerTextShadow,
                overflowWrap: 'anywhere',
              }}
            >
              {category.title}
            </Typography>
          </Box>
          {Array.from({ length: rowCount }, (_, row) => {
            const clue = category.clues[row];
            if (!clue) {
              return <Box key={`empty-${row}`} sx={{ ...cellBase, border: `1px dashed ${tile.usedBorder}` }} />;
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
                  border: `2px solid ${tile.border}`,
                  bgcolor: tile.bg,
                  boxShadow: tile.shadow,
                  transition: 'transform 150ms, box-shadow 150ms, border-color 150ms, background-color 150ms',
                  ...(animateIn && {
                    animation: `${tileIntro} 600ms ease-out backwards`,
                    animationDelay: `${headersDoneMs + (row * columnCount + col) * CELL_STAGGER_MS}ms`,
                  }),
                  '&:hover': {
                    borderColor: tile.hoverBorder,
                    bgcolor: tile.hoverBg,
                    boxShadow: tile.hoverShadow,
                    transform: 'translateY(-3px) scale(1.03)',
                  },
                  '&.Mui-focusVisible': { borderColor: colors.gold, boxShadow: tile.hoverShadow },
                  '&.Mui-disabled': {
                    border: `1px solid ${tile.usedBorder}`,
                    bgcolor: tile.usedBg,
                    boxShadow: 'none',
                  },
                }}
              >
                {!isUsed && (
                  <Typography
                    sx={{
                      fontFamily: fonts.display,
                      color: tile.text,
                      fontWeight: 900,
                      fontSize: christmas ? 'clamp(1.3rem, 3.6vw, 3.6rem)' : 'clamp(1.1rem, 3.2vw, 3.2rem)',
                      textShadow: tile.textShadow,
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
