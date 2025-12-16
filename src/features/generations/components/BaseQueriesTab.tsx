import { observer } from 'mobx-react-lite';
import { Box, Typography, Chip } from '@mui/material';
import { editGenerationStore } from '../stores/editGenerationStore';

export const BaseQueriesTab = observer(() => {
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
        Base Queries ({generation.baseQueries.length})
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
        {generation.baseQueries.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No base queries
          </Typography>
        ) : (
          generation.baseQueries.map((query, index) => (
            <Chip key={index} label={query} sx={{ m: 0.5 }} />
          ))
        )}
      </Box>
    </Box>
  );
});

