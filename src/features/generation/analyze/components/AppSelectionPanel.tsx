import { observer } from 'mobx-react-lite';
import { Box, Button, CircularProgress } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useParams } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import { analyzeStore } from '../analyzeStore';
import { editGenerationStore } from '@/features/generation/stores/editGenerationStore';

export const AppSelectionPanel = observer(() => {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const generationId = (params as any)?.id;
  const appIds = analyzeStore.selectedAppIds;
  const disabled = !generationId || appIds.length === 0 || editGenerationStore.isFetchingReviews;

  const handleClick = async () => {
    if (!generationId || appIds.length === 0) {
      return;
    }
    try {
      await editGenerationStore.fetchReviews({ appIds }, generationId);
      toast.success('Reviews получены');
    } catch (error) {
      toast.error('Не удалось отправить запрос на reviews');
    }
  };

  const handleClearSelection = () => {
    if (appIds.length > 0) {
      analyzeStore.clearSelectedAppIds();
    }
  };

  const handleGoToReviews = () => {
    if (!generationId || appIds.length === 0) return;
    navigate({
      to: '/generations/$id/analyze/reviews',
      params: { id: generationId },
      search: { 'filter.appId': appIds.join(',') },
    });
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
      {appIds.length > 0 && (
        <Button
          size="small"
          variant="text"
          color="inherit"
          onClick={handleClearSelection}
          sx={{ minWidth: 40, minHeight: 40, padding: 0 }}
        >
          <CloseIcon fontSize="small" />
        </Button>
      )}
      <Button
        size="small"
        variant="contained"
        color="primary"
        disabled={disabled}
        onClick={handleClick}
        sx={{ minWidth: 40, minHeight: 40, padding: 0 }}
      >
        {editGenerationStore.isFetchingReviews ? (
          <CircularProgress color="inherit" size={16} />
        ) : (
          <ChatBubbleOutlineIcon fontSize="small" />
        )}
      </Button>
      <Button
        size="small"
        variant="text"
        color="primary"
        disabled={!generationId || appIds.length === 0}
        onClick={handleGoToReviews}
        sx={{ minWidth: 40, minHeight: 40, padding: 0 }}
      >
        <ArrowForwardIcon fontSize="small" />
      </Button>
    </Box>
  );
});

