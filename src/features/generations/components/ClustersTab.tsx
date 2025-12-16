import { observer } from 'mobx-react-lite';
import { Box, Typography } from '@mui/material';
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

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Clusters
      </Typography>
      {generation.clusters && generation.clusters.length > 0 ? (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Clusters ({generation.clusters.length})
          </Typography>
          <pre style={{ fontSize: '12px', fontFamily: 'monospace', margin: 0 }}>
            {JSON.stringify(generation.clusters, null, 2)}
          </pre>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Clusters data will be displayed here
        </Typography>
      )}
    </Box>
  );
});

