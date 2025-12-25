import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  FormControl,
  InputAdornment,
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
  CircularProgress,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { analyzeStore } from '../analyzeStore';
import { APP_METRIC_FIELDS } from '../appMetricsFields';
import { APP_METRIC_INFO } from './appMetricInfo';
import { MetricInfoStrip } from './MetricInfoStrip';
import { AppSnapshotDetailsModal } from './AppSnapshotDetailsModal';
import { MetricTipStore } from '../stores/metricTipStore';
import { AppRow } from './AppRow';
import { AppSelectionPanel } from './AppSelectionPanel';
import { useFilterParams } from '../hooks/useFilterParams';

type AnalyzeAppsTabProps = {
  id?: string;
};

const SORT_FIELDS = [
  { value: '', label: 'Нет' },
  ...APP_METRIC_FIELDS.map(([field]) => ({ value: `metrics.${field}`, label: field })),
];

const metricAccessors = Object.fromEntries(APP_METRIC_FIELDS);

export const AnalyzeAppsTab = observer(({ id }: AnalyzeAppsTabProps) => {
  const {
    appSnapshotsList,
    appSnapshotsTotal,
    isLoadingAppSnapshots,
    appSnapshotsError,
    selectedAppIds,
  } = analyzeStore;

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { filter, setFilterField } = useFilterParams();
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [selectedApp, setSelectedApp] = useState<{ id: string; appId: string } | null>(null);
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const handleToggleAppSelection = useCallback(
    (appId: string) => {
      const next = selectedAppIds.includes(appId)
        ? selectedAppIds.filter((id) => id !== appId)
        : [...selectedAppIds, appId];
      analyzeStore.setSelectedAppIds(next);
    },
    [selectedAppIds],
  );

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
    if (filter.rootId?.trim()) {
      normalizedFilter.rootId = filter.rootId.trim();
    }
    if (filter.clusterId?.trim()) {
      normalizedFilter.clusterId = filter.clusterId.trim();
    }
    analyzeStore.loadAppSnapshots(id, {
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
    filter.rootId,
    filter.clusterId,
  ]);

  useEffect(() => {
    return () => {
      analyzeStore.clearSelectedAppIds();
    };
  }, []);


  useEffect(() => {
    setPage(1);
    setRowsPerPage(10);
    setSearchInput('');
    setSearchTerm('');
    setSortField('');
    setSortDirection('DESC');
  }, [id, setFilterField]);

  useEffect(() => {
    const handler = setTimeout(() => setSearchTerm(searchInput.trim()), 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, sortField, sortDirection, filter.rootId, filter.clusterId]);

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
        Сначала сохраните генерацию, чтобы загрузить App snapshots.
      </Typography>
    );
  }

  const highlightedMetricField =
    sortField && sortField.startsWith('metrics.') ? sortField.substring('metrics.'.length) : '';
  const handleSelectApp = useCallback(
    (id: string, appId: string) => {
      setSelectedApp({ id, appId });
    },
    []
  );

  const isTextSelected = useCallback(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    const selection = window.getSelection?.();
    return Boolean(selection && selection.toString().trim().length > 0);
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
  const orderedAppMetrics = metricStore.getMetricKeys(APP_METRIC_INFO);
  const appMetricInfoMap = useMemo(() => Object.fromEntries(APP_METRIC_INFO.map((tip) => [tip.metric, tip])), []);

  const TABLE_MAX_HEIGHT = 'calc(100vh - 100px)';

  return (
    <Box>
      {appSnapshotsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {appSnapshotsError}
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
          Что отражают метрики приложений
        </Typography>
        <MetricInfoStrip
          tips={APP_METRIC_INFO}
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
          label="Search apps"
          size="small"
          placeholder="App ID или название"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ flex: 1, minWidth: 240 }}
          InputProps={{
            startAdornment: isLoadingAppSnapshots ? (
              <InputAdornment position="start">
                <CircularProgress size={16} />
              </InputAdornment>
            ) : undefined,
          }}
        />
        <TextField
          label="Cluster ID"
          size="small"
          placeholder="Filter cluster ID"
          value={filter.clusterId ?? ''}
          onChange={(e) => setFilterField('clusterId', e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <TextField
          label="Root ID"
          size="small"
          placeholder="Filter root ID"
          value={filter.rootId ?? ''}
          onChange={(e) => setFilterField('rootId', e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="apps-sort-field-label">Sort field</InputLabel>
            <Select
              labelId="apps-sort-field-label"
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
            <InputLabel id="apps-sort-direction-label">Direction</InputLabel>
            <Select
              labelId="apps-sort-direction-label"
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
            count={appSnapshotsTotal}
            page={page - 1}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10, 25, 100]}
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
                      zIndex: 5,
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
                      left: '50px',
                      zIndex: 5,
                      backgroundColor: 'background.paper',
                    }}
                  >
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: '150px',
                      zIndex: 5,
                      backgroundColor: 'background.paper',
                      width: 120,
                      minWidth: 120,
                    }}
                  >
                    App name
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: '270px',
                      zIndex: 5,
                      backgroundColor: 'background.paper',
                      width: 120,
                      minWidth: 120,
                    }}
                  >
                    App ID
                  </TableCell>
                  {orderedAppMetrics.map((metric) => (
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
                      {appMetricInfoMap[metric]?.title ?? metric}
                    </TableCell>
                  ))}
                </TableRow>
                </TableHead>
                <TableBody>
                  {appSnapshotsList.map((item) => (
                    <AppRow
                      key={item.id}
                      item={item}
                      orderedMetrics={orderedAppMetrics}
                      metricAccessors={metricAccessors}
                      highlightedMetricField={highlightedMetricField}
                      onSelect={handleSelectApp}
                      isTextSelected={isTextSelected}
                      appMetricAverages={analyzeStore.appMetricAverages}
                selectedAppIds={selectedAppIds}
                onToggleSelection={handleToggleAppSelection}
                    />
                  ))}
                </TableBody>
            </Table>
          </TableContainer>
        </>
      </Paper>
  <AppSelectionPanel />
      {!isLoadingAppSnapshots && appSnapshotsList.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          App snapshots пока не загружены. Попробуйте изменить фильтры или запустить анализ.
        </Typography>
      )}
      <AppSnapshotDetailsModal
        open={Boolean(selectedApp)}
        snapshotId={selectedApp?.id}
        onClose={() => setSelectedApp(null)}
      />
    </Box>
  );
});
