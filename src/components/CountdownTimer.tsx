import { Box, IconButton, LinearProgress, Stack, Tooltip, Typography } from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { no } from '../i18n/no';
import type { Countdown } from '../hooks/useCountdown';
import { DISPLAY_FONT, flicker, NEON, neonText, pulse } from '../styles/neon';

interface CountdownTimerProps {
  countdown: Countdown;
  showControls?: boolean;
}

function timerColor(percent: number, expired: boolean): string {
  if (expired || percent <= 20) return NEON.magenta;
  if (percent <= 50) return NEON.yellow;
  return NEON.cyan;
}

export default function CountdownTimer({ countdown, showControls = true }: CountdownTimerProps) {
  const { remaining, total, isRunning, isExpired, start, pause, restart } = countdown;
  const percent = total > 0 ? (remaining / total) * 100 : 0;
  const color = timerColor(percent, isExpired);
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
            fontFamily: DISPLAY_FONT,
            fontWeight: 900,
            fontSize: '2rem',
            minWidth: '4ch',
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
            color: '#fff',
            textShadow: neonText(color, 0.8),
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
            color: '#fff',
            textShadow: neonText(NEON.magenta, 1.2),
            animation: `${flicker} 1.2s linear 2`,
          }}
        >
          {no.clue.timeUp}
        </Typography>
      )}
    </Stack>
  );
}
