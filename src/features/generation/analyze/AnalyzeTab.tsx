import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Link,
  Tabs,
  Tab,
  Paper,
  Button,
  CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from '@tanstack/react-router';
import { observer } from 'mobx-react-lite';
import { editGenerationStore } from '@/features/generation/stores/editGenerationStore';
import { AnalyzeOverviewTab } from './components/AnalyzeOverviewTab';
import { AnalyzeSerpsTab } from './components/AnalyzeSerpsTab';
import { AnalyzeAppsTab } from './components/AnalyzeAppsTab';
import { AnalyzeRootsTab } from './components/AnalyzeRootsTab';
import { AnalyzeClustersTab } from './components/AnalyzeClustersTab';
import { AnalyzeVariantsTab } from './components/AnalyzeVariantsTab';
import { AnalyzeReviewsTab } from './components/AnalyzeReviewsTab';
import { analyzeStore } from './analyzeStore';
import styles from '@/features/generation/EditGeneration.module.scss';

type AnalyzeTabProps = {
  id?: string;
  isCreate: boolean;
  routeTab?: 'overview' | 'serps' | 'apps' | 'roots' | 'clusters' | 'variants' | 'reviews';
};

export const AnalyzeTab = observer(({ id, isCreate, routeTab }: AnalyzeTabProps) => {
  const navigate = useNavigate();
  const { generation } = editGenerationStore;
  const [activeTab, setActiveTab] = useState<
    'overview' | 'serps' | 'apps' | 'roots' | 'clusters' | 'variants' | 'reviews'
  >('overview');

  useEffect(() => {
    analyzeStore.reset();
  }, [id]);

  useEffect(() => {
    if (routeTab) {
      setActiveTab(routeTab);
    } else {
      setActiveTab('overview');
    }
  }, [routeTab]);

  const handleAnalyze = async () => {
    if (!id) {
      return;
    }
    await analyzeStore.triggerAnalyze(id);
  };

  const handleBack = () => {
    navigate({ to: '/generations' });
  };

  return (
    <Box>
      <Box className={styles.stickyHeader}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handleBack} size="small">
              <ArrowBackIcon />
            </IconButton>
            <Box>
              {generation?.parentId && (
                <Link
                  href={`/generations/${generation.parentId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="caption"
                  display="block"
                >
                  parent / {generation.parentId}
                </Link>
              )}
              <Typography variant="h6" component="h1">
                {isCreate ? 'New Generation' : `Generations / ${generation?.id || id}`}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={handleAnalyze}
            disabled={!id || analyzeStore.isAnalyzing}
            startIcon={
              analyzeStore.isAnalyzing ? <CircularProgress color="inherit" size={16} /> : undefined
            }
          >
            Analyze
          </Button>
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Paper elevation={2}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Analyze
            </Typography>
          <Tabs
            value={activeTab}
            onChange={(_, value) => {
              setActiveTab(value);
              if (id) {
                navigate({ to: '/generations/$id/analyze/$tab', params: { id, tab: value } });
              }
            }}
            aria-label="Analyze tabs"
            sx={{ mb: 2 }}
          >
            <Tab label="Overview" value="overview" />
            <Tab label="SERPs" value="serps" />
            <Tab label="Apps" value="apps" />
            <Tab label="Roots" value="roots" />
            <Tab label="Clusters" value="clusters" />
            <Tab label="Variants" value="variants" />
            <Tab label="Reviews" value="reviews" />
          </Tabs>
          <Box>
            {activeTab === 'overview' ? (
              <AnalyzeOverviewTab id={id} />
            ) : activeTab === 'serps' ? (
              <AnalyzeSerpsTab id={id} />
            ) : activeTab === 'apps' ? (
              <AnalyzeAppsTab id={id} />
            ) : activeTab === 'clusters' ? (
              <AnalyzeClustersTab id={id} />
            ) : activeTab === 'variants' ? (
              <AnalyzeVariantsTab id={id} />
            ) : activeTab === 'reviews' ? (
              <AnalyzeReviewsTab id={id} />
            ) : (
              <AnalyzeRootsTab id={id} />
            )}
          </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
});

