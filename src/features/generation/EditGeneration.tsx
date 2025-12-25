import { Tabs, Tab, Box, Container } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useNavigate, useParams, useRouterState } from '@tanstack/react-router';
import { DataTab } from '@/features/generation/data-tab/DataTab';
import { AnalyzeTab } from '@/features/generation/analyze/AnalyzeTab';

import styles from './EditGeneration.module.scss';

export const EditGeneration = observer(() => {
  const routerState = useRouterState();
  const params = useParams({ strict: false });
  const navigate = useNavigate();
  const path = routerState.location.pathname;
  const id = (params as any)?.id;
  const tabParam = (params as any)?.tab as string | undefined;
  const isCreate = routerState.location.pathname === '/generations/create' || !id;
  const activeTab: 'data' | 'analyze' = path.includes('/analyze') ? 'analyze' : 'data';

  const handleTabChange = (_: any, value: 'data' | 'analyze') => {
    if (value === 'analyze') {
      if (!id) return;
      navigate({ to: '/generations/$id/analyze/overview', params: { id, tab: 'overview' } });
    } else {
      if (isCreate) {
        navigate({ to: '/generations/create' });
        return;
      }
      if (id) {
        navigate({ to: '/generations/$id/data', params: { id } });
      }
    }
  };

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Box sx={{ py: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="standard" sx={{ mb: 3 }}>
          <Tab label="Data" value="data" />
          <Tab label="Analyze" value="analyze" disabled={!id} />
        </Tabs>
        {activeTab === 'data' ? (
          <DataTab id={id} isCreate={isCreate} />
        ) : (
          <AnalyzeTab id={id} isCreate={isCreate} routeTab={tabParam as any} />
        )}
      </Box>
    </Container>
  );
});
