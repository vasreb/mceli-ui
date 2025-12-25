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
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  TablePagination,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, HelpOutline as HelpOutlineIcon } from '@mui/icons-material';
import { generationListStore } from './stores/generationListStore';
import styles from './GenerationList.module.scss';
import { BaseQueriesModal } from './components/BaseQueriesModal';
import { GenerationRow } from './components/GenerationRow';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'done':
      return 'success';
    case 'running':
      return 'info';
    case 'in_progress':
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
  const [baseQueriesModalOpen, setBaseQueriesModalOpen] = useState(false);
  const [modalQueries, setModalQueries] = useState<string[]>([]);

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
              <TableCell
                sx={{
                  width: 30,
                  textAlign: 'center',
                }}
              >
                💬
              </TableCell>
                <TableCell>Created</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Base Queries</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Snapshots</TableCell>
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
                <TableCell>Errors</TableCell>
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
                  <GenerationRow
                    key={generation.id}
                    generation={generation}
                    copiedId={copiedId}
                    onCopyId={handleCopyId}
                    onView={handleView}
                    onEdit={handleEdit}
                    onRetry={handleRetry}
                    onOpenBaseQueries={(queries) => {
                      setModalQueries(queries);
                      setBaseQueriesModalOpen(true);
                    }}
                    getStatusColor={getStatusColor}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <BaseQueriesModal
          open={baseQueriesModalOpen}
          onClose={() => setBaseQueriesModalOpen(false)}
          queries={modalQueries}
        />

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
