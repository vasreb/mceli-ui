import { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Typography } from '@mui/material';
import { editGenerationStore } from '@/features/generation/stores/editGenerationStore';
import { VariantsRoot } from './VariantsRoot';

export const VariantsTab = observer(() => {
  const { generation } = editGenerationStore;

  if (!generation) {
    return (
      <Typography variant="body2" color="text.secondary">
        No generation data available
      </Typography>
    );
  }

  if (!generation.roots || generation.roots.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No roots available
      </Typography>
    );
  }

  const rootsWithVariants = useMemo(
    () =>
      (generation.roots ?? [])
    .map((root, idx) => ({ root, idx }))
        .filter(({ root }) => root.variants && root.variants.length > 0),
    [generation.roots],
  );

  if (rootsWithVariants.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No variants available
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {rootsWithVariants.map(({ root, idx: rootIndex }) => (
        <VariantsRoot key={rootIndex} root={root} rootIndex={rootIndex} />
                                  ))}
    </Box>
  );
});

