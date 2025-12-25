import { useMemo, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Typography, Button, Snackbar, Alert } from '@mui/material';
import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { editGenerationStore } from '@/features/generation/stores/editGenerationStore';

export const JsonTab = observer(() => {
  const { generation } = editGenerationStore;
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const jsonValue = useMemo(() => (generation ? JSON.stringify(generation, null, 2) : ''), [generation]);

  const handleCopyJson = useCallback(() => {
    if (!jsonValue) {
      return;
    }
    navigator.clipboard.writeText(jsonValue);
    setSnackbarOpen(true);
  }, [jsonValue]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  if (!generation) {
    return (
      <Typography variant="body2" color="text.secondary">
        No generation data available
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          size="small"
          startIcon={<ContentCopyIcon />}
          onClick={handleCopyJson}
          disabled={!jsonValue}
        >
          Copy JSON
        </Button>
      </Box>
      <Box
        component="pre"
        sx={{
          margin: 0,
          fontSize: '12px',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          overflowX: 'auto',
        }}
      >
        {jsonValue}
      </Box>
      <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={handleCloseSnackbar}>
        <Alert severity="success" onClose={handleCloseSnackbar} sx={{ width: '100%' }}>
          JSON copied
        </Alert>
      </Snackbar>
    </Box>
  );
});

