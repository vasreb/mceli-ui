import { observer } from 'mobx-react-lite';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { editGenerationStore } from '../stores/editGenerationStore';

export const RootsTab = observer(() => {
  const { generation } = editGenerationStore;

  if (!generation || !generation.roots || generation.roots.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No roots available
      </Typography>
    );
  }

  return (
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
              <TableCell align="right">
                {root.sanityOverlap?.toFixed(2) || '0.00'}
              </TableCell>
              <TableCell>{root.sanityStatus || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

