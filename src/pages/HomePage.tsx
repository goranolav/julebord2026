import { Alert, Box, Button, Card, CardActions, CardContent, Stack, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SettingsIcon from '@mui/icons-material/Settings';
import ReplayIcon from '@mui/icons-material/Replay';
import { Link as RouterLink } from 'react-router-dom';
import AppLogo from '../components/AppLogo';
import ChristmasToggle from '../components/ChristmasToggle';
import { no } from '../i18n/no';
import { useBoards } from '../game/BoardsContext';
import { useGame } from '../game/GameContext';
import { countClues, validateBoard } from '../game/boardUtils';
import { alpha, slideDown } from '../styles/neon';
import { useAppearance } from '../styles/appearanceMode';

export default function HomePage() {
  const { boards } = useBoards();
  const { game } = useGame();
  const { colors, glowText, glowBox, id } = useAppearance();

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 5, md: 8 }, px: 2, position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
        <ChristmasToggle />
      </Box>
      <Stack spacing={5} sx={{ maxWidth: 960, mx: 'auto' }}>
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <AppLogo />
          <Typography
            variant="h6"
            sx={{ color: colors.text, textShadow: glowText(colors.primary, 0.4), textTransform: id === 'christmas' ? 'none' : 'uppercase' }}
          >
            {no.home.subtitle}
          </Typography>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
          {game?.phase === 'playing' && (
            <Button
              component={RouterLink}
              to="/game"
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<ReplayIcon />}
            >
              {no.home.continueGame}
            </Button>
          )}
          <Button component={RouterLink} to="/admin" variant="outlined" size="large" startIcon={<SettingsIcon />}>
            {no.home.admin}
          </Button>
        </Stack>

        {boards.length === 0 && <Alert severity="info">{no.home.noBoards}</Alert>}

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          }}
        >
          {boards.map((board, index) => {
            const valid = validateBoard(board).length === 0;
            const color = valid ? colors.primary : colors.warning;
            return (
              <Card
                key={board.id}
                variant="outlined"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  border: `2px solid ${alpha(color, 0.7)}`,
                  boxShadow: `0 0 14px ${alpha(color, 0.3)}`,
                  transition: 'box-shadow 200ms, transform 200ms, border-color 200ms',
                  animation: `${slideDown} 450ms ease-out backwards`,
                  animationDelay: `${index * 70}ms`,
                  '&:hover': { borderColor: color, boxShadow: glowBox(color, 0.8), transform: 'translateY(-4px)' },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: colors.strong, textShadow: glowText(color, 0.4) }}>
                    {board.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {no.home.boardSummary(board.categories.length, countClues(board))}
                  </Typography>
                  {!valid && (
                    <Typography variant="body2" sx={{ mt: 1, color: colors.warning }}>
                      {no.home.invalidBoard}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    component={RouterLink}
                    to={`/setup/${board.id}`}
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    disabled={!valid}
                    fullWidth
                  >
                    {no.home.play}
                  </Button>
                </CardActions>
              </Card>
            );
          })}
        </Box>
      </Stack>
    </Box>
  );
}
