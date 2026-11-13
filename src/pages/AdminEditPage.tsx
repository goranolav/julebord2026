import { useCallback, useState } from 'react';
import { Alert, Box, Button, Snackbar, Stack, TextField, Tooltip, Typography } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import { Link as RouterLink, useParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import CategoryEditor from '../components/CategoryEditor';
import { no } from '../i18n/no';
import { useBoards } from '../game/BoardsContext';
import { createEmptyCategory, MAX_TIMER_SECONDS, MIN_TIMER_SECONDS, validateBoard } from '../game/boardUtils';
import type { Board, Category } from '../types/game';

export default function AdminEditPage() {
  const { boardId = '' } = useParams();
  const { getBoard } = useBoards();
  const board = getBoard(boardId);

  if (!board) {
    return (
      <PageLayout title={no.editor.title} backTo="/admin">
        <Alert severity="error">{no.editor.notFound}</Alert>
      </PageLayout>
    );
  }

  // Keyed so the draft is re-initialised if we navigate to another board.
  return <BoardEditor key={board.id} board={board} />;
}

function stripMeta(board: Board): string {
  return JSON.stringify({ ...board, updatedAt: undefined });
}

function BoardEditor({ board }: { board: Board }) {
  const { saveBoard } = useBoards();
  const [draft, setDraft] = useState<Board>(board);
  const [errors, setErrors] = useState<string[]>([]);
  const [savedOpen, setSavedOpen] = useState(false);

  const isDirty = stripMeta(draft) !== stripMeta(board);

  const updateCategory = useCallback((category: Category) => {
    setDraft((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === category.id ? category : c)),
    }));
  }, []);

  const deleteCategory = useCallback((categoryId: string) => {
    setDraft((prev) => ({ ...prev, categories: prev.categories.filter((c) => c.id !== categoryId) }));
  }, []);

  const addCategory = () => {
    setDraft((prev) => ({ ...prev, categories: [...prev.categories, createEmptyCategory()] }));
  };

  const handleSave = () => {
    const validationErrors = validateBoard(draft);
    setErrors(validationErrors);
    if (validationErrors.length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    saveBoard(draft);
    setSavedOpen(true);
  };

  return (
    <PageLayout
      title={draft.name || no.editor.title}
      backTo="/admin"
      maxWidth="lg"
      actions={
        <Stack direction="row" spacing={1}>
          <Tooltip title={isDirty ? no.answerSheet.saveFirst : ''}>
            <span>
              <Button
                component={RouterLink}
                to={`/fasit/${board.id}`}
                startIcon={<PrintIcon />}
                disabled={isDirty}
              >
                {no.answerSheet.open}
              </Button>
            </span>
          </Tooltip>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={!isDirty}>
            {no.common.save}
          </Button>
        </Stack>
      }
    >
      <Stack spacing={3}>
        {errors.length > 0 && (
          <Alert severity="error" onClose={() => setErrors([])}>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
              {no.editor.fixErrors}
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </Box>
          </Alert>
        )}

        {isDirty && <Alert severity="warning">{no.editor.unsavedChanges}</Alert>}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label={no.editor.boardName}
            value={draft.name}
            onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
            fullWidth
          />
          <TextField
            label={no.editor.timerSeconds}
            type="number"
            value={draft.timerSeconds}
            onChange={(e) => setDraft((prev) => ({ ...prev, timerSeconds: Number(e.target.value) }))}
            slotProps={{ htmlInput: { min: MIN_TIMER_SECONDS, max: MAX_TIMER_SECONDS } }}
            sx={{ minWidth: 240 }}
          />
        </Stack>

        {draft.categories.map((category, index) => (
          <CategoryEditor
            key={category.id}
            category={category}
            index={index}
            onChange={updateCategory}
            onDelete={deleteCategory}
          />
        ))}

        <Button variant="outlined" startIcon={<AddIcon />} onClick={addCategory} sx={{ alignSelf: 'flex-start' }}>
          {no.editor.addCategory}
        </Button>
      </Stack>

      <Snackbar open={savedOpen} autoHideDuration={2500} onClose={() => setSavedOpen(false)}>
        <Alert severity="success" variant="filled" onClose={() => setSavedOpen(false)}>
          {no.editor.saved}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
}
