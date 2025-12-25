import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  Link,
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
import { useFilterParams } from '../hooks/useFilterParams';

const SORT_FIELDS = [
  { value: '', label: 'Нет' },
  { value: 'appId', label: 'App ID' },
  { value: 'rating', label: 'Rating' },
  { value: 'reviewer', label: 'Reviewer' },
  { value: 'date', label: 'Date' },
  { value: 'helpfulCounts', label: 'Helpful' },
  { value: 'language', label: 'Language' },
];

const formatStringValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  return String(value);
};

const formatRating = (value: number | null) => {
  if (value === null || value === undefined) {
    return '—';
  }
  return value.toFixed(1);
};

const formatDateValue = (value?: string | null) => {
  if (!value) {
    return '—';
  }
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return value;
  }
  return new Date(timestamp).toLocaleString();
};

const TABLE_MAX_HEIGHT = 'calc(100vh - 220px)';

export const AnalyzeReviewsTab = observer(({ id }: { id?: string }) => {
  const { reviewList, reviewListTotal, isLoadingReviewList, reviewListError } = analyzeStore;

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const { filter, setFilterField } = useFilterParams<'appId'>();

  const parsedAppIdFilter = useMemo(() => {
    const raw = filter.appId ?? '';
    return raw
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value);
  }, [filter.appId]);

  const concatString = useMemo(
    () =>
      reviewList
        .map(
          (review) =>
            `app_id: ${review.appId} rating: ${review.rating ?? '—'} body: ${review.body ?? '—'} \n date: ${review.date ?? '—'}`,
        )
        .join('\n\n'),
    [reviewList],
  );

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
    const normalizedFilter =
      parsedAppIdFilter.length > 0 ? { appIds: parsedAppIdFilter } : undefined;
      analyzeStore.loadReviews(id, {
      page,
      perPage: rowsPerPage,
      search: searchTerm,
      sortBy,
      filter: normalizedFilter,
    });
  }, [id, page, rowsPerPage, searchTerm, sortField, sortDirection, filter?.appId]);

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
  }, [searchTerm, sortField, sortDirection, filter?.appId]);

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

  const handleHeaderSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortField(field);
      setSortDirection('DESC');
    }
  };

  const highlightedField = sortField;

  if (!id) {
    return (
      <Typography variant="body2" color="text.secondary">
        Сначала сохраните генерацию, чтобы загрузить reviews.
      </Typography>
    );
  }

  return (
    <Box>
      {reviewListError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {reviewListError}
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2">Reviews</Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigator.clipboard.writeText(concatString)}
            disabled={!concatString}
          >
            Копировать ({concatString.length})
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <TextField
            label="Search reviews"
            size="small"
            placeholder="Text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            sx={{ flex: 1, minWidth: 240 }}
            InputProps={{
              startAdornment: isLoadingReviewList ? (
                <InputAdornment position="start">
                  <CircularProgress size={16} />
                </InputAdornment>
              ) : undefined,
            }}
          />
          <TextField
            label="App ID"
            size="small"
            placeholder="filter.appId"
            value={filter.appId ?? ''}
            onChange={(event) => setFilterField('appId', event.target.value)}
            sx={{ minWidth: 200 }}
          />
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="reviews-sort-field-label">Sort field</InputLabel>
              <Select
                labelId="reviews-sort-field-label"
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
              <InputLabel id="reviews-sort-direction-label">Direction</InputLabel>
              <Select
                labelId="reviews-sort-direction-label"
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
            count={reviewListTotal}
            page={page - 1}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10, 25, 100]}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
          <TableContainer
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
                  <TableCell>ID</TableCell>
                  <TableCell
                    sx={{
                      minWidth: 400,
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                    }}
                  >
                    Body
                  </TableCell>
                  <TableCell
                    sx={{
                      cursor: 'pointer',
                      fontSize: '0.65rem',
                      backgroundColor: highlightedField === 'appId' ? 'rgba(0,0,0,0.04)' : undefined,
                    }}
                    onClick={() => handleHeaderSort('appId')}
                  >
                    App ID
                  </TableCell>
                  <TableCell
                    sx={{
                      cursor: 'pointer',
                      fontSize: '0.65rem',
                      backgroundColor: highlightedField === 'rating' ? 'rgba(0,0,0,0.04)' : undefined,
                    }}
                    onClick={() => handleHeaderSort('rating')}
                  >
                    Rating
                  </TableCell>
                  <TableCell
                    sx={{
                      cursor: 'pointer',
                      fontSize: '0.65rem',
                      backgroundColor: highlightedField === 'reviewer' ? 'rgba(0,0,0,0.04)' : undefined,
                    }}
                    onClick={() => handleHeaderSort('reviewer')}
                  >
                    Reviewer
                  </TableCell>
                  <TableCell
                    sx={{
                      cursor: 'pointer',
                      fontSize: '0.65rem',
                      backgroundColor: highlightedField === 'date' ? 'rgba(0,0,0,0.04)' : undefined,
                    }}
                    onClick={() => handleHeaderSort('date')}
                  >
                    Date
                  </TableCell>
                  <TableCell
                    sx={{
                      cursor: 'pointer',
                      fontSize: '0.65rem',
                      backgroundColor:
                        highlightedField === 'helpfulCounts' ? 'rgba(0,0,0,0.04)' : undefined,
                    }}
                    onClick={() => handleHeaderSort('helpfulCounts')}
                  >
                    Helpful
                  </TableCell>
                  <TableCell
                    sx={{
                      cursor: 'pointer',
                      fontSize: '0.65rem',
                      backgroundColor: highlightedField === 'language' ? 'rgba(0,0,0,0.04)' : undefined,
                    }}
                    onClick={() => handleHeaderSort('language')}
                  >
                    Language
                  </TableCell>
                  <TableCell>Review ID</TableCell>
                  <TableCell>Review URL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reviewList.map((review) => (
                  <TableRow key={review.id} hover>
                    <TableCell>{review.id}</TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 400,
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                        {formatStringValue(review.body)}
                      </Typography>
                    </TableCell>
                    <TableCell>{review.appId}</TableCell>
                    <TableCell>{formatRating(review.rating)}</TableCell>
                    <TableCell>{formatStringValue(review.reviewer)}</TableCell>
                    <TableCell>{formatDateValue(review.date)}</TableCell>
                    <TableCell>{formatStringValue(review.helpfulCounts)}</TableCell>
                    <TableCell>{formatStringValue(review.language)}</TableCell>
                    <TableCell>{formatStringValue(review.reviewId)}</TableCell>
                    <TableCell>
                      {review.reviewUrl ? (
                        <Link href={review.reviewUrl} target="_blank" rel="noreferrer">
                          link
                        </Link>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      </Paper>
      {!isLoadingReviewList && reviewList.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Reviews пока не загружены. Попробуйте изменить фильтры или запустить анализ.
        </Typography>
      )}
    </Box>
  );
});

