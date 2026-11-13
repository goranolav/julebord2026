import { useEffect, useState } from 'react';
import { Box, Button, Dialog, Fade, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import { keyframes } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { no } from '../i18n/no';
import { useCountdown } from '../hooks/useCountdown';
import { currentClueValue } from '../game/gameReducer';
import type { Category, Clue, ClueResult } from '../types/game';
import type { ColoredTeam } from '../styles/appearanceMode';
import { alpha, revealGlow, slideDown } from '../styles/neon';
import { useAppearance } from '../styles/appearanceMode';
import CountdownTimer from './CountdownTimer';
import SoundToggle from './SoundToggle';
import { useSoundEnabled } from '../audio/soundSettings';
import { useCountdownMusic } from '../hooks/useCountdownMusic';

interface ClueDialogProps {
  category: Category;
  clue: Clue;
  teams: ColoredTeam[];
  timerSeconds: number;
  answeringTeamId: string | null;
  failedTeamIds: string[];
  answerRevealed: boolean;
  clueResult: ClueResult | null;
  onCorrect: () => void;
  onWrong: () => void;
  onReveal: () => void;
  onFinish: () => void;
  onUndo: () => void;
  canUndo: boolean;
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
  const { id } = useAppearance();
  useCountdownMusic(countdown, soundEnabled, id);
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
  onUndo,
  canUndo,
}: ClueDialogProps) {
  const answeringTeam = teams.find((t) => t.id === answeringTeamId) ?? null;
  const failedTeams = teams.filter((t) => failedTeamIds.includes(t.id));
  const pointsNow = currentClueValue(clue.value, failedTeamIds.length);
  const winner = clueResult?.teamId ? (teams.find((t) => t.id === clueResult.teamId) ?? null) : null;
  const [soundEnabled, setSoundEnabled] = useSoundEnabled();
  // A broken image is hidden so the game can go on with just the text.
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(clue.imageUrl) && !imageFailed;
  const a = useAppearance();
  const { colors, tile, fonts, glowText, glowBox } = a;
  const christmas = a.id === 'christmas';
  // Clue value shown on the dark card (outside a tile).
  const valueOnDark = christmas ? colors.gold : tile.text;
  const accent = answeringTeam?.color ?? colors.primary;

  // Keyboard shortcuts for the host. Held-down keys (auto-repeat) and keys combined with
  // Ctrl/Cmd/Alt are ignored, so e.g. holding F can't skip several teams and Ctrl+R still reloads.
  // Giving up needs Shift+V, so a stray press can't throw the clue away.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const key = event.key.toLowerCase();
      const isSpace = event.code === 'Space';

      if (answerRevealed) {
        if (key === 'enter' || isSpace) {
          event.preventDefault();
          if (!event.repeat) onFinish();
        } else if (key === 'm' && !event.repeat) {
          setSoundEnabled(!soundEnabled);
        }
        return;
      }

      // Space does nothing while a team is answering, but must not click a focused button.
      if (isSpace) {
        event.preventDefault();
        return;
      }
      if (event.repeat) return;
      if (key === 'm') setSoundEnabled(!soundEnabled);
      else if (key === 'r' && !event.shiftKey) onCorrect();
      else if (key === 'f' && !event.shiftKey) onWrong();
      else if (key === 'v' && event.shiftKey) onReveal();
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
        backdrop: { sx: { bgcolor: alpha(colors.background, 0.85) } },
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
            border: `4px solid ${christmas ? tile.border : colors.secondary}`,
            borderRadius: 3,
            bgcolor: christmas ? tile.bg : colors.backgroundDeep,
            boxShadow: glowBox(christmas ? tile.border : colors.secondary, 2),
          }}
        >
          <Typography
            sx={{
              fontFamily: fonts.display,
              fontWeight: 900,
              fontSize: '20vmin',
              color: tile.text,
              textShadow: christmas ? tile.textShadow : glowText(colors.gold, 2),
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
            border: `2px solid ${alpha(accent, 0.8)}`,
            borderRadius: 3,
            background: a.cardBackground,
            boxShadow: glowBox(accent, 1),
            transition: 'border-color 300ms, box-shadow 300ms',
            overflow: 'auto',
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Typography
              variant="h5"
              sx={{ textTransform: 'uppercase', color: tile.headerText, textShadow: tile.headerTextShadow }}
            >
              {category.title}
              <Box component="span" sx={{ mx: 1.5, opacity: 0.5 }}>
                ·
              </Box>
              <Box component="span" sx={{ color: valueOnDark, textShadow: glowText(colors.gold, 0.7) }}>
                {clue.value}
              </Box>
            </Typography>
            <Stack direction="row" sx={{ alignItems: 'center' }}>
              <Tooltip title={no.game.undoHint}>
                <span>
                  <IconButton aria-label={no.game.undo} onClick={onUndo} disabled={!canUndo}>
                    <UndoIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <SoundToggle />
            </Stack>
          </Stack>

          {answeringTeam && (
            <Stack key={answeringTeam.id} spacing={1.5} sx={{ animation: `${slideDown} 350ms ease-out both` }}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                sx={{ alignItems: { md: 'baseline' }, justifyContent: 'space-between', gap: 1 }}
              >
                <Typography
                  variant="h4"
                  sx={{ color: colors.strong, textShadow: glowText(answeringTeam.color, 0.9), overflowWrap: 'anywhere' }}
                >
                  {no.clue.answering(answeringTeam.name)}
                </Typography>
                <Typography sx={{ color: failedTeams.length ? colors.warning : 'text.secondary', fontWeight: 600 }}>
                  {failedTeams.length ? no.clue.worthHalf(pointsNow) : no.clue.worth(pointsNow)}
                </Typography>
              </Stack>
              <TurnTimer key={answeringTeam.id} seconds={timerSeconds} />
            </Stack>
          )}

          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: showImage ? 2.5 : 4,
            }}
          >
            {showImage && (
              <Box
                component="img"
                src={clue.imageUrl}
                alt={clue.question}
                onError={() => setImageFailed(true)}
                sx={{
                  display: 'block',
                  mx: 'auto',
                  maxWidth: '100%',
                  maxHeight: answerRevealed ? '32vh' : '45vh',
                  objectFit: 'contain',
                  borderRadius: 2,
                  border: `2px solid ${alpha(colors.primary, 0.7)}`,
                  boxShadow: glowBox(colors.primary, 0.6),
                  bgcolor: alpha('#000000', 0.35),
                  transition: 'max-height 300ms',
                }}
              />
            )}
            <Typography
              sx={{
                fontFamily: fonts.body,
                textAlign: 'center',
                fontWeight: 700,
                fontSize: showImage ? 'clamp(1.4rem, 3.5vw, 3.5rem)' : 'clamp(1.6rem, 4.5vw, 4.5rem)',
                lineHeight: 1.2,
                color: colors.strong,
                textShadow: christmas ? '0 2px 6px rgba(0, 0, 0, 0.6)' : `0 0 18px ${alpha('#ffffff', 0.45)}`,
                whiteSpace: 'pre-wrap',
              }}
            >
              {clue.question}
            </Typography>

            {answerRevealed && (
              <Box sx={{ textAlign: 'center', animation: `${revealGlow} 500ms ease-out both` }}>
                <Box
                  sx={{ height: 2, mx: 'auto', mb: 2, width: '60%', bgcolor: colors.success, boxShadow: `0 0 12px ${colors.success}` }}
                />
                <Typography variant="overline" sx={{ fontSize: '1rem', color: colors.success }}>
                  {no.clue.answer}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: fonts.body,
                    color: christmas ? colors.strong : '#eaffe4',
                    fontWeight: 700,
                    fontSize: 'clamp(1.4rem, 3.5vw, 3.5rem)',
                    textShadow: glowText(colors.success, 1),
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
                    sx={{ fontSize: '1.2rem', px: 5, py: 1.5, boxShadow: `0 0 14px ${alpha(colors.success, 0.6)}` }}
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
                    color: colors.strong,
                    textShadow: glowText(winner?.color ?? colors.secondary, winner ? 1 : 0.6),
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
