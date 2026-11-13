import { memo, useState } from 'react';
import { Box, Button, Card, CardContent, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { no } from '../i18n/no';
import type { Category, Clue } from '../types/game';
import { createEmptyClue, isValidImageUrl, nextClueValue } from '../game/boardUtils';

interface CategoryEditorProps {
  category: Category;
  index: number;
  onChange: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

function CategoryEditor({ category, index, onChange, onDelete }: CategoryEditorProps) {
  const updateClue = (clueId: string, patch: Partial<Clue>) => {
    onChange({
      ...category,
      clues: category.clues.map((clue) => (clue.id === clueId ? { ...clue, ...patch } : clue)),
    });
  };

  const addClue = () => {
    onChange({ ...category, clues: [...category.clues, createEmptyClue(nextClueValue(category))] });
  };

  const deleteClue = (clueId: string) => {
    onChange({ ...category, clues: category.clues.filter((clue) => clue.id !== clueId) });
  };

  const setImageUrl = (clueId: string, value: string) => {
    onChange({
      ...category,
      clues: category.clues.map((clue) => {
        if (clue.id !== clueId) return clue;
        if (value === '') {
          const { imageUrl: _removed, ...rest } = clue;
          void _removed;
          return rest;
        }
        return { ...clue, imageUrl: value };
      }),
    });
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
          <Typography variant="overline" sx={{ minWidth: 60 }}>
            {no.editor.category} {index + 1}
          </Typography>
          <TextField
            label={no.editor.categoryTitle}
            value={category.title}
            onChange={(e) => onChange({ ...category, title: e.target.value })}
            size="small"
            fullWidth
          />
          <Tooltip title={no.editor.deleteCategory}>
            <IconButton aria-label={no.editor.deleteCategory} color="error" onClick={() => onDelete(category.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <Stack spacing={1.5}>
          {category.clues.map((clue) => (
            <Stack key={clue.id} spacing={1}>
            <Box
              sx={{
                display: 'grid',
                gap: 1,
                alignItems: 'center',
                gridTemplateColumns: { xs: '90px 1fr auto', md: '90px 2fr 1fr auto' },
              }}
            >
              <TextField
                label={no.editor.value}
                type="number"
                size="small"
                value={clue.value}
                onChange={(e) => updateClue(clue.id, { value: Number(e.target.value) })}
                slotProps={{ htmlInput: { min: 0, step: 100 } }}
              />
              <TextField
                label={no.editor.question}
                size="small"
                value={clue.question}
                onChange={(e) => updateClue(clue.id, { question: e.target.value })}
                multiline
                maxRows={4}
              />
              <TextField
                label={no.editor.answer}
                size="small"
                value={clue.answer}
                onChange={(e) => updateClue(clue.id, { answer: e.target.value })}
                sx={{ gridColumn: { xs: '2 / 3', md: 'auto' }, gridRow: { xs: 2, md: 'auto' } }}
              />
              <Tooltip title={no.editor.deleteClue}>
                <IconButton
                  aria-label={no.editor.deleteClue}
                  onClick={() => deleteClue(clue.id)}
                  sx={{ gridColumn: { xs: 3, md: 'auto' }, gridRow: { xs: 1, md: 'auto' } }}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', pl: { xs: 0, sm: '98px' } }}>
              <TextField
                label={no.editor.imageUrl}
                size="small"
                type="url"
                value={clue.imageUrl ?? ''}
                onChange={(e) => setImageUrl(clue.id, e.target.value)}
                placeholder="https://"
                fullWidth
              />
              {clue.imageUrl?.trim() && <ImagePreview key={clue.imageUrl} url={clue.imageUrl.trim()} />}
            </Stack>
            </Stack>
          ))}
        </Stack>

        <Button startIcon={<AddIcon />} onClick={addClue} sx={{ mt: 2 }}>
          {no.editor.addClue}
        </Button>
      </CardContent>
    </Card>
  );
}

/** Small thumbnail so the host spots broken links before the game. Keyed by URL to reset the error state. */
function ImagePreview({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  if (!isValidImageUrl(url) || failed) {
    return (
      <Tooltip title={no.editor.imagePreviewError}>
        <BrokenImageIcon color="warning" aria-label={no.editor.imagePreviewError} sx={{ flexShrink: 0 }} />
      </Tooltip>
    );
  }
  return (
    <Box
      component="img"
      src={url}
      alt={no.editor.imagePreviewAlt}
      onError={() => setFailed(true)}
      sx={{ height: 64, maxWidth: 120, objectFit: 'contain', borderRadius: 1, flexShrink: 0, bgcolor: 'rgba(0,0,0,0.3)' }}
    />
  );
}

export default memo(CategoryEditor);
