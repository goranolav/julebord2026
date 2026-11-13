import { useRef, useState, type ChangeEvent } from 'react';
import {
  Alert,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Snackbar,
  Stack,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import ConfirmDialog from '../components/ConfirmDialog';
import { no } from '../i18n/no';
import { useBoards } from '../game/BoardsContext';
import { countClues } from '../game/boardUtils';
import { downloadJson, exportBoardsJson, parseBoardsJson } from '../storage/boardStorage';
import type { Board } from '../types/game';

type Feedback = { severity: 'success' | 'error'; message: string } | null;

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/æ/g, 'ae')
      .replace(/ø/g, 'o')
      .replace(/å/g, 'a')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'brett'
  );
}

const dateFormatter = new Intl.DateTimeFormat('nb-NO', { dateStyle: 'medium', timeStyle: 'short' });

export default function AdminListPage() {
  const { boards, createBoard, duplicateBoard, deleteBoard, importBoards } = useBoards();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toDelete, setToDelete] = useState<Board | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const handleCreate = () => {
    const board = createBoard();
    navigate(`/admin/${board.id}`);
  };

  const handleExport = (list: Board[], filename: string) => {
    downloadJson(filename, exportBoardsJson(list));
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const imported = parseBoardsJson(await file.text());
      importBoards(imported);
      setFeedback({ severity: 'success', message: no.admin.importSuccess(imported.length) });
    } catch {
      setFeedback({ severity: 'error', message: no.admin.importError });
    }
  };

  return (
    <PageLayout
      title={no.admin.title}
      backTo="/"
      actions={
        <Stack direction="row" spacing={1}>
          <Button startIcon={<UploadIcon />} onClick={() => fileInputRef.current?.click()}>
            {no.admin.import}
          </Button>
          <Button
            startIcon={<DownloadIcon />}
            disabled={boards.length === 0}
            onClick={() => handleExport(boards, 'jeopardy-brett.json')}
          >
            {no.admin.exportAll}
          </Button>
        </Stack>
      }
    >
      <input ref={fileInputRef} type="file" accept="application/json,.json" hidden onChange={handleImport} />

      <Stack spacing={2}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate} sx={{ alignSelf: 'flex-start' }}>
          {no.admin.newBoard}
        </Button>

        {boards.length === 0 ? (
          <Alert severity="info">{no.admin.empty}</Alert>
        ) : (
          <Paper variant="outlined">
            <List disablePadding>
              {boards.map((board, index) => (
                <ListItem
                  key={board.id}
                  divider={index < boards.length - 1}
                  disablePadding
                  secondaryAction={
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title={no.admin.duplicate}>
                        <IconButton aria-label={no.admin.duplicate} onClick={() => duplicateBoard(board.id)}>
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={no.admin.exportOne}>
                        <IconButton
                          aria-label={no.admin.exportOne}
                          onClick={() => handleExport([board], `${slugify(board.name)}.json`)}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={no.common.delete}>
                        <IconButton aria-label={no.common.delete} color="error" onClick={() => setToDelete(board)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  }
                >
                  <ListItemButton onClick={() => navigate(`/admin/${board.id}`)} sx={{ pr: 20 }}>
                    <ListItemText
                      primary={board.name || '—'}
                      secondary={`${no.home.boardSummary(board.categories.length, countClues(board))} · ${no.admin.lastUpdated(
                        dateFormatter.format(new Date(board.updatedAt)),
                      )}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Stack>

      <ConfirmDialog
        open={toDelete !== null}
        title={no.admin.deleteConfirmTitle}
        text={toDelete ? no.admin.deleteConfirmText(toDelete.name) : ''}
        confirmLabel={no.common.delete}
        danger
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) deleteBoard(toDelete.id);
          setToDelete(null);
        }}
      />

      <Snackbar open={feedback !== null} autoHideDuration={4000} onClose={() => setFeedback(null)}>
        {feedback ? (
          <Alert severity={feedback.severity} variant="filled" onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </PageLayout>
  );
}
