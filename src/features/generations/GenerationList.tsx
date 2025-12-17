import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from '@tanstack/react-router';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  TablePagination,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  ContentCopy as ContentCopyIcon,
  Search as SearchIcon,
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';
import { generationListStore } from './stores/generationListStore';
import styles from './GenerationList.module.scss';

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'done':
      return 'success';
    case 'running':
      return 'info';
    case 'failed':
      return 'error';
    case 'pending':
      return 'warning';
    default:
      return 'default';
  }
};

export const GenerationList = observer(() => {
  const navigate = useNavigate();
  const store = generationListStore;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    store.loadGenerations();
  }, []);

  const handleCreate = () => {
    navigate({ to: '/generations/create' });
  };

  const handleView = (id: string) => {
    navigate({ to: '/generations/$id', params: { id } });
  };

  const handleEdit = (id: string) => {
    navigate({ to: '/generations/$id', params: { id } });
  };

  const handleRetry = async (id: string) => {
    // TODO: реализовать retry
    console.log('Retry generation:', id);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredGenerations = store.getFilteredGenerations();

  if (store.isLoading) {
    return (
      <Container maxWidth="xl" className={styles.container}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Generations
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            New Generation
          </Button>
        </Box>

        {store.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {store.error}
          </Alert>
        )}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search (ID / Base Queries)"
              size="small"
              value={store.searchQuery}
              onChange={(e) => store.setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1, minWidth: 250 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={store.statusFilter}
                label="Status"
                onChange={(e) => store.setStatusFilter(e.target.value as any)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="running">Running</MenuItem>
                <MenuItem value="done">Done</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Locale</InputLabel>
              <Select
                value={store.localeFilter}
                label="Locale"
                onChange={(e) => store.setLocaleFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                {store.getLocales().map((locale) => (
                  <MenuItem key={locale} value={locale}>
                    {locale}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={store.onlyErrors}
                  onChange={(e) => store.setOnlyErrors(e.target.checked)}
                />
              }
              label="Only errors"
            />
          </Box>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Created</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    Metrics (BQ/R/V/C)
                    <Tooltip
                      title={
                        <Box>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>BQ</strong> - Base Queries
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>R</strong> - Root Queries
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>V</strong> - Variant Queries
                          </Typography>
                          <Typography variant="body2">
                            <strong>C</strong> - Cluster Queries
                          </Typography>
                        </Box>
                      }
                      arrow
                    >
                      <HelpOutlineIcon fontSize="small" sx={{ color: 'text.secondary', cursor: 'help' }} />
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>SERP Snapshots</TableCell>
                <TableCell>Locale</TableCell>
                <TableCell>Error</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGenerations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No generations found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredGenerations.map((generation) => (
                  <TableRow key={generation.id} hover>
                    <TableCell>{formatDateTime(generation.createdAt)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">{generation.id}</Typography>
                        <Tooltip title={copiedId === generation.id ? 'Copied!' : 'Copy ID'}>
                          <IconButton
                            size="small"
                            onClick={() => handleCopyId(generation.id)}
                            sx={{ p: 0.5 }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={generation.status}
                        color={getStatusColor(generation.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {generation.metrics.baseQueries} / {generation.metrics.rootQueries} /{' '}
                      {generation.metrics.variantQueries} / {generation.metrics.clusterQueries}
                    </TableCell>
                    <TableCell>{generation.serpSnapshots} total</TableCell>
                    <TableCell>{generation.locale}</TableCell>
                    <TableCell>
                      {generation.error && (
                        <Chip label={generation.error} color="error" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => handleView(generation.id)}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(generation.id)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {generation.status === 'failed' && (
                        <Tooltip title="Retry">
                          <IconButton
                            size="small"
                            onClick={() => handleRetry(generation.id)}
                            color="primary"
                          >
                            <RefreshIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={store.total}
          page={store.page}
          onPageChange={(_, page) => store.setPage(page)}
          rowsPerPage={store.rowsPerPage}
          onRowsPerPageChange={(e) => store.setRowsPerPage(Number(e.target.value))}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Box>
    </Container>
  );
});
