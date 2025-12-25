import { memo, useCallback, useMemo, type ChangeEvent } from 'react';
import { Box, Checkbox, Link, TableCell, TableRow, Typography } from '@mui/material';
import { CommentCell } from './CommentCell';
import { commentStore } from '../stores/commentStore';
import { computeDeviation } from './metricDeviation';
import type { AppSnapshotItem } from '@/api/types';

type AppRowProps = {
  item: AppSnapshotItem;
  orderedMetrics: string[];
  metricAccessors: Record<string, (metrics: AppSnapshotItem['metrics']) => unknown>;
  highlightedMetricField: string;
  onSelect: (id: string, appId: string) => void;
  isTextSelected: () => boolean;
  appMetricAverages: Record<string, number>;
  selectedAppIds: string[];
  onToggleSelection: (appId: string) => void;
};

export const AppRow = memo(
  ({
    item,
    orderedMetrics,
    metricAccessors,
    highlightedMetricField,
    onSelect,
    isTextSelected,
    appMetricAverages,
    selectedAppIds,
    onToggleSelection,
  }: AppRowProps) => {
    const entry = commentStore.getEntry(item.id);
    const rowColor = entry?.color ?? undefined;
    const stickyBg = rowColor ?? 'background.paper';

    const deviations = useMemo(
      () =>
        orderedMetrics.reduce<Record<string, ReturnType<typeof computeDeviation> | null>>((acc, metric) => {
          const value = metricAccessors[metric]?.(item.metrics);
          const numericValue = typeof value === 'number' ? value : undefined;
          acc[metric] = numericValue !== undefined ? computeDeviation(numericValue, appMetricAverages[metric]) : null;
          return acc;
        }, {}),
      [item.metrics, orderedMetrics, metricAccessors, appMetricAverages],
    );

    const formatMetricValue = (value: unknown) => {
      if (typeof value === 'number') {
        return value.toFixed(3);
      }
      if (typeof value === 'boolean') {
        return value ? 'yes' : 'no';
      }
      if (value === null || value === undefined) {
        return '—';
      }
      return String(value);
    };

    const handleClick = useCallback(() => {
      if (isTextSelected()) {
        window.getSelection()?.removeAllRanges();
        return;
      }
      onSelect(item.id, item.appId);
    }, [isTextSelected, onSelect, item.id, item.appId]);

    const isSelected = selectedAppIds.includes(item.appId);
    const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
      event.stopPropagation();
      onToggleSelection(item.appId);
    };

    return (
      <>
        <TableRow hover sx={{ cursor: 'pointer', backgroundColor: rowColor ?? 'inherit' }} onClick={handleClick}>
          <TableCell
            sx={{
              position: 'sticky',
              left: 0,
              backgroundColor: stickyBg,
              zIndex: 2,
              width: 30,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
              <CommentCell rowId={item.id} />
              <Checkbox
                size="small"
                checked={isSelected}
                onClick={(event) => event.stopPropagation()}
                onChange={handleCheckboxChange}
              />
            </Box>
          </TableCell>
          <TableCell
            sx={{
              position: 'sticky',
              left: '50px',
              backgroundColor: stickyBg,
              zIndex: 2,
            }}
          >
            {item.id}
          </TableCell>
          <TableCell
            sx={{
              position: 'sticky',
              left: '150px',
              backgroundColor: stickyBg,
              zIndex: 2,
              width: 120,
              minWidth: 120,
            }}
          >
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              {item.title ?? '—'}
            </Typography>
          </TableCell>
          <TableCell
            sx={{
              position: 'sticky',
              left: '270px',
              backgroundColor: stickyBg,
              zIndex: 2,
              width: 120,
              minWidth: 120,
            }}
          >
            <Link
              href={`https://play.google.com/store/apps/details?id=${item.appId}`}
              target="_blank"
              rel="noreferrer"
              underline="hover"
              onClick={(event) => event.stopPropagation()}
              sx={{
                fontSize: '0.875rem',
                display: 'inline-block',
                wordBreak: 'break-word',
                whiteSpace: 'normal',
                maxWidth: 120,
              }}
            >
              {item.appId}
            </Link>
          </TableCell>
          {orderedMetrics.map((metric) => {
            const value = metricAccessors[metric]?.(item.metrics);
            const deviation = deviations[metric];
            return (
              <TableCell
                key={`${item.id}-${metric}`}
                data-metric-column={metric}
                sx={{
                  backgroundColor: highlightedMetricField === metric ? 'rgba(0,0,0,0.04)' : undefined,
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                    {formatMetricValue(value)}
                  </Typography>
                  {deviation && (
                    <Typography variant="caption" sx={{ color: deviation.color, fontSize: '0.65rem' }}>
                      {deviation.text}
                    </Typography>
                  )}
                </Box>
              </TableCell>
            );
          })}
        </TableRow>
      </>
    );
  },
);
