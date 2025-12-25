import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Checkbox,
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
  IconButton,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { analyzeStore } from '../analyzeStore';
import { CLUSTER_METRIC_FIELDS } from '../clusterMetricsFields';
import { CLUSTER_METRIC_INFO } from '../clusterMetricInfo';
import { MetricInfoStrip } from './MetricInfoStrip';
import { computeDeviation } from './metricDeviation';
import { CommentCell } from './CommentCell';
import { commentStore } from '../stores/commentStore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useNavigate } from '@tanstack/react-router';
import { MetricTipStore } from '../stores/metricTipStore';
import { ClusterSelectionPanel } from './ClusterSelectionPanel';

type AnalyzeClustersTabProps = {
  id?: string;
};

const SORT_FIELDS = [
  { value: '', label: 'Нет' },
  ...CLUSTER_METRIC_FIELDS.map(([metric, label]) => ({
    value: `metrics.${metric}`,
    label,
  })),
];

const formatMetricValue = (value: unknown) => {
  if (typeof value === 'number') {
    return value.toFixed(3);
  }
  if (value === null || value === undefined) {
    return '—';
  }
  return String(value);
};

export const AnalyzeClustersTab = observer(({ id }: AnalyzeClustersTabProps) => {
  const {
    clustersList,
    clustersListTotal,
    isLoadingClustersList,
    clustersListError,
    selectedClusterIds,
  } = analyzeStore;
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const navigate = useNavigate();

  const handlePlayCluster = (clusterId: string) => {
    if (!id) {
      return;
    }
    navigate({
      to: '/generations/$id/analyze/$tab',
      params: { id, tab: 'apps' },
      search: { 'filter.clusterId': clusterId },
    });
  };

  const handleGoToRoots = (clusterId: string) => {
    if (!id) return;
    navigate({
      to: '/generations/$id/analyze/roots',
      params: { id },
      search: { 'filter.clusterId': clusterId },
    });
  };

  useEffect(() => {
    if (!id) {
      return;
    }
    const sortBy =
      sortField !== ''
        ? {
            field: sortField,
            direction: sortDirection,
          }
        : undefined;
    analyzeStore.loadClusters(id, {
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
        Сначала сохраните генерацию, чтобы загрузить clustering-данные.
      </Typography>
    );
  }

  const highlightedMetricField =
    sortField && sortField.startsWith('metrics.') ? sortField.substring('metrics.'.length) : '';
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const handleToggleClusterSelection = useCallback(
    (clusterId: string) => {
      const next = selectedClusterIds.includes(clusterId)
        ? selectedClusterIds.filter((value) => value !== clusterId)
        : [...selectedClusterIds, clusterId];
      analyzeStore.setSelectedClusterIds(next);
    },
    [selectedClusterIds],
  );

  useEffect(() => {
    return () => {
      analyzeStore.clearSelectedClusterIds();
    };
  }, []);

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

  const [pendingScrollMetric, setPendingScrollMetric] = useState<string | null>(null);

  const handleMetricHeaderClick = (metric: string) => {
    const field = `metrics.${metric}`;
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortField(field);
      setSortDirection('DESC');
    }
    setPendingScrollMetric(metric);
  };

  useEffect(() => {
    if (!pendingScrollMetric) {
      return;
    }
    requestAnimationFrame(() => {
      scrollToMetricColumn(pendingScrollMetric);
      setPendingScrollMetric(null);
    });
  }, [pendingScrollMetric, clustersList]);

  const [metricStore] = useState(() => new MetricTipStore());
  const orderedClusterMetrics = metricStore.getMetricKeys(CLUSTER_METRIC_INFO);
  const clusterMetricInfoMap = useMemo(
    () => Object.fromEntries(CLUSTER_METRIC_INFO.map((tip) => [tip.metric, tip])),
    [],
  );

  const TABLE_MAX_HEIGHT = 'calc(100vh - 100px)';

  return (
    <Box>
      {clustersListError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {clustersListError}
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
          Что отражают метрики кластеров
        </Typography>
        <MetricInfoStrip
          tips={CLUSTER_METRIC_INFO}
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
          label="Search clusters"
          size="small"
          placeholder="Cluster ID или label"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ flex: 1, minWidth: 240 }}
        />
        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="clusters-sort-field-label">Sort field</InputLabel>
            <Select
              labelId="clusters-sort-field-label"
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
            <InputLabel id="clusters-sort-direction-label">Direction</InputLabel>
            <Select
              labelId="clusters-sort-direction-label"
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
            count={clustersListTotal}
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
                      width: 48,
                      textAlign: 'center',
                    }}
                  >
                    💬
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: '48px',
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
                      left: '78px',
                      zIndex: 3,
                      backgroundColor: 'background.paper',
                    }}
                  >
                    Cluster ID
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: '198px',
                      zIndex: 3,
                      backgroundColor: 'background.paper',
                    }}
                  >
                    Label
                  </TableCell>
                  <TableCell
                    sx={{
                      left: '318px',
                      zIndex: 3,
                      backgroundColor: 'background.paper',
                    }}
                  >
                    Roots
                  </TableCell>
                  {orderedClusterMetrics.map((metric) => (
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
                      {clusterMetricInfoMap[metric]?.title ?? metric}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {clustersList.map((item) => {
                  const rowColor = commentStore.getEntry(item.id)?.color ?? undefined;
                  const stickyBg = rowColor ?? 'background.paper';
                  return (
                    <TableRow key={item.id} sx={{ backgroundColor: rowColor ?? 'inherit' }}>
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: 0,
                          backgroundColor: stickyBg,
                          zIndex: 2,
                        }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
                          <CommentCell rowId={item.id} />
                          <Checkbox
                            size="small"
                            checked={selectedClusterIds.includes(item.clusterId)}
                            onClick={(event) => event.stopPropagation()}
                            onChange={(event) => {
                              event.stopPropagation();
                              handleToggleClusterSelection(item.clusterId);
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: '48px',
                          backgroundColor: stickyBg,
                          zIndex: 2,
                          width: 30,
                          textAlign: 'center',
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            handlePlayCluster(item.clusterId);
                          }}
                        >
                          <PlayArrowIcon fontSize="small" />
                        </IconButton>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleGoToRoots(item.clusterId);
                        }}
                      >
                        <Typography variant="button" sx={{ fontSize: '0.75rem' }}>
                          R
                        </Typography>
                      </IconButton>
                      </TableCell>
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: '78px',
                          backgroundColor: stickyBg,
                          zIndex: 2,
                        }}
                      >
                        {item.clusterId}
                      </TableCell>
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: '198px',
                          backgroundColor: stickyBg,
                          zIndex: 2,
                        }}
                      >
                        {item.label ?? '—'}
                      </TableCell>
                      <TableCell
                        sx={{
                          left: '318px',
                          backgroundColor: stickyBg,
                          zIndex: 2,
                        }}
                      >
                        {item.rootIds.length}
                      </TableCell>
                      {orderedClusterMetrics.map((metric) => {
                        const rawValue = item.metrics[metric as keyof typeof item.metrics];
                        const numericValue = typeof rawValue === 'number' ? rawValue : undefined;
                        const deviation =
                          numericValue !== undefined
                            ? computeDeviation(numericValue, analyzeStore.clusterMetricAverages[metric])
                            : null;
                        return (
                          <TableCell
                            key={`${item.id}-${metric}`}
                            data-metric-column={metric}
                            sx={{
                              backgroundColor: highlightedMetricField === metric ? 'rgba(0,0,0,0.04)' : undefined,
                              minWidth: 110,
                            }}
                          >
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                                {formatMetricValue(rawValue)}
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
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      </Paper>
      {!isLoadingClustersList && clustersList.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Ведомые clusters пока не загружены. Попробуйте изменить фильтры или запустить анализ.
        </Typography>
      )}
      <ClusterSelectionPanel />
    </Box>
  );
});
