import { observer } from 'mobx-react-lite';
import type { RootSnapshotItem } from '@/api/types';
import { Box, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import { analyzeStore } from '../analyzeStore';

export const RootSelectionPanel = observer(() => {
  const rootIds = analyzeStore.selectedRootIds;
  const rootLabels = analyzeStore.rootsList.reduce<Record<string, string>>((acc, root: RootSnapshotItem) => {
    acc[root.id] = root.text ?? root.id;
    return acc;
  }, {});
  const copyText = rootIds.map((id) => rootLabels[id] ?? id).join('\n');

  const handleCopy = () => {
    if (!copyText) {
      return;
    }
    navigator.clipboard.writeText(copyText);
  };

  const handleClear = () => {
    analyzeStore.clearSelectedRootIds();
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
      {rootIds.length > 0 && (
        <IconButton size="small" onClick={handleClear} sx={{ padding: 0 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
      <IconButton
        size="small"
        disabled={rootIds.length === 0}
        onClick={handleCopy}
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1,
          bgcolor: rootIds.length ? 'primary.main' : 'divider',
          color: rootIds.length ? 'primary.contrastText' : 'text.disabled',
          '&:hover': {
            bgcolor: rootIds.length ? 'primary.dark' : 'divider',
          },
        }}
      >
        <ContentCopyIcon fontSize="small" />
      </IconButton>
    </Box>
  );
});

