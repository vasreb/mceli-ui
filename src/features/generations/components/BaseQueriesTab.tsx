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

  // Обрабатываем baseQueries - могут быть строки или объекты
  const baseQueriesArray = generation.baseQueries || [];
  const queryTexts = baseQueriesArray.map((q) => (typeof q === 'string' ? q : q.text));

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Base Queries ({queryTexts.length})
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
        {queryTexts.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No base queries
          </Typography>
        ) : (
          queryTexts.map((query, index) => (
            <Chip key={index} label={query} sx={{ m: 0.5 }} />
          ))
        )}
      </Box>
    </Box>
  );
});

