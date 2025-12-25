import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
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
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { analyzeStore } from '../analyzeStore';
import { CommentCell } from './CommentCell';
import { useFilterParams } from '../hooks/useFilterParams';
import type { VariantListItem } from '@/api/types';
import { useNavigate } from '@tanstack/react-router';

const VARIANT_METRIC_FIELDS: Array<{ field: keyof VariantListItem; label: string }> = [
  { field: 'searchVolume', label: 'Search volume' },
  { field: 'commercial', label: 'Commercial' },
  { field: 'navigational', label: 'Navigational' },
  { field: 'informational', label: 'Informational' },
  { field: 'transactional', label: 'Transactional' },
  { field: 'competition', label: 'Competition' },
  { field: 'cpc', label: 'CPC' },
];

const SORT_FIELDS = [
  { value: '', label: 'Нет' },
  ...VARIANT_METRIC_FIELDS.map((metric) => ({
    value: metric.field,
    label: metric.label,
  })),
];

const formatMetricValue = (value: unknown) => {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  if (value === null || value === undefined) {
    return '—';
  }
  return String(value);
};

const TABLE_MAX_HEIGHT = 'calc(100vh - 100px)';

export const AnalyzeVariantsTab = observer(({ id }: { id?: string }) => {
  const { variantList, variantListTotal, isLoadingVariantList, variantListError } = analyzeStore;

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { filter, setFilterField } = useFilterParams<'rootId'>();
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

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
    const normalizedFilter = filter?.rootId?.trim() ? { rootId: filter.rootId.trim() } : undefined;
    analyzeStore.loadVariants(id, {
      page,
      perPage: rowsPerPage,
      search: searchTerm,
      sortBy,
      filter: normalizedFilter,
    });
  }, [id, page, rowsPerPage, searchTerm, sortField, sortDirection, filter?.rootId]);

  useEffect(() => {
    setPage(1);
    setRowsPerPage(100);
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
  }, [searchTerm, sortField, sortDirection, filter?.rootId]);

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

  const scrollToMetricColumn = useCallback((metric: string) => {
    const container = tableContainerRef.current;
    if (!container) {
      return;
    }
    const cell = container.querySelector<HTMLElement>(`[data-metric-column="${metric}"]`);
    if (!cell) {
      return;
    }
    const target = cell.offsetLeft - container.clientWidth / 2 + cell.offsetWidth / 2;
    container.scrollTo({ left: Math.max(target, 0), behavior: 'smooth' });
  }, []);

  const handleMetricHeaderClick = useCallback(
    (metric: string) => {
      if (sortField === metric) {
        setSortDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
      } else {
        setSortField(metric);
        setSortDirection('DESC');
      }
      requestAnimationFrame(() => scrollToMetricColumn(metric));
    },
    [scrollToMetricColumn, sortField]
  );

  if (!id) {
    return (
      <Typography variant="body2" color="text.secondary">
        Сначала сохраните генерацию, чтобы загрузить variants.
      </Typography>
    );
  }

  const highlightedMetricField = sortField;

  return (
    <Box>
      {variantListError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {variantListError}
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
          Variants
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <TextField
            label="Search variants"
            size="small"
            placeholder="Text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ flex: 1, minWidth: 240 }}
            InputProps={{
              startAdornment: isLoadingVariantList ? (
                <InputAdornment position="start">
                  <CircularProgress size={16} />
                </InputAdornment>
              ) : undefined,
            }}
          />
          <TextField
            label="Root ID"
            size="small"
            placeholder="filter.rootId"
            value={filter.rootId ?? ''}
            onChange={(e) => setFilterField('rootId', e.target.value)}
            sx={{ minWidth: 200 }}
          />
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="variants-sort-field-label">Sort field</InputLabel>
              <Select
                labelId="variants-sort-field-label"
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
              <InputLabel id="variants-sort-direction-label">Direction</InputLabel>
              <Select
                labelId="variants-sort-direction-label"
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
      </Box>
      <Paper variant="outlined">
        <>
          <TablePagination
            component="div"
            count={variantListTotal}
            page={page - 1}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 100]}
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
                      zIndex: 6,
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
                      zIndex: 6,
                      backgroundColor: 'background.paper',
                    }}
                  >
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: '90px',
                      zIndex: 6,
                      backgroundColor: 'background.paper',
                    }}
                  >
                    Root ID
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: '180px',
                      zIndex: 6,
                      backgroundColor: 'background.paper',
                    }}
                  >
                    Text
                  </TableCell>
                  {VARIANT_METRIC_FIELDS.map((metric) => (
                    <TableCell
                      key={metric.field}
                      onClick={() => handleMetricHeaderClick(metric.field)}
                      data-metric-column={metric.field}
                      sx={{
                        fontSize: '0.65rem',
                        cursor: 'pointer',
                        backgroundColor:
                          highlightedMetricField === metric.field ? 'rgba(0,0,0,0.04)' : undefined,
                      }}
                    >
                      {metric.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {variantList.map((variant) => (
                  <TableRow
                    key={variant.id}
                    sx={{ cursor: 'pointer', backgroundColor: 'inherit' }}
                    hover
                    onClick={() => {
                      if (id) {
                        navigate({
                          to: '/generations/$id/analyze/apps',
                          params: { id },
                          search: variant.rootId ? `?filter.rootId=${variant.rootId}` : undefined,
                        });
                      }
                    }}
                  >
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: 0,
                        backgroundColor: 'background.paper',
                        zIndex: 4,
                        width: 30,
                        textAlign: 'center',
                      }}
                    >
                      <CommentCell rowId={variant.id} />
                    </TableCell>
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: '30px',
                        backgroundColor: 'background.paper',
                        zIndex: 3,
                      }}
                    >
                      {variant.id}
                    </TableCell>
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: '90px',
                        backgroundColor: 'background.paper',
                        zIndex: 3,
                      }}
                    >
                      {variant.rootId ?? '—'}
                    </TableCell>
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: '180px',
                        backgroundColor: 'background.paper',
                        zIndex: 3,
                      }}
                    >
                      {variant.text}
                    </TableCell>
                    {VARIANT_METRIC_FIELDS.map((metric) => {
                      const value = variant[metric.field];
                      return (
                        <TableCell
                          key={`${variant.id}-${metric.field}`}
                          sx={{
                            backgroundColor:
                              highlightedMetricField === metric.field ? 'rgba(0,0,0,0.04)' : undefined,
                          }}
                          data-metric-column={metric.field}
                        >
                          <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                            {formatMetricValue(value)}
                          </Typography>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      </Paper>
      {!isLoadingVariantList && variantList.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Variants пока не загружены. Попробуйте изменить фильтры или запустить анализ.
        </Typography>
      )}
    </Box>
  );
});

