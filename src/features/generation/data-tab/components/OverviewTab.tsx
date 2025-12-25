import { observer } from 'mobx-react-lite';
import { Box, Typography } from '@mui/material';
import { editGenerationStore } from '@/features/generation/stores/editGenerationStore';

export const OverviewTab = observer(() => {
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
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>ID:</strong> {generation.id}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Status:</strong> {generation.status}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Created:</strong> {new Date(generation.createdAt).toLocaleString()}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Locale:</strong> {generation.config.locale}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Base Queries SERP Snapshots:</strong> {generation.stats.baseQueriesSerpSnapshotsCount}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Roots SERP Snapshots:</strong> {generation.stats.rootsSerpSnapshotsCount}
        </Typography>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Stats
        </Typography>
        <Box component="dl">
          {Object.entries(generation.stats).map(([key, value]) => (
            <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary" component="dt">
                {key}
              </Typography>
              <Typography variant="body2" component="dd">
                {value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
      {generation.error && (
        <Box>
          <Typography variant="subtitle2" gutterBottom color="error">
            Error
          </Typography>
          <Typography variant="body2" color="error">
            {generation.error}
          </Typography>
        </Box>
      )}
    </Box>
  );
});

