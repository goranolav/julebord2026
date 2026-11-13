import { Box, IconButton, LinearProgress, Stack, Tooltip, Typography } from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { no } from '../i18n/no';
import type { Countdown } from '../hooks/useCountdown';
import { pulse } from '../styles/neon';
import type { Appearance } from '../styles/appearance';
import { useAppearance } from '../styles/appearanceMode';

interface CountdownTimerProps {
  countdown: Countdown;
  showControls?: boolean;
}

function timerColor(a: Appearance, percent: number, expired: boolean): string {
  if (expired || percent <= 20) return a.colors.secondary;
  if (percent <= 50) return a.colors.gold;
  // Christmas: green → gold → red.
  return a.id === 'christmas' ? a.colors.success : a.colors.primary;
}

export default function CountdownTimer({ countdown, showControls = true }: CountdownTimerProps) {
  const { remaining, total, isRunning, isExpired, start, pause, restart } = countdown;
  const percent = total > 0 ? (remaining / total) * 100 : 0;
  const appearance = useAppearance();
  const { glowText, fonts, colors } = appearance;
  const color = timerColor(appearance, percent, isExpired);
  const urgent = !isExpired && isRunning && percent <= 20;

  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <LinearProgress
            variant="determinate"
            value={percent}
            sx={{
              height: 12,
              borderRadius: 6,
              border: `1px solid ${color}`,
              boxShadow: `0 0 10px ${color}`,
              '& .MuiLinearProgress-bar': {
                bgcolor: color,
                boxShadow: `0 0 16px ${color}`,
                transition: 'transform 1s linear, background-color 300ms',
              },
            }}
          />
        </Box>
        <Typography
          role="timer"
          aria-live="off"
          sx={{
            fontFamily: fonts.display,
            fontWeight: 900,
            fontSize: '2rem',
            minWidth: '4ch',
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
            color: colors.strong,
            textShadow: glowText(color, 0.8),
            animation: urgent ? `${pulse} 1s ease-in-out infinite` : 'none',
          }}
        >
          {no.clue.secondsLeft(remaining)}
        </Typography>
        {showControls && (
          <Stack direction="row">
            {!isExpired && (
              <Tooltip title={isRunning ? no.clue.pause : no.clue.resume}>
                <IconButton onClick={isRunning ? pause : start} aria-label={isRunning ? no.clue.pause : no.clue.resume}>
                  {isRunning ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={no.clue.restart}>
              <IconButton onClick={restart} aria-label={no.clue.restart}>
                <RestartAltIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Stack>
      {isExpired && (
        <Typography
          role="alert"
          variant="h4"
          sx={{
            textAlign: 'center',
            color: colors.strong,
            textShadow: glowText(colors.secondary, 1.2),
            animation: `${appearance.attention} 1.2s ease-in-out 2`,
          }}
        >
          {no.clue.timeUp}
        </Typography>
      )}
    </Stack>
  );
}
