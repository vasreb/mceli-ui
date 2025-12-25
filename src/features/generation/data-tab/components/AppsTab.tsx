import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Typography, CircularProgress, Chip, Stack, Button, Alert } from '@mui/material';
import { editGenerationStore } from '@/features/generation/stores/editGenerationStore';

export const AppsTab = observer(() => {
  const {
    generation,
    appIds,
    isLoadingAppIds,
    appIdsError,
    activeTab,
    loadAppIds,
  } = editGenerationStore;

  useEffect(() => {
    if (activeTab !== 'apps' || !generation?.id) {
      return;
    }
    if (!isLoadingAppIds && appIds === null) {
      loadAppIds(generation.id);
    }
  }, [activeTab, generation?.id, appIds, isLoadingAppIds, loadAppIds]);

  const handleRefresh = () => {
    if (generation?.id) {
      loadAppIds(generation.id);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button size="small" onClick={handleRefresh} disabled={!generation || isLoadingAppIds}>
          Refresh
        </Button>
      </Box>
      {isLoadingAppIds ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : appIdsError ? (
        <Alert severity="error">{appIdsError}</Alert>
      ) : (
        <Stack spacing={1}>
          {appIds && appIds.length > 0 ? (
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {appIds.map((appId) => (
                <Chip
                  key={appId}
                  label={appId}
                  size="small"
                  component="a"
                  href={`https://play.google.com/store/apps/details?id=${encodeURIComponent(appId)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  clickable
                />
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No app IDs available
            </Typography>
          )}
        </Stack>
      )}
    </Box>
  );
});

