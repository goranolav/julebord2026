import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import HomeIcon from '@mui/icons-material/Home';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import BoardGrid from '../components/BoardGrid';
import ClueDialog from '../components/ClueDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import Scoreboard from '../components/Scoreboard';
import SoundToggle from '../components/SoundToggle';
import { no } from '../i18n/no';
import { useGame } from '../game/GameContext';
import { findClue, VALUE_STEP } from '../game/boardUtils';
import { currentTurnTeam } from '../game/gameReducer';
import { NEON, neonText, slideDown } from '../styles/neon';

/** Remembers which game already played the board intro, so it only runs once per game. */
let introPlayedForGame: string | null = null;

export default function GamePage() {
  const { game, dispatch } = useGame();
  const [confirmEnd, setConfirmEnd] = useState(false);
  // Each new game gets fresh team ids, so the first team id identifies the game.
  const gameKey = game?.teams[0]?.id ?? null;
  const animateIn = gameKey !== null && introPlayedForGame !== gameKey;

  useEffect(() => {
    introPlayedForGame = gameKey;
  }, [gameKey]);

  const handleCorrect = useCallback(() => dispatch({ type: 'MARK_CORRECT' }), [dispatch]);
  const handleWrong = useCallback(() => dispatch({ type: 'MARK_WRONG' }), [dispatch]);
  const handleReveal = useCallback(() => dispatch({ type: 'REVEAL_ANSWER' }), [dispatch]);
  const handleFinish = useCallback(() => dispatch({ type: 'FINISH_CLUE' }), [dispatch]);
  const handleAdjust = useCallback(
    (teamId: string, delta: number) => dispatch({ type: 'ADJUST_SCORE', teamId, delta }),
    [dispatch],
  );

  if (!game) {
    return (
      <Stack spacing={2} sx={{ p: 4, maxWidth: 480, mx: 'auto' }}>
        <Alert severity="info">{no.game.noGame}</Alert>
        <Button component={RouterLink} to="/" variant="contained" startIcon={<HomeIcon />}>
          {no.game.toHome}
        </Button>
      </Stack>
    );
  }

  if (game.phase === 'finished') return <Navigate to="/result" replace />;

  const active = game.activeClueId ? findClue(game.board, game.activeClueId) : null;
  const turnTeam = currentTurnTeam(game);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: { xs: 1, md: 2 }, gap: { xs: 1, md: 2 } }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Typography variant="h5" sx={{ color: '#ffe8fb', textShadow: neonText(NEON.magenta, 0.7) }} noWrap>
          {game.board.name}
        </Typography>
        {turnTeam && (
          <Typography
            key={turnTeam.id}
            role="status"
            variant="h6"
            noWrap
            sx={{
              flexShrink: 1,
              minWidth: 0,
              color: '#fff',
              textShadow: neonText(turnTeam.color, 0.8),
              animation: `${slideDown} 400ms ease-out both`,
            }}
          >
            {no.game.turn(turnTeam.name)}
          </Typography>
        )}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <SoundToggle />
          <Button component={RouterLink} to="/" color="inherit" startIcon={<HomeIcon />}>
            {no.game.toHome}
          </Button>
          <Button variant="outlined" color="inherit" startIcon={<FlagIcon />} onClick={() => setConfirmEnd(true)}>
            {no.game.endGame}
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <BoardGrid
          board={game.board}
          usedClueIds={game.usedClueIds}
          animateIn={animateIn}
          onSelectClue={(clueId) => dispatch({ type: 'SELECT_CLUE', clueId })}
        />
      </Box>

      <Scoreboard
        teams={game.teams}
        step={VALUE_STEP}
        onAdjust={handleAdjust}
        turnTeamId={turnTeam?.id}
        answeringTeamId={game.answeringTeamId}
      />

      {active && (
        <ClueDialog
          key={active.clue.id}
          category={active.category}
          clue={active.clue}
          teams={game.teams}
          timerSeconds={game.board.timerSeconds}
          answeringTeamId={game.answeringTeamId}
          failedTeamIds={game.failedTeamIds}
          answerRevealed={game.answerRevealed}
          clueResult={game.clueResult}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
          onReveal={handleReveal}
          onFinish={handleFinish}
        />
      )}

      <ConfirmDialog
        open={confirmEnd}
        title={no.game.endGameConfirmTitle}
        text={no.game.endGameConfirmText}
        confirmLabel={no.game.endGame}
        onCancel={() => setConfirmEnd(false)}
        onConfirm={() => {
          setConfirmEnd(false);
          dispatch({ type: 'END_GAME' });
        }}
      />
    </Box>
  );
}
