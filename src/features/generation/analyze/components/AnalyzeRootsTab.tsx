import { ChangeEvent, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Checkbox,
  FormControl,
  IconButton,
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
import { ROOT_METRIC_FIELDS } from '../rootMetricsFields';
import { ROOT_METRIC_INFO } from '../rootMetricInfo';
import { MetricInfoStrip } from './MetricInfoStrip';
import { RootDetailsModal } from './RootDetailsModal';
import { CommentCell } from './CommentCell';
import { commentStore } from '../stores/commentStore';
import { computeDeviation } from './metricDeviation';
import { MetricTipStore } from '../stores/metricTipStore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useNavigate } from '@tanstack/react-router';
import { useFilterParams } from '../hooks/useFilterParams';
import { RootSelectionPanel } from './RootSelectionPanel';

type AnalyzeRootsTabProps = {
  id?: string;
};

const SORT_FIELDS = [
  { value: '', label: 'Нет' },
  ...ROOT_METRIC_FIELDS.map(([metric]) => ({
    value: `metrics.${metric}`,
    label: metric,
  })),
];

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
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

export const AnalyzeRootsTab = observer(({ id }: AnalyzeRootsTabProps) => {
  const {
    rootsList,
    rootsListTotal,
    isLoadingRootsList,
    rootsListError,
    selectedRootIds,
  } = analyzeStore;
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const handleToggleRootSelection = useCallback(
    (rootId: string) => {
      const next = selectedRootIds.includes(rootId)
        ? selectedRootIds.filter((value) => value !== rootId)
        : [...selectedRootIds, rootId];
      analyzeStore.setSelectedRootIds(next);
    },
    [selectedRootIds],
  );
  const [selectedRootId, setSelectedRootId] = useState<string | null>(null);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const { filter, setFilterField } = useFilterParams<'clusterId'>();
  const navigate = useNavigate();

  const handlePlayRoot = (rootId: string) => {
    if (!id) return;
    navigate({
      to: '/generations/$id/analyze/$tab',
      params: { id, tab: 'apps' },
      search: { 'filter.rootId': rootId },
    });
  };

  const handleViewVariants = (rootId: string) => {
    if (!id) return;
    navigate({
      to: '/generations/$id/analyze/variants',
      params: { id },
      search: { 'filter.rootId': rootId },
    });
  };

  useEffect(() => {
    if (!id) return;
    const sortBy =
      sortField !== ''
        ? {
            field: sortField,
            direction: sortDirection,
          }
        : undefined;
    const normalizedFilter: Record<string, string> = {};
    if (filter.clusterId?.trim()) {
      normalizedFilter.clusterId = filter.clusterId.trim();
    }
    analyzeStore.loadRoots(id, {
      page,
      perPage: rowsPerPage,
      search: searchTerm,
      sortBy,
      filter: Object.keys(normalizedFilter).length ? normalizedFilter : undefined,
    });
  }, [
    id,
    page,
    rowsPerPage,
    searchTerm,
    sortField,
    sortDirection,
    filter.clusterId,
  ]);

  useEffect(() => {
    setPage(1);
    setRowsPerPage(100);
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
  }, [searchTerm, sortField, sortDirection]);

  useEffect(() => {
    return () => {
      analyzeStore.clearSelectedRootIds();
    };
  }, []);

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

  if (!id) {
    return (
      <Typography variant="body2" color="text.secondary">
        Сначала сохраните генерацию, чтобы загрузить roots-данные.
      </Typography>
    );
  }

  const highlightedMetricField =
    sortField && sortField.startsWith('metrics.') ? sortField.substring('metrics.'.length) : '';
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
      const target = cell.offsetLeft - container.clientWidth / 2 + cell.offsetWidth / 2;
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

  const [metricStore] = useState(() => new MetricTipStore());
  const orderedRootMetrics = metricStore.getMetricKeys(ROOT_METRIC_INFO);
  const rootMetricInfoMap = useMemo(
    () => Object.fromEntries(ROOT_METRIC_INFO.map((tip) => [tip.metric, tip])),
    []
  );
  const rootAccessorMap = useMemo(
    () => Object.fromEntries(ROOT_METRIC_FIELDS.map(([metric, accessor]) => [metric, accessor])),
    []
  );

  const TABLE_MAX_HEIGHT = 'calc(100vh - 360px)';

  return (
    <Box>
      {rootsListError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {rootsListError}
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
          tips={ROOT_METRIC_INFO}
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
          gap: 1,
          mb: 2,
          alignItems: 'center',
        }}
      >
        <TextField
          label="Search roots"
          size="small"
          placeholder="Root text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ flex: 1, minWidth: 240 }}
        />
        <TextField
          label="Cluster ID"
          size="small"
          placeholder="filter.clusterId"
          value={filter.clusterId ?? ''}
          onChange={(e) => setFilterField('clusterId', e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="roots-sort-field-label">Sort field</InputLabel>
            <Select
              labelId="roots-sort-field-label"
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
            <InputLabel id="roots-sort-direction-label">Direction</InputLabel>
            <Select
              labelId="roots-sort-direction-label"
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
        <>
          <TablePagination
            component="div"
            count={rootsListTotal}
            page={page - 1}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[100, 5, 10, 25]}
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
                      width: 30,
                      textAlign: 'center',
                    }}
                  >
                    ▶
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: '60px',
                      zIndex: 3,
                      backgroundColor: 'background.paper',
                    }}
                  >
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: '180px',
                      zIndex: 3,
                      backgroundColor: 'background.paper',
                    }}
                  >
                    Root text
                  </TableCell>
                  {orderedRootMetrics.map((metric) => (
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
                      {rootMetricInfoMap[metric]?.title ?? metric}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rootsList.map((item) => {
                  const rowColor = commentStore.getEntry(item.id)?.color ?? undefined;
                  return (
                    <TableRow
                      key={item.id}
                      sx={{ cursor: 'pointer', backgroundColor: rowColor ?? 'inherit' }}
                      onClick={() => {
                        if (isTextSelected()) {
                          window.getSelection()?.removeAllRanges();
                          return;
                        }
                        setSelectedRootId(item.id);
                      }}
                    >
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: 0,
                          backgroundColor: 'background.paper',
                          zIndex: 2,
                        }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
                          <CommentCell rowId={item.id} />
                          <Checkbox
                            size="small"
                            checked={selectedRootIds.includes(item.id)}
                            onClick={(event) => event.stopPropagation()}
                            onChange={(event) => {
                              event.stopPropagation();
                              handleToggleRootSelection(item.id);
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: '30px',
                          backgroundColor: 'background.paper',
                          zIndex: 2,
                          width: 30,
                          textAlign: 'center',
                        }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                        <IconButton
                          size="small"
                          onClick={(event: MouseEvent<HTMLButtonElement>) => {
                            event.stopPropagation();
                            handlePlayRoot(item.id);
                          }}
                        >
                          <PlayArrowIcon fontSize="small" />
                        </IconButton>
                          <IconButton
                            size="small"
                            onClick={(event: MouseEvent<HTMLButtonElement>) => {
                              event.stopPropagation();
                              handleViewVariants(item.id);
                            }}
                          >
                            <Typography variant="button" sx={{ fontSize: '0.75rem' }}>
                              V
                            </Typography>
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: '60px',
                          backgroundColor: 'background.paper',
                          zIndex: 2,
                        }}
                      >
                        {item.id}
                      </TableCell>
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: '180px',
                          backgroundColor: 'background.paper',
                          zIndex: 2,
                        }}
                      >
                        {item.text}
                      </TableCell>
                    {orderedRootMetrics.map((metric) => {
                      const accessor = rootAccessorMap[metric];
                      const rawValue = accessor ? accessor(item.metrics) : undefined;
                      const numericValue = typeof rawValue === 'number' ? rawValue : undefined;
                      const deviation =
                        numericValue !== undefined
                          ? computeDeviation(numericValue, analyzeStore.rootsMetricAverages[metric])
                          : null;
                      return (
                        <TableCell
                          key={`${item.id}-${metric}`}
                          data-metric-column={metric}
                          sx={{
                            backgroundColor:
                              highlightedMetricField === metric ? 'rgba(0,0,0,0.04)' : undefined,
                          }}
                        >
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontSize: '0.85rem', fontWeight: 600 }}
                            >
                              {formatMetricValue(rawValue)}
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
        </>
      </Paper>
      {!isLoadingRootsList && rootsList.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Roots-данные пока не загружены. Попробуйте изменить фильтры или запустить анализ.
        </Typography>
      )}
      <RootDetailsModal
        open={Boolean(selectedRootId)}
        generationId={id}
        rootId={selectedRootId ?? undefined}
        onClose={() => setSelectedRootId(null)}
      />
      <RootSelectionPanel />
    </Box>
  );
});

