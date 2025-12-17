import { observer } from 'mobx-react-lite';
import { Box, Typography } from '@mui/material';
import { editGenerationStore } from '../stores/editGenerationStore';

export const JsonTab = observer(() => {
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
      <pre style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace' }}>
        {JSON.stringify(generation, null, 2)}
      </pre>
    </Box>
  );
});

