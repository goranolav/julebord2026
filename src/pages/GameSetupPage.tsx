import { useState, type FormEvent } from 'react';
import { Alert, Box, Button, IconButton, Paper, Stack, TextField, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutlined';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { no } from '../i18n/no';
import { useBoards } from '../game/BoardsContext';
import { useGame } from '../game/GameContext';
import { MAX_TEAMS, MIN_TEAMS } from '../game/gameReducer';
import { validateBoard } from '../game/boardUtils';
import { createId } from '../utils/id';
import { alpha } from '../styles/neon';
import { useAppearance } from '../styles/appearanceMode';

interface TeamInput {
  key: string;
  name: string;
}

const initialTeams = (): TeamInput[] =>
  Array.from({ length: MIN_TEAMS }, (_, i) => ({ key: createId(), name: no.setup.teamName(i + 1) }));

export default function GameSetupPage() {
  const { boardId = '' } = useParams();
  const { getBoard } = useBoards();
  const { dispatch } = useGame();
  const navigate = useNavigate();
  const board = getBoard(boardId);
  const { teamColors, glowBox } = useAppearance();
  const teamColor = (index: number) => teamColors[index % teamColors.length];

  const [teams, setTeams] = useState<TeamInput[]>(initialTeams);
  const [error, setError] = useState<string | null>(null);

  if (!board) {
    return (
      <PageLayout title={no.setup.title} backTo="/">
        <Alert severity="error">{no.setup.boardNotFound}</Alert>
      </PageLayout>
    );
  }

  const boardErrors = validateBoard(board);

  const updateTeam = (key: string, name: string) => {
    setTeams((prev) => prev.map((t) => (t.key === key ? { ...t, name } : t)));
  };

  const addTeam = () => {
    setTeams((prev) => [...prev, { key: createId(), name: no.setup.teamName(prev.length + 1) }]);
  };

  const removeTeam = (key: string) => {
    setTeams((prev) => prev.filter((t) => t.key !== key));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const names = teams.map((t) => t.name.trim());
    if (names.some((n) => !n)) {
      setError(no.setup.teamNameRequired);
      return;
    }
    if (new Set(names.map((n) => n.toLowerCase())).size !== names.length) {
      setError(no.setup.teamNamesUnique);
      return;
    }
    dispatch({ type: 'START_GAME', board, teamNames: names });
    navigate('/game');
  };

  return (
    <PageLayout title={`${no.setup.title} – ${board.name}`} backTo="/" maxWidth="sm">
      {boardErrors.length > 0 ? (
        <Alert severity="warning">{no.home.invalidBoard}</Alert>
      ) : (
        <Paper variant="outlined" sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              {no.setup.teamCountHint(MIN_TEAMS, MAX_TEAMS)}
            </Typography>

            {teams.map((team, index) => (
              <Stack key={team.key} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Box
                  aria-hidden
                  sx={{
                    width: 18,
                    height: 18,
                    flexShrink: 0,
                    borderRadius: '50%',
                    bgcolor: teamColor(index),
                    boxShadow: glowBox(teamColor(index), 0.8),
                  }}
                />
                <TextField
                  label={`${no.setup.teamLabel} ${index + 1}`}
                  value={team.name}
                  onChange={(e) => updateTeam(team.key, e.target.value)}
                  fullWidth
                  autoFocus={index === 0}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(teamColor(index), 0.6) },
                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: teamColor(index),
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: teamColor(index),
                      boxShadow: glowBox(teamColor(index), 0.5),
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: teamColor(index) },
                  }}
                />
                <Tooltip title={no.setup.removeTeam}>
                  <span>
                    <IconButton
                      aria-label={no.setup.removeTeam}
                      onClick={() => removeTeam(team.key)}
                      disabled={teams.length <= MIN_TEAMS}
                    >
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={addTeam}
              disabled={teams.length >= MAX_TEAMS}
              sx={{ alignSelf: 'flex-start' }}
            >
              {no.setup.addTeam}
            </Button>

            {error && <Alert severity="error">{error}</Alert>}

            <Button type="submit" variant="contained" size="large" startIcon={<PlayArrowIcon />}>
              {no.setup.startGame}
            </Button>
          </Stack>
        </Paper>
      )}
    </PageLayout>
  );
}
