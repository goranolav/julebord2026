import { memo } from 'react';
import { Box, Button, Card, CardContent, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { no } from '../i18n/no';
import type { Category, Clue } from '../types/game';
import { createEmptyClue, nextClueValue } from '../game/boardUtils';

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
            <Box
              key={clue.id}
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
          ))}
        </Stack>

        <Button startIcon={<AddIcon />} onClick={addClue} sx={{ mt: 2 }}>
          {no.editor.addClue}
        </Button>
      </CardContent>
    </Card>
  );
}

export default memo(CategoryEditor);
