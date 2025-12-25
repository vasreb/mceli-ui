import { observer } from 'mobx-react-lite';
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { editGenerationStore } from '@/features/generation/stores/editGenerationStore';

export const RootsTab = observer(() => {
  const { generation } = editGenerationStore;
  const copyValue = generation?.roots?.map((root) => root.text ?? '').join('\n') ?? '';

  const handleCopy = () => {
    if (!copyValue) {
      return;
    }
    navigator.clipboard.writeText(copyValue);
  };

  if (!generation || !generation.roots || generation.roots.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No roots available
      </Typography>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <IconButton size="small" onClick={handleCopy} disabled={!copyValue}>
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Text</TableCell>
              <TableCell align="right">Sanity Overlap</TableCell>
              <TableCell>Sanity Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {generation.roots.map((root, index) => (
              <TableRow key={index}>
                <TableCell>{root.text}</TableCell>
                <TableCell align="right">{root.sanityOverlap?.toFixed(2) || '0.00'}</TableCell>
                <TableCell>{root.sanityStatus || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
});
