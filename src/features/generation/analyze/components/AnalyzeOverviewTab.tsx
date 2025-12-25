import { useEffect } from 'react';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { analyzeStore } from '../analyzeStore';

type AnalyzeOverviewTabProps = {
  id?: string;
};

export const AnalyzeOverviewTab = observer(({ id }: AnalyzeOverviewTabProps) => {
  const { overview, isLoadingOverview, overviewError } = analyzeStore;

  useEffect(() => {
    if (!id) {
      return;
    }
    analyzeStore.loadOverview(id);
  }, [id]);

  if (!id) {
    return (
      <Typography variant="body2" color="text.secondary">
        Создайте или откройте генерацию, чтобы посмотреть анализ.
      </Typography>
    );
  }

  return (
    <Box>
      {overviewError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {overviewError}
        </Alert>
      )}
      {isLoadingOverview ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : overview ? (
        <Box component="pre" sx={{ m: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(overview, null, 2)}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Данные обзора пока недоступны.
        </Typography>
      )}
    </Box>
  );
});

