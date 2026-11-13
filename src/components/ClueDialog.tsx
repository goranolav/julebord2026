import { useEffect } from 'react';
import { Box, Button, Dialog, Fade, Stack, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { no } from '../i18n/no';
import { useCountdown } from '../hooks/useCountdown';
import { currentClueValue } from '../game/gameReducer';
import type { Category, Clue, ClueResult, Team } from '../types/game';
import {
  alpha,
  BG_DARK,
  BG_DEEP,
  BODY_FONT,
  DISPLAY_FONT,
  NEON,
  neonBox,
  neonText,
  revealGlow,
  slideDown,
} from '../styles/neon';
import CountdownTimer from './CountdownTimer';
import SoundToggle from './SoundToggle';
import { useSoundEnabled } from '../audio/soundSettings';
import { useCountdownMusic } from '../hooks/useCountdownMusic';

interface ClueDialogProps {
  category: Category;
  clue: Clue;
  teams: Team[];
  timerSeconds: number;
  answeringTeamId: string | null;
  failedTeamIds: string[];
  answerRevealed: boolean;
  clueResult: ClueResult | null;
  onCorrect: () => void;
  onWrong: () => void;
  onReveal: () => void;
  onFinish: () => void;
}

const FLIP_MS = 750;

/** Card grows from small and flips from its "value" side to the question side. */
const flipIn = keyframes`
  0%   { transform: perspective(1400px) rotateY(-180deg) scale(0.3); }
  45%  { transform: perspective(1400px) rotateY(-180deg) scale(0.75); }
  100% { transform: perspective(1400px) rotateY(0deg) scale(1); }
`;

/** Own component so it can be keyed per answering team: clock and music restart on every pass. */
function TurnTimer({ seconds }: { seconds: number }) {
  const countdown = useCountdown(seconds);
  const [soundEnabled] = useSoundEnabled();
  useCountdownMusic(countdown, soundEnabled);
  return <CountdownTimer countdown={countdown} />;
}

/** Mount with `key={clue.id}` so state resets for every clue. */
export default function ClueDialog({
  category,
  clue,
  teams,
  timerSeconds,
  answeringTeamId,
  failedTeamIds,
  answerRevealed,
  clueResult,
  onCorrect,
  onWrong,
  onReveal,
  onFinish,
}: ClueDialogProps) {
  const answeringTeam = teams.find((t) => t.id === answeringTeamId) ?? null;
  const failedTeams = teams.filter((t) => failedTeamIds.includes(t.id));
  const pointsNow = currentClueValue(clue.value, failedTeamIds.length);
  const winner = clueResult?.teamId ? (teams.find((t) => t.id === clueResult.teamId) ?? null) : null;
  const [soundEnabled, setSoundEnabled] = useSoundEnabled();

  // Keyboard shortcuts for the host.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      const key = event.key.toLowerCase();

      if (key === 'm') {
        event.preventDefault();
        setSoundEnabled(!soundEnabled);
        return;
      }
      if (answerRevealed) {
        if (key === 'enter' || event.code === 'Space') {
          event.preventDefault();
          onFinish();
        }
        return;
      }
      if (key === 'r') {
        event.preventDefault();
        onCorrect();
      } else if (key === 'f') {
        event.preventDefault();
        onWrong();
      } else if (event.code === 'Space') {
        event.preventDefault();
        onReveal();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [answerRevealed, onCorrect, onWrong, onReveal, onFinish, soundEnabled, setSoundEnabled]);

  return (
    <Dialog
      open
      fullScreen
      // No onClose: Esc and backdrop clicks must not dismiss a chosen clue.
      slots={{ transition: Fade }}
      slotProps={{
        paper: { sx: { bgcolor: 'transparent', border: 'none', overflow: 'hidden' } },
        backdrop: { sx: { bgcolor: alpha(BG_DARK, 0.85) } },
      }}
    >
      {/* 3D card: front = question content, back = the value tile that "flips" away. */}
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          transformStyle: 'preserve-3d',
          animation: `${flipIn} ${FLIP_MS}ms cubic-bezier(0.2, 0.7, 0.2, 1) both`,
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            border: `4px solid ${NEON.magenta}`,
            borderRadius: 3,
            bgcolor: BG_DEEP,
            boxShadow: neonBox(NEON.magenta, 2),
          }}
        >
          <Typography
            sx={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 900,
              fontSize: '20vmin',
              color: '#fffbe0',
              textShadow: neonText(NEON.yellow, 2),
            }}
          >
            {clue.value}
          </Typography>
        </Box>

        <Stack
          sx={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            p: { xs: 2, md: 4 },
            gap: 3,
            border: `2px solid ${alpha(answeringTeam?.color ?? NEON.cyan, 0.8)}`,
            borderRadius: 3,
            background: `radial-gradient(ellipse at center, ${BG_DEEP} 0%, ${BG_DARK} 100%)`,
            boxShadow: neonBox(answeringTeam?.color ?? NEON.cyan, 1),
            transition: 'border-color 300ms, box-shadow 300ms',
            overflow: 'auto',
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Typography
              variant="h5"
              sx={{ textTransform: 'uppercase', color: '#e9feff', textShadow: neonText(NEON.cyan, 0.6) }}
            >
              {category.title}
              <Box component="span" sx={{ mx: 1.5, opacity: 0.5 }}>
                ·
              </Box>
              <Box component="span" sx={{ color: '#fffbe0', textShadow: neonText(NEON.yellow, 0.7) }}>
                {clue.value}
              </Box>
            </Typography>
            <SoundToggle />
          </Stack>

          {answeringTeam && (
            <Stack key={answeringTeam.id} spacing={1.5} sx={{ animation: `${slideDown} 350ms ease-out both` }}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                sx={{ alignItems: { md: 'baseline' }, justifyContent: 'space-between', gap: 1 }}
              >
                <Typography
                  variant="h4"
                  sx={{ color: '#fff', textShadow: neonText(answeringTeam.color, 0.9), overflowWrap: 'anywhere' }}
                >
                  {no.clue.answering(answeringTeam.name)}
                </Typography>
                <Typography sx={{ color: failedTeams.length ? NEON.orange : 'text.secondary', fontWeight: 600 }}>
                  {failedTeams.length ? no.clue.worthHalf(pointsNow) : no.clue.worth(pointsNow)}
                </Typography>
              </Stack>
              <TurnTimer key={answeringTeam.id} seconds={timerSeconds} />
            </Stack>
          )}

          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
            <Typography
              sx={{
                fontFamily: BODY_FONT,
                textAlign: 'center',
                fontWeight: 700,
                fontSize: 'clamp(1.6rem, 4.5vw, 4.5rem)',
                lineHeight: 1.2,
                color: '#fff',
                textShadow: `0 0 18px ${alpha('#ffffff', 0.45)}`,
                whiteSpace: 'pre-wrap',
              }}
            >
              {clue.question}
            </Typography>

            {answerRevealed && (
              <Box sx={{ textAlign: 'center', animation: `${revealGlow} 500ms ease-out both` }}>
                <Box
                  sx={{ height: 2, mx: 'auto', mb: 2, width: '60%', bgcolor: NEON.green, boxShadow: `0 0 12px ${NEON.green}` }}
                />
                <Typography variant="overline" sx={{ fontSize: '1rem', color: NEON.green }}>
                  {no.clue.answer}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: BODY_FONT,
                    color: '#eaffe4',
                    fontWeight: 700,
                    fontSize: 'clamp(1.4rem, 3.5vw, 3.5rem)',
                    textShadow: neonText(NEON.green, 1),
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {clue.answer}
                </Typography>
              </Box>
            )}
          </Box>

          {failedTeams.length > 0 && (
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {no.clue.failed}
              </Typography>
              {failedTeams.map((team) => (
                <Box
                  key={team.id}
                  component="span"
                  sx={{
                    px: 1.5,
                    py: 0.25,
                    borderRadius: 999,
                    border: `1px solid ${alpha(team.color, 0.5)}`,
                    color: alpha(team.color, 0.75),
                    textDecoration: 'line-through',
                    fontWeight: 600,
                  }}
                >
                  {team.name}
                </Box>
              ))}
            </Stack>
          )}

          <Box sx={{ minHeight: 110 }}>
            {!answerRevealed ? (
              <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    startIcon={<CheckIcon />}
                    onClick={onCorrect}
                    sx={{ fontSize: '1.2rem', px: 5, py: 1.5, boxShadow: `0 0 14px ${alpha(NEON.green, 0.6)}` }}
                  >
                    {no.clue.correct}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="large"
                    startIcon={<ClearIcon />}
                    onClick={onWrong}
                    sx={{ fontSize: '1.2rem', px: 5, py: 1.5 }}
                  >
                    {no.clue.wrong}
                  </Button>
                </Stack>
                <Button color="inherit" size="small" startIcon={<VisibilityIcon />} onClick={onReveal} sx={{ opacity: 0.75 }}>
                  {no.clue.giveUp}
                </Button>
              </Stack>
            ) : (
              <Stack spacing={2} sx={{ alignItems: 'center', animation: `${revealGlow} 500ms ease-out both` }}>
                <Typography
                  role="status"
                  variant="h4"
                  sx={{
                    textAlign: 'center',
                    color: '#fff',
                    textShadow: neonText(winner?.color ?? NEON.magenta, winner ? 1 : 0.6),
                  }}
                >
                  {winner && clueResult ? no.clue.awarded(winner.name, clueResult.points) : no.clue.nobodyCorrect}
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={onFinish}
                  autoFocus
                  sx={{ fontSize: '1.2rem', px: 5, py: 1.5 }}
                >
                  {no.clue.continue}
                </Button>
              </Stack>
            )}
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, opacity: 0.6 }}>
              {answerRevealed ? no.clue.shortcutsRevealed : no.clue.shortcutsAnswering}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Dialog>
  );
}
