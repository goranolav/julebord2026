import { Alert, Box, Button, GlobalStyles, Stack, Tooltip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PrintIcon from '@mui/icons-material/Print';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { no } from '../i18n/no';
import { useBoards } from '../game/BoardsContext';
import { countClues } from '../game/boardUtils';

const INK = '#111';
const LINE = '#999';

/**
 * Printable answer key laid out like the game board: categories as columns,
 * one row per clue level. Only category, points and answer – no question text.
 */
const printStyles = `
  .neon-layer { display: none !important; }
  body { background: #fff !important; }
  @page { size: A4 landscape; margin: 10mm; }
  @media print {
    .no-print { display: none !important; }
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`;

export default function AnswerSheetPage() {
  const { boardId = '' } = useParams();
  const { getBoard } = useBoards();
  const navigate = useNavigate();
  const location = useLocation();
  const board = getBoard(boardId);

  // Opened directly (no history in the app)? Fall back to the admin panel.
  const goBack = () => (location.key === 'default' ? navigate('/admin') : navigate(-1));

  const toolbar = (
    <Stack className="no-print" direction="row" spacing={1} sx={{ mb: 2 }}>
      <Button onClick={goBack} startIcon={<ArrowBackIcon />} sx={{ color: INK }}>
        {no.common.back}
      </Button>
      {board && (
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={() => window.print()}
          sx={{ bgcolor: INK, color: '#fff', '&:hover': { bgcolor: '#333' } }}
        >
          {no.answerSheet.print}
        </Button>
      )}
    </Stack>
  );

  if (!board) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#fff', p: 3 }}>
        <GlobalStyles styles={printStyles} />
        {toolbar}
        <Alert severity="error">{no.answerSheet.notFound}</Alert>
      </Box>
    );
  }

  const columns = board.categories.map((category) => ({
    ...category,
    clues: [...category.clues].sort((a, b) => a.value - b.value),
  }));
  const rowCount = Math.max(0, ...columns.map((c) => c.clues.length));

  const cellSx = {
    border: `1px solid ${LINE}`,
    p: '6px 8px',
    verticalAlign: 'top',
    color: INK,
    fontSize: '11pt',
  } as const;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', color: INK, p: { xs: 2, md: 3 }, '@media print': { p: 0 } }}>
      <GlobalStyles styles={printStyles} />
      {toolbar}

      <Typography component="h1" sx={{ fontSize: '18pt', fontWeight: 800, color: INK }}>
        {no.answerSheet.title}: {board.name}
      </Typography>
      <Typography sx={{ fontSize: '10pt', color: '#555', mb: 1.5 }}>
        {no.answerSheet.summary(board.categories.length, countClues(board), board.timerSeconds)}
      </Typography>

      <Box
        component="table"
        sx={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', breakInside: 'avoid' }}
      >
        <thead>
          <tr>
            {columns.map((category) => (
              <Box
                component="th"
                key={category.id}
                scope="col"
                sx={{ ...cellSx, bgcolor: '#e8e8e8', fontWeight: 800, textTransform: 'uppercase', fontSize: '10pt' }}
              >
                {category.title}
              </Box>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }, (_, row) => (
            <tr key={row}>
              {columns.map((category) => {
                const clue = category.clues[row];
                if (!clue) return <Box component="td" key={category.id} sx={{ ...cellSx, bgcolor: '#f6f6f6' }} />;
                return (
                  <Box component="td" key={clue.id} sx={cellSx} data-testid={`answer-${clue.id}`}>
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 0.25 }}>
                      <Box
                        aria-hidden
                        sx={{ width: 12, height: 12, border: `1.5px solid ${INK}`, flexShrink: 0 }}
                      />
                      <Typography sx={{ fontSize: '9pt', fontWeight: 700, color: '#555' }}>{clue.value}</Typography>
                      {clue.imageUrl && (
                        <Tooltip title={no.answerSheet.hasImage}>
                          <ImageOutlinedIcon
                            aria-label={no.answerSheet.hasImage}
                            sx={{ fontSize: '11pt', color: '#555' }}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                    <Typography sx={{ fontWeight: 800, fontSize: '11pt', color: INK, overflowWrap: 'anywhere' }}>
                      {clue.answer}
                    </Typography>
                  </Box>
                );
              })}
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  );
}
