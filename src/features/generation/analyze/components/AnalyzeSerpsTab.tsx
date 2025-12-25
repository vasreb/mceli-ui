import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { analyzeStore } from '../analyzeStore';
import { SERP_METRIC_FIELDS } from '../serpMetricsFields';
import { computeDeviation } from './metricDeviation';
import { MetricTipStore } from '../stores/metricTipStore';
import { SerpSnapshotDetailsModal } from './SerpSnapshotDetailsModal';
import { METRIC_INFO } from './metricInfo';
import { MetricInfoStrip } from './MetricInfoStrip';
import { CommentCell } from './CommentCell';
import { commentStore } from '../stores/commentStore';
import type { MetricInfo } from './types';

type AnalyzeSerpsTabProps = {
  id?: string;
};

const SORT_FIELDS = [
  { value: '', label: 'Нет' },
  ...SERP_METRIC_FIELDS.map(([metric, label]) => ({
    value: `metrics.${metric}`,
    label,
  })),
];

export const AnalyzeSerpsTab = observer(({ id }: AnalyzeSerpsTabProps) => {
  const {
    serpsList,
    serpsListTotal,
    isLoadingSerpsList,
    serpsListError,
  } = analyzeStore;
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [metricStore] = useState(() => new MetricTipStore());
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!id) return;
    const sortBy =
      sortField !== ''
        ? {
            field: sortField,
            direction: sortDirection,
          }
        : undefined;
    analyzeStore.loadSerps(id, {
      page,
      perPage: rowsPerPage,
      search: searchTerm,
      sortBy,
    });
  }, [id, page, rowsPerPage, searchTerm, sortField, sortDirection]);

  useEffect(() => {
    setPage(1);
    setRowsPerPage(50);
    setSearchInput('');
    setSearchTerm('');
    setSortField('');
    setSortDirection('DESC');
  }, [id]);

  useEffect(() => {
    const handler = setTimeout(() => setSearchTerm(searchInput.trim()), 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  if (!id) {
    return (
      <Typography variant="body2" color="text.secondary">
        Сначала сохраните генерацию, чтобы загрузить SERP-анализ.
      </Typography>
    );
  }

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage + 1);
  };

  const handleRowsPerPageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(nextPerPage);
    setPage(1);
  };

  const handleSortFieldChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setSortField(value);
    if (value === '') {
      setSortDirection('DESC');
    }
  };

  const handleSortDirectionChange = (event: SelectChangeEvent) => {
    setSortDirection(event.target.value as 'ASC' | 'DESC');
  };

  const highlightedMetricField =
    sortField && sortField.startsWith('metrics.') ? sortField.substring('metrics.'.length) : '';
  const metricTips: MetricInfo[] = METRIC_INFO;
  const metricLabelMap = useMemo<Record<string, string>>(
    () => Object.fromEntries(metricTips.map((tip) => [tip.metric, tip.title])),
    []
  );
  const metricAccessorMap = useMemo(
    () =>
      Object.fromEntries(
        SERP_METRIC_FIELDS.map(([metric, , accessor]) => [metric, accessor])
      ),
    []
  );
  const orderedMetrics = metricStore.getMetricKeys(metricTips);
  const isTextSelected = () => {
    if (typeof window === 'undefined') {
      return false;
    }
    const selection = window.getSelection?.();
    return Boolean(selection && selection.toString().trim().length > 0);
  };

  const scrollToMetricColumn = (metric: string) => {
    const container = tableContainerRef.current;
    if (!container) {
      return;
    }
    const cell = container.querySelector<HTMLElement>(`[data-metric-column="${metric}"]`);
    if (cell) {
      const target =
        cell.offsetLeft - container.clientWidth / 2 + cell.offsetWidth / 2;
      container.scrollTo({ left: Math.max(target, 0), behavior: 'smooth' });
    }
  };

  const handleMetricHeaderClick = (metric: string) => {
    const field = `metrics.${metric}`;
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortField(field);
      setSortDirection('DESC');
    }
    requestAnimationFrame(() => scrollToMetricColumn(metric));
  };

  const formatMetricValue = (value: unknown) => {
    if (typeof value === 'number') {
      return value.toFixed(3);
    }
    return String(value ?? '—');
  };

  const TABLE_MAX_HEIGHT = 'calc(100vh - 100px)';

  return (
    <Box>
      {serpsListError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {serpsListError}
        </Alert>
      )}
      <Box
        sx={{
          mb: 2,
          backgroundColor: '#f5f5f5',
          borderRadius: 2,
          p: 2,
          border: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Что отражают метрики
        </Typography>
        <MetricInfoStrip
          tips={METRIC_INFO}
          expandedTip={expandedTip}
          onToggleTip={(metric) => setExpandedTip((prev) => (prev === metric ? null : metric))}
          onSortTip={handleMetricHeaderClick}
          store={metricStore}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2,
          alignItems: 'center',
        }}
      >
        <TextField
          label="Search"
          size="small"
          placeholder="Поиск по query text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ flex: 1, minWidth: 240 }}
        />
        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="serp-sort-field-label">Sort field</InputLabel>
            <Select
              labelId="serp-sort-field-label"
              label="Sort field"
              value={sortField}
              onChange={handleSortFieldChange}
            >
              {SORT_FIELDS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="serp-sort-direction-label">Direction</InputLabel>
            <Select
              labelId="serp-sort-direction-label"
              label="Direction"
              value={sortDirection}
              onChange={handleSortDirectionChange}
              disabled={sortField === ''}
            >
              <MenuItem value="ASC">ASC</MenuItem>
              <MenuItem value="DESC">DESC</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Paper variant="outlined">
        {isLoadingSerpsList ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
          <TablePagination
                  component="div"
                  count={serpsListTotal}
                  page={page - 1}
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[100, 50, 5, 10, 25]}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleRowsPerPageChange}
                />
          <TableContainer
            ref={tableContainerRef}
            sx={{
              maxHeight: TABLE_MAX_HEIGHT,
              overflowY: 'auto',
            }}
          >
              <Table size="small">
              <TableHead
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 5,
                  backgroundColor: 'background.paper',
                }}
              >
                <TableRow>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 4,
                      backgroundColor: 'background.paper',
                      width: 30,
                      textAlign: 'center',
                    }}
                  >
                    💬
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: '30px',
                      zIndex: 4,
                      backgroundColor: 'background.paper',
                    }}
                  >
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: '168px',
                      zIndex: 4,
                      backgroundColor: 'background.paper',
                    }}
                  >
                    Query
                  </TableCell>
                  {orderedMetrics.map((metric) => (
                    <TableCell
                      key={metric}
                      onClick={() => handleMetricHeaderClick(metric)}
                      data-metric-column={metric}
                      sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 6,
                        fontSize: '0.65rem',
                        cursor: 'pointer',
                        backgroundColor:
                          metricStore.getColor(metric) ??
                          (highlightedMetricField === metric ? 'rgba(0,0,0,0.04)' : undefined),
                      }}
                    >
                      {metricLabelMap[metric] ?? metric}
                    </TableCell>
                  ))}
                </TableRow>
                </TableHead>
                <TableBody>
                  {serpsList.map((item) => {
                    const rowColor = commentStore.getEntry(item.id)?.color ?? undefined;
                    const stickyBg = rowColor ?? 'background.paper';
                    const handleRowClick = () => {
                      if (isTextSelected()) {
                        window.getSelection()?.removeAllRanges();
                        return;
                      }
                      setSelectedSnapshotId(item.snapshot.id);
                    };
                    return (
                      <TableRow
                        key={item.id}
                        hover
                        sx={{ cursor: 'pointer', backgroundColor: rowColor ?? 'inherit' }}
                        onClick={handleRowClick}
                      >
                        <TableCell
                          sx={{
                            position: 'sticky',
                            left: 0,
                            backgroundColor: stickyBg,
                            zIndex: 2,
                            width: 30,
                          }}
                        >
                          <CommentCell rowId={item.id} />
                        </TableCell>
                        <TableCell
                          sx={{
                            position: 'sticky',
                            left: '30px',
                            backgroundColor: stickyBg,
                            zIndex: 2,
                          }}
                        >
                          {item.snapshot.id}
                        </TableCell>
                        <TableCell
                          sx={{
                            position: 'sticky',
                            left: '168px',
                            backgroundColor: stickyBg,
                            zIndex: 2,
                          }}
                        >
                          {item.snapshot.queryText}
                        </TableCell>
                        {orderedMetrics.map((metric) => {
                          const accessor = metricAccessorMap[metric];
                          const value = accessor ? accessor(item.metrics) : undefined;
                          const numericValue = typeof value === 'number' ? value : undefined;
                          const deviation =
                            numericValue !== undefined ? computeDeviation(numericValue, analyzeStore.serpsMetricAverages[metric]) : null;
                          return (
                            <TableCell
                              key={`${item.id}-${metric}`}
                              data-metric-column={metric}
                              sx={{
                                backgroundColor:
                                  highlightedMetricField === metric ? 'rgba(0,0,0,0.04)' : undefined,
                                minWidth: 110,
                              }}
                            >
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                                <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                  {formatMetricValue(value)}
                                </Typography>
                                {deviation && (
                                  <Typography
                                    variant="caption"
                                    sx={{ color: deviation.color, fontSize: '0.65rem' }}
                                  >
                                    {deviation.text}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
                </TableContainer>
          </Box>
        )}
      </Paper>
      {!isLoadingSerpsList && serpsList.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          SERP-данные пока не загружены. Попробуйте изменить фильтры или запустить анализ.
        </Typography>
      )}
      <SerpSnapshotDetailsModal
        open={Boolean(selectedSnapshotId)}
        snapshotId={selectedSnapshotId ?? undefined}
        onClose={() => setSelectedSnapshotId(null)}
      />
    </Box>
  );
});

