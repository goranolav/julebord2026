import { useState } from 'react';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { no } from '../i18n/no';
import type { Team } from '../types/game';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { alpha, scoreFlash, scoreFlashAlt } from '../styles/neon';
import { useAppearance } from '../styles/appearanceMode';

interface ScoreboardProps {
  teams: Team[];
  step?: number;
  onAdjust?: (teamId: string, delta: number) => void;
  /** Team whose turn it is to pick a clue. */
  turnTeamId?: string | null;
  /** Team currently answering an open clue (highlighted instead of the turn team). */
  answeringTeamId?: string | null;
}

export default function Scoreboard({ teams, step = 100, onAdjust, turnTeamId, answeringTeamId }: ScoreboardProps) {
  const highlightedId = answeringTeamId ?? turnTeamId ?? null;
  return (
    <Box
      component="section"
      aria-label={no.game.scoreboard}
      sx={{
        display: 'grid',
        gap: { xs: 1, md: 2 },
        gridTemplateColumns: `repeat(${teams.length}, minmax(0, 1fr))`,
      }}
    >
      {teams.map((team, index) => (
        <TeamScore
          key={team.id}
          team={team}
          index={index}
          step={step}
          onAdjust={onAdjust}
          highlighted={team.id === highlightedId}
        />
      ))}
    </Box>
  );
}

interface TeamScoreProps {
  team: Team;
  index: number;
  step: number;
  onAdjust?: (teamId: string, delta: number) => void;
  highlighted: boolean;
}

function TeamScore({ team, index, step, onAdjust, highlighted }: TeamScoreProps) {
  const shown = useAnimatedNumber(team.score);

  // Flash the card whenever the team gains points (derived from the previous score).
  const [prevScore, setPrevScore] = useState(team.score);
  const [flashCount, setFlashCount] = useState(0);
  if (team.score !== prevScore) {
    if (team.score > prevScore) setFlashCount((c) => c + 1);
    setPrevScore(team.score);
  }

  const { color } = team;
  const { glowText, glowBox, fonts, colors } = useAppearance();

  return (
    <Box
      sx={{
        position: 'relative',
        border: highlighted ? `3px solid ${color}` : `2px solid ${alpha(color, 0.55)}`,
        borderRadius: 2,
        bgcolor: alpha(color, highlighted ? 0.18 : 0.05),
        boxShadow: highlighted ? glowBox(color, 1.1) : `0 0 8px ${alpha(color, 0.25)}`,
        opacity: highlighted ? 1 : 0.8,
        transform: highlighted ? 'translateY(-4px)' : 'none',
        transition: 'transform 250ms, box-shadow 250ms, opacity 250ms, background-color 250ms',
        p: { xs: 0.75, md: 1.25 },
        textAlign: 'center',
        minWidth: 0,
        animation:
          flashCount > 0 ? `${flashCount % 2 ? scoreFlash : scoreFlashAlt} 900ms ease-out` : 'none',
      }}
    >
      {highlighted && (
        <Box
          component="span"
          sx={{
            position: 'absolute',
            top: -11,
            left: '50%',
            transform: 'translateX(-50%)',
            px: 1,
            borderRadius: 999,
            bgcolor: color,
            color: colors.onAccent,
            fontFamily: fonts.display,
            fontWeight: 900,
            fontSize: '0.7rem',
            letterSpacing: '0.15em',
            lineHeight: '20px',
            boxShadow: `0 0 10px ${color}`,
          }}
        >
          {no.game.turnBadge.toUpperCase()}
        </Box>
      )}
      <Typography
        noWrap
        title={team.name}
        sx={{
          fontWeight: 700,
          fontSize: 'clamp(0.85rem, 1.4vw, 1.4rem)',
          color,
          textShadow: glowText(color, 0.3),
        }}
      >
        <Box component="span" sx={{ opacity: 0.6, mr: 0.75 }}>
          {index + 1}
        </Box>
        {team.name}
      </Typography>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
        {onAdjust && (
          <Tooltip title={`${no.game.adjustDown} (${step})`}>
            <IconButton size="small" aria-label={no.game.adjustDown} onClick={() => onAdjust(team.id, -step)}>
              <RemoveIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Typography
          data-testid={`score-${team.id}`}
          aria-label={`${team.name}: ${team.score} ${no.common.points}`}
          sx={{
            fontFamily: fonts.display,
            fontWeight: 900,
            fontSize: 'clamp(1.2rem, 2.6vw, 2.6rem)',
            color: team.score < 0 ? colors.danger : colors.strong,
            textShadow: glowText(team.score < 0 ? colors.danger : color, 0.7),
            minWidth: '3ch',
            mx: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {shown}
        </Typography>
        {onAdjust && (
          <Tooltip title={`${no.game.adjustUp} (${step})`}>
            <IconButton size="small" aria-label={no.game.adjustUp} onClick={() => onAdjust(team.id, step)}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Box>
  );
}
