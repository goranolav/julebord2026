import { useEffect } from 'react';
import { Box, Button, List, ListItem, ListItemText, Paper, Stack, Typography } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HomeIcon from '@mui/icons-material/Home';
import ReplayIcon from '@mui/icons-material/Replay';
import confetti from 'canvas-confetti';
import { Navigate, useNavigate } from 'react-router-dom';
import { no } from '../i18n/no';
import { useGame } from '../game/GameContext';
import { getWinners, rankTeams } from '../game/gameReducer';
import { prefersReducedMotion } from '../hooks/useAnimatedNumber';
import { alpha, DISPLAY_FONT, NEON, neonBox, neonText, pulse, revealGlow, TEAM_COLORS } from '../styles/neon';

function fireConfetti(colors: string[]): () => void {
  if (prefersReducedMotion() || typeof HTMLCanvasElement === 'undefined' || navigator.userAgent.includes('jsdom')) {
    return () => {};
  }
  const timers: number[] = [];
  const burst = (delay: number, options: confetti.Options) => {
    timers.push(window.setTimeout(() => void confetti({ colors, disableForReducedMotion: true, ...options }), delay));
  };

  burst(150, { particleCount: 140, spread: 100, startVelocity: 55, origin: { x: 0.5, y: 0.35 } });
  burst(700, { particleCount: 80, angle: 60, spread: 70, origin: { x: 0, y: 0.7 } });
  burst(700, { particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.7 } });
  burst(1500, { particleCount: 120, spread: 160, startVelocity: 40, origin: { x: 0.5, y: 0.2 } });

  return () => {
    timers.forEach((t) => window.clearTimeout(t));
    confetti.reset();
  };
}

export default function ResultPage() {
  const { game, dispatch } = useGame();
  const navigate = useNavigate();
  const finished = game?.phase === 'finished';
  const winners = game ? getWinners(game.teams) : [];
  const winnerColorKey = winners.map((w) => w.color).join(',');

  useEffect(() => {
    if (!finished) return undefined;
    const colors = Array.from(new Set([...winnerColorKey.split(',').filter(Boolean), ...TEAM_COLORS, '#ffffff']));
    return fireConfetti(colors);
  }, [finished, winnerColorKey]);

  if (!game) return <Navigate to="/" replace />;
  if (!finished) return <Navigate to="/game" replace />;

  const ranked = rankTeams(game.teams);
  const headlineColor = winners.length === 1 ? winners[0].color : NEON.yellow;

  const playAgain = () => {
    dispatch({ type: 'START_GAME', board: game.board, teamNames: game.teams.map((t) => t.name) });
    navigate('/game');
  };

  const toHome = () => {
    dispatch({ type: 'RESET' });
    navigate('/');
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 6, px: 2 }}>
      <Stack spacing={3} sx={{ maxWidth: 680, mx: 'auto', alignItems: 'center', textAlign: 'center' }}>
        <EmojiEventsIcon
          sx={{
            fontSize: 130,
            color: '#fffbe0',
            filter: `drop-shadow(0 0 8px ${NEON.yellow}) drop-shadow(0 0 22px ${NEON.yellow})`,
            animation: `${pulse} 1.8s ease-in-out infinite`,
          }}
        />
        <Typography variant="overline" sx={{ fontSize: '1.2rem', color: '#e9feff', textShadow: neonText(NEON.cyan, 0.5) }}>
          {winners.length > 1 ? no.result.winners : no.result.winner}
        </Typography>
        <Typography
          variant="h2"
          sx={{
            color: '#fff',
            textShadow: neonText(headlineColor, 1.3),
            fontSize: { xs: '2.4rem', md: '4rem' },
            overflowWrap: 'anywhere',
            animation: `${revealGlow} 900ms ease-out both`,
          }}
        >
          {winners.map((w) => w.name).join(' & ')}
        </Typography>

        <Paper variant="outlined" sx={{ width: '100%', mt: 2 }}>
          <Typography variant="h6" sx={{ pt: 2, color: '#e9feff', textShadow: neonText(NEON.cyan, 0.4) }}>
            {no.result.title}
          </Typography>
          <List sx={{ px: 1 }}>
            {ranked.map((team) => {
              const place = ranked.findIndex((t) => t.score === team.score) + 1;
              const isWinner = winners.includes(team);
              return (
                <ListItem
                  key={team.id}
                  sx={{
                    my: 1,
                    borderRadius: 2,
                    border: `2px solid ${alpha(team.color, isWinner ? 1 : 0.5)}`,
                    bgcolor: alpha(team.color, isWinner ? 0.14 : 0.05),
                    boxShadow: isWinner ? neonBox(team.color, 0.7) : 'none',
                  }}
                >
                  <Typography sx={{ width: 44, fontFamily: DISPLAY_FONT, fontWeight: 700, color: team.color }}>
                    {no.result.place(place)}
                  </Typography>
                  <ListItemText
                    primary={team.name}
                    slotProps={{
                      primary: {
                        sx: { fontWeight: isWinner ? 700 : 400, fontSize: '1.25rem', textAlign: 'left' },
                      },
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: DISPLAY_FONT,
                      fontWeight: 900,
                      fontSize: '1.5rem',
                      color: '#fff',
                      textShadow: neonText(team.color, isWinner ? 0.9 : 0.4),
                    }}
                  >
                    {team.score}
                  </Typography>
                </ListItem>
              );
            })}
          </List>
        </Paper>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
          <Button variant="contained" color="secondary" size="large" startIcon={<ReplayIcon />} onClick={playAgain}>
            {no.result.playAgain}
          </Button>
          <Button variant="outlined" size="large" startIcon={<HomeIcon />} onClick={toHome}>
            {no.result.toHome}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
