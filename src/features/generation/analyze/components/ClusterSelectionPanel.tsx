import { observer } from 'mobx-react-lite';
import { Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { analyzeStore } from '../analyzeStore';

export const ClusterSelectionPanel = observer(() => {
  const clusterIds = analyzeStore.selectedClusterIds;
  const clusterLabels = analyzeStore.clustersList.reduce<Record<string, string>>((acc, cluster) => {
    acc[cluster.clusterId] = cluster.label ?? cluster.clusterId;
    return acc;
  }, {});
  const copyText = clusterIds
    .map((id) => clusterLabels[id] ?? id)
    .join('\n');

  const handleCopy = () => {
    if (!copyText) {
      return;
    }
    navigator.clipboard.writeText(copyText);
  };

  const handleClear = () => {
    analyzeStore.clearSelectedClusterIds();
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        left: 10,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        alignItems: 'center',
        zIndex: 1400,
        bgcolor: 'background.paper',
        borderRadius: 2,
        p: 1,
        boxShadow: 3,
      }}
    >
      {clusterIds.length > 0 && (
        <IconButton size="small" onClick={handleClear} sx={{ padding: 0 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
      <IconButton
        size="small"
        disabled={clusterIds.length === 0}
        onClick={handleCopy}
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1,
          bgcolor: clusterIds.length ? 'primary.main' : 'divider',
          color: clusterIds.length ? 'primary.contrastText' : 'text.disabled',
          '&:hover': {
            bgcolor: clusterIds.length ? 'primary.dark' : 'divider',
          },
        }}
      >
        <ContentCopyIcon fontSize="small" />
      </IconButton>
    </Box>
  );
});

