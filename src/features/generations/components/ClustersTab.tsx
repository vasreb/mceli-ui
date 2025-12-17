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
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { editGenerationStore } from '../stores/editGenerationStore';

export const ClustersTab = observer(() => {
  const { generation } = editGenerationStore;

  if (!generation) {
    return (
      <Typography variant="body2" color="text.secondary">
        No generation data available
      </Typography>
    );
  }

  if (!generation.clusters || generation.clusters.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        No clusters available
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {generation.clusters.map((cluster, clusterIndex) => (
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

