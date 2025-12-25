import { MouseEvent } from 'react';
import {
  TableRow,
  TableCell,
  Box,
  Typography,
  Tooltip,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import type { Generation } from '../stores/generationListStore';
import { commentStore } from '../../generation/analyze/stores/commentStore';
import { CommentCell } from '../../generation/analyze/components/CommentCell';

interface GenerationRowProps {
  generation: Generation;
  copiedId: string | null;
  onCopyId: (id: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onRetry: (id: string) => void;
  onOpenBaseQueries: (queries: string[]) => void;
  getStatusColor: (status: string) => string;
}

export const GenerationRow = ({
  generation,
  copiedId,
  onCopyId,
  onView,
  onEdit,
  onRetry,
  onOpenBaseQueries,
  getStatusColor,
}: GenerationRowProps) => {
  const baseQueryTexts = generation.baseQueries.map((bq) => bq.text);
  const handleBaseQueryClick = (event: MouseEvent<HTMLTableCellElement>) => {
    if (baseQueryTexts.length > 0) {
      onOpenBaseQueries(baseQueryTexts);
    }
    event.stopPropagation();
  };

  const rowColor = commentStore.getEntry(generation.id)?.color ?? undefined;

  return (
    <TableRow key={generation.id} hover sx={{ backgroundColor: rowColor ?? 'inherit' }}>
      <TableCell
        sx={{
          width: 30,
          textAlign: 'center',
        }}
      >
        <CommentCell rowId={generation.id} width={200} />
      </TableCell>
      <TableCell>{generation.createdAt}</TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">
            {generation.id.slice(0, 5)}...{generation.id.slice(-5)}
          </Typography>
          <Tooltip title={copiedId === generation.id ? 'Copied!' : 'Copy ID'}>
            <IconButton size="small" onClick={() => onCopyId(generation.id)} sx={{ p: 0.5 }}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
      <TableCell
        sx={{
          maxWidth: 200,
          cursor: baseQueryTexts.length > 0 ? 'pointer' : 'default',
        }}
        onClick={handleBaseQueryClick}
      >
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            fontSize: '0.75rem',
            lineHeight: '1.2',
            whiteSpace: 'normal',
          }}
        >
          {baseQueryTexts.slice(0, 5).join(', ') || 'No base queries'}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip label={generation.status} color={getStatusColor(generation.status) as any} size="small" />
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          <strong>Total:</strong> {generation.snapshots}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          BQ: {generation.stats.baseQueriesSerpSnapshotsCount}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Roots: {generation.stats.rootsSerpSnapshotsCount}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Variants: {generation.stats.variantsSnapshotsCount}
        </Typography>
      </TableCell>
      <TableCell>
        {generation.metrics.baseQueries} / {generation.metrics.rootQueries} / {generation.metrics.variantQueries} /{' '}
        {generation.metrics.clusterQueries}
      </TableCell>
      <TableCell>
        {generation.errors.length > 0 ? (
          <Tooltip title={generation.errors.join('\n')}>
            <Chip color="error" size="small" label={`${generation.errors.length} errors`} />
          </Tooltip>
        ) : (
          <Typography variant="body2" color="text.secondary">
            0 errors
          </Typography>
        )}
      </TableCell>
      <TableCell align="right">
        <Tooltip title="View">
          <IconButton size="small" onClick={() => onView(generation.id)} color="primary">
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => onEdit(generation.id)} color="primary">
            <EditIcon />
          </IconButton>
        </Tooltip>
        {generation.status === 'failed' && (
          <Tooltip title="Retry">
            <IconButton size="small" onClick={() => onRetry(generation.id)} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}
      </TableCell>
    </TableRow>
  );
};

