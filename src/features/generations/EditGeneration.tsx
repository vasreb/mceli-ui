import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, useParams, useRouterState } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  IconButton,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { ContentCopy as ContentCopyIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { editGenerationStore } from './stores/editGenerationStore';
import { OverviewTab } from './components/OverviewTab';
import { BaseQueriesTab } from './components/BaseQueriesTab';
import { ClustersTab } from './components/ClustersTab';
import { RootsTab } from './components/RootsTab';
import { JsonTab } from './components/JsonTab';
import { GeneralAccordion } from './components/GeneralAccordion';
import { ClusteringAccordion } from './components/ClusteringAccordion';
import { SanityAccordion } from './components/SanityAccordion';
import styles from './EditGeneration.module.scss';

import type { StartGenerationDto } from '../../api/types';
import type { GenerationFormData } from './types';

export const EditGeneration = observer(() => {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const params = useParams({ strict: false });
  const id = (params as any)?.id;
  const isCreate = routerState.location.pathname === '/generations/create' || !id;
  const { generation, defaults, isLoading, error, isSaving, activeTab, isTestMode } = editGenerationStore;

  const getDefaultFormValues = (): GenerationFormData => {
    const baseFormData: GenerationFormData = {
      baseQueriesText: '',
      locale: 'us',
      idempotencyKey: '',
      serpSnapshotMaxAgeDays: undefined,
      serpTopK: undefined,
      ngramMinCount: undefined,
      clustering: {
        inclusionRule: 'OK_ONLY' as const,
        serpTopK: undefined,
        threshold: undefined,
      },
      sanity: {
        zeroOverlapIsBad: true,
        oneWordPolicy: 'WARN' as const,
        serpTopK: undefined,
        minRootResults: undefined,
        okOverlapThreshold: undefined,
      },
    };

    if (defaults) {
      return {
        ...baseFormData,
        serpSnapshotMaxAgeDays: defaults.serpSnapshotMaxAgeDays,
        serpTopK: defaults.serpTopK,
        ngramMinCount: defaults.ngramMinCount,
        clustering: {
          inclusionRule: baseFormData.clustering.inclusionRule,
          serpTopK: defaults.clustering.serpTopK,
          threshold: defaults.clustering.threshold,
        },
        sanity: {
          minRootResults: defaults.sanity.minRootResults,
          okOverlapThreshold: defaults.sanity.okOverlapThreshold,
          zeroOverlapIsBad: defaults.sanity.zeroOverlapIsBad,
          oneWordPolicy: defaults.sanity.oneWordPolicy,
          serpTopK: defaults.sanity.serpTopK,
        },
      };
    }

    return baseFormData;
  };

  const {
    register,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<GenerationFormData>({
    defaultValues: getDefaultFormValues(),
  });

  useEffect(() => {
    if (!isCreate && id) {
      editGenerationStore.loadGeneration(id);
    }
    return () => {
      editGenerationStore.reset();
    };
  }, [id, isCreate]);

  useEffect(() => {
    if (defaults && isCreate) {
      reset(getDefaultFormValues(), { keepDefaultValues: false });
    }
  }, [defaults, reset, isCreate]);

  useEffect(() => {
    if (generation && !isCreate) {
      const defaultValues = getDefaultFormValues();
      const rootTextList = (generation.baseQueries || []).map((q) =>
        typeof q === 'string' ? q : q?.text || ''
      );

      reset({
        baseQueriesText: rootTextList.filter(Boolean).join('\n'),
        locale: 'us',
        serpSnapshotMaxAgeDays: generation.config.serpSnapshotMaxAgeDays,
        serpTopK: generation.config.serpTopK,
        ngramMinCount: generation.config.ngramMinCount,
        idempotencyKey: '',
        clustering: generation.config.clustering || defaultValues.clustering,
        sanity: generation.config.sanity || defaultValues.sanity,
      });
    }
  }, [generation, isCreate, reset, defaults]);

  const handleRemoveQuery = (index: number) => {
    const currentQueries = watch('baseQueriesText').split('\n').filter((q) => q.trim());
    currentQueries.splice(index, 1);
    reset({ ...watch(), baseQueriesText: currentQueries.join('\n') });
  };

  const handlePasteQueries = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const queries = text.split('\n').filter((q) => q.trim());
      reset({ ...watch(), baseQueriesText: queries.join('\n') });
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleClearQueries = () => {
    reset({ ...watch(), baseQueriesText: '' });
  };

  const buildStartGenerationDto = (data: GenerationFormData): StartGenerationDto => {
    const baseQueries = data.baseQueriesText.split('\n').filter((q) => q.trim());
    
    const config: any = {
      locale: data.locale,
    };

    if (data.serpTopK !== undefined) {
      config.serpTopK = data.serpTopK;
    }
    if (data.serpSnapshotMaxAgeDays !== undefined) {
      config.serpSnapshotMaxAgeDays = data.serpSnapshotMaxAgeDays;
    }
    if (data.ngramMinCount !== undefined) {
      config.ngramMinCount = data.ngramMinCount;
    }

    const clustering: any = {
      inclusionRule: data.clustering.inclusionRule,
    };
    if (data.clustering.serpTopK !== undefined) {
      clustering.serpTopK = data.clustering.serpTopK;
    }
    if (data.clustering.threshold !== undefined) {
      clustering.threshold = data.clustering.threshold;
    }
    config.clustering = clustering;

    const sanity: any = {
      zeroOverlapIsBad: data.sanity.zeroOverlapIsBad,
      oneWordPolicy: data.sanity.oneWordPolicy,
    };
    if (data.sanity.minRootResults !== undefined) {
      sanity.minRootResults = data.sanity.minRootResults;
    }
    if (data.sanity.okOverlapThreshold !== undefined) {
      sanity.okOverlapThreshold = data.sanity.okOverlapThreshold;
    }
    if (data.sanity.serpTopK !== undefined) {
      sanity.serpTopK = data.sanity.serpTopK;
    }
    config.sanity = sanity;

    const result: any = {
      baseQueries,
      config,
    };

    if (data.idempotencyKey) {
      result.idempotencyKey = data.idempotencyKey;
    }

    return result as StartGenerationDto;
  };

  const handleRerun = async () => {
    if (!id || !generation) return;
    try {
      const formData = watch();
      const dto = buildStartGenerationDto(formData);
      await editGenerationStore.rerunGeneration(id, dto);
    } catch (error) {
      console.error('Ошибка перезапуска:', error);
    }
  };

  const handleGenerateIdempotencyKey = () => {
    const key = `idempotency-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    reset({ ...watch(), idempotencyKey: key });
  };

  const handleStart = async () => {
    try {
      const formData = watch();
      const dto = buildStartGenerationDto(formData);
      const generationId = await editGenerationStore.startGeneration(dto);
      if (generationId) {
        navigate({ to: '/generations/$id', params: { id: generationId } });
      }
    } catch (error) {
      console.error('Ошибка запуска:', error);
    }
  };

  const handleBack = () => {
    navigate({ to: '/generations' });
  };

  const baseQueries = watch('baseQueriesText').split('\n').filter((q) => q.trim());

  if (isLoading && !isCreate) {
    return (
      <Container maxWidth="xl" className={styles.container}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Box sx={{ py: 4 }}>
        <Box className={styles.stickyHeader}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={handleBack} size="small">
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4" component="h1">
                {isCreate ? 'New Generation' : `Generations / ${generation?.id || id}`}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isTestMode}
                    onChange={(e) => editGenerationStore.setTestMode(e.target.checked)}
                    size="small"
                  />
                }
                label="Test send"
              />
              {isCreate ? (
                <Button variant="contained" onClick={handleStart} disabled={isSaving}>
                  {isSaving ? <CircularProgress size={24} /> : 'Start'}
                </Button>
              ) : (
                <Button variant="contained" onClick={handleRerun} disabled={isSaving}>
                  {isSaving ? <CircularProgress size={24} /> : 'Re-run'}
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Configuration
              </Typography>

              <Box component="form">
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Base Queries
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={watch('baseQueriesText')}
                    {...register('baseQueriesText', { required: 'Base queries are required' })}
                    error={!!errors.baseQueriesText}
                    helperText={errors.baseQueriesText?.message}
                    placeholder="Enter base queries, one per line"
                  />
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button size="small" onClick={handlePasteQueries}>
                      Paste
                    </Button>
                    <Button size="small" onClick={handleClearQueries}>
                      Clear
                    </Button>
                  </Box>
                  {baseQueries.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                      {baseQueries.map((query, index) => (
                        <Chip
                          key={index}
                          label={query}
                          onDelete={() => handleRemoveQuery(index)}
                          size="small"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      No base queries
                    </Typography>
                  )}
                </Box>

                <GeneralAccordion control={control} register={register} errors={errors} />
                <ClusteringAccordion control={control} register={register} errors={errors} />
                <SanityAccordion control={control} register={register} errors={errors} />

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Idempotency Key
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    {...register('idempotencyKey')}
                    placeholder="Optional unique key for request deduplication"
                    InputProps={{
                      endAdornment: (
                        <IconButton size="small" onClick={handleGenerateIdempotencyKey}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      ),
                    }}
                  />
                  <Button size="small" onClick={handleGenerateIdempotencyKey} sx={{ mt: 1 }}>
                    Generate
                  </Button>
                </Box>

              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }} className={styles.stickyRightPanel}>
              <Typography variant="h6" gutterBottom>
                Configuration & Generation Data
              </Typography>
              <Tabs
                value={activeTab}
                onChange={(_, value) => editGenerationStore.setActiveTab(value)}
                sx={{ mb: 2 }}
              >
                <Tab label="Overview" value="overview" />
                <Tab label="Base Queries" value="baseQueries" />
                <Tab label="Roots" value="roots" />
                <Tab label="Clusters" value="clusters" />
                <Tab label="JSON" value="json" />
              </Tabs>

              <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'baseQueries' && <BaseQueriesTab />}
                {activeTab === 'roots' && <RootsTab />}
                {activeTab === 'clusters' && <ClustersTab />}
                {activeTab === 'json' && <JsonTab />}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
});
