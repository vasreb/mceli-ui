import { observer } from 'mobx-react-lite';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { editGenerationStore } from '@/features/generation/stores/editGenerationStore';
import { api } from '@/api/client';
import type { Cluster } from '@/api/types';

export const ClustersTab = observer(() => {
  const { generation } = editGenerationStore;
  const [clustersFromApi, setClustersFromApi] = useState<Cluster[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!generation?.id) {
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    api
      .getGenerationClusters(generation.id)
      .then((data) => {
        if (!cancelled) {
          setClustersFromApi(data);
        }
      })
      .catch((fetchError) => {
        if (!cancelled) {
          const message = fetchError instanceof Error ? fetchError.message : 'Ошибка загрузки кластеров';
          setError(message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [generation?.id]);

  if (!generation) {
    return (
      <Typography variant="body2" color="text.secondary">
        No generation data available
      </Typography>
    );
  }

  if (error) {
    return (
      <Typography variant="body2" color="error" sx={{ mt: 2 }}>
        {error}
      </Typography>
    );
  }

  if (isLoading && !clustersFromApi) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={16} />
        Loading clusters…
      </Typography>
    );
  }

  const clusters = clustersFromApi ?? generation.clusters ?? [];
  if (clusters.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        No clusters available
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {clusters.map((cluster, clusterIndex) => (
        <Card key={clusterIndex} elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              {cluster.name || cluster.label}
            </Typography>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">
                  Roots ({cluster.roots?.length || 0})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {cluster.roots && cluster.roots.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Text</TableCell>
                          <TableCell align="right">Sanity Overlap</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cluster.roots.map((root, rootIndex) => (
                          <TableRow key={rootIndex}>
                            <TableCell>{root.text}</TableCell>
                            <TableCell align="right">
                              {root.sanityOverlap?.toFixed(2) || '0.00'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No roots available
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
});

