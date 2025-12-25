import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Link,
} from '@mui/material';
import { ContentCopy as ContentCopyIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { editGenerationStore } from '@/features/generation/stores/editGenerationStore';
import { OverviewTab } from './components/OverviewTab';
import { BaseQueriesTab } from './components/BaseQueriesTab';
import { ClustersTab } from './components/ClustersTab';
import { RootsTab } from './components/RootsTab';
import { JsonTab } from './components/JsonTab';
import { GeneralAccordion } from './components/GeneralAccordion';
import { AppCardsAccordion } from './components/AppCardsAccordion';
import { ClusteringAccordion } from './components/ClusteringAccordion';
import { SanityAccordion } from './components/SanityAccordion';
import { VariantsAccordion } from './components/VariantsAccordion';
import { VariantsTab } from './components/VariantsTab';
import { ReviewsAccordion } from './components/ReviewsAccordion';
import styles from '@/features/generation/EditGeneration.module.scss';
import type { GenerationFormData } from '@/features/generation/types';
import type { StartGenerationDto } from '@/api/types';
import { AppsTab } from './components/AppsTab';

type DataTabProps = {
  id?: string;
  isCreate: boolean;
};

export const DataTab = observer(({ id, isCreate }: DataTabProps) => {
  const navigate = useNavigate();
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
        dedup: false,
      },
      variants: {
        inclusionRule: undefined,
        ttlDays: undefined,
        autosuggestions: false,
        similar: false,
        questions: false,
      },
      appCards: {
        ttlDays: undefined,
      },
      reviews: {
        startPage: undefined,
        pagesToScrape: undefined,
        reviewsPerPage: undefined,
        maxReviews: undefined,
        deviceType: '',
        uniqueOnly: false,
        sortBy: '',
        rating: undefined,
        ratingFilter: [],
        language: [],
        recentDays: undefined,
        endDate: undefined,
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
          dedup: defaults.sanity.dedup,
        },
        variants: {
          inclusionRule: defaults.variants?.inclusionRule,
          ttlDays: defaults.variants?.ttlDays,
          autosuggestions: defaults.variants?.autosuggestions ?? false,
          similar: defaults.variants?.similar ?? false,
          questions: defaults.variants?.questions ?? false,
        },
        appCards: {
          ttlDays: defaults.appCards?.ttlDays,
        },
        reviews: {
          startPage: defaults.reviews?.startPage,
          pagesToScrape: defaults.reviews?.pagesToScrape,
          reviewsPerPage: defaults.reviews?.reviewsPerPage,
          maxReviews: defaults.reviews?.maxReviews,
          deviceType: defaults.reviews?.deviceType ?? '',
          uniqueOnly: defaults.reviews?.uniqueOnly ?? false,
          sortBy: defaults.reviews?.sortBy ?? '',
          rating: defaults.reviews?.rating,
          ratingFilter: defaults.reviews?.ratingFilter ?? [],
          language: defaults.reviews?.language ?? [],
          recentDays: defaults.reviews?.recentDays,
          endDate: defaults.reviews?.endDate,
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
      const rootTextList = (generation.baseQueries || []).map((q) => (typeof q === 'string' ? q : q?.text || ''));

      reset({
        baseQueriesText: rootTextList.filter(Boolean).join('\n'),
        locale: 'us',
        serpSnapshotMaxAgeDays: generation.config.serpSnapshotMaxAgeDays,
        serpTopK: generation.config.serpTopK,
        ngramMinCount: generation.config.ngramMinCount,
        idempotencyKey: '',
        clustering: generation.config.clustering || defaultValues.clustering,
        sanity: generation.config.sanity || defaultValues.sanity,
        variants: {
          ...defaultValues.variants,
          ...(generation.config.variants || {}),
        },
        appCards: generation.config.appCards || defaultValues.appCards,
        reviews: generation.config.reviews || defaultValues.reviews,
      });
    }
  }, [generation, isCreate, reset, defaults]);

  const handleRemoveQuery = (index: number) => {
    const currentQueries = watch('baseQueriesText')
      .split('\n')
      .filter((q) => q.trim());
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
    if (data.sanity.dedup !== undefined) {
      sanity.dedup = data.sanity.dedup;
    }
    config.sanity = sanity;

    const variants: any = {};
    if (data.variants.inclusionRule) {
      variants.inclusionRule = data.variants.inclusionRule;
    }
    if (data.variants.ttlDays !== undefined) {
      variants.ttlDays = data.variants.ttlDays;
    }
    variants.autosuggestions = Boolean(data.variants.autosuggestions);
    variants.similar = Boolean(data.variants.similar);
    variants.questions = Boolean(data.variants.questions);
    if (Object.keys(variants).length > 0) {
      config.variants = variants;
    }

    if (data.appCards.ttlDays !== undefined) {
      config.appCards = { ttlDays: data.appCards.ttlDays };
    }

    const hasReviewConfig =
      data.reviews.uniqueOnly ||
      data.reviews.startPage !== undefined ||
      data.reviews.pagesToScrape !== undefined ||
      data.reviews.reviewsPerPage !== undefined ||
      data.reviews.maxReviews !== undefined ||
      Boolean(data.reviews.deviceType) ||
      Boolean(data.reviews.sortBy) ||
      data.reviews.rating !== undefined ||
      data.reviews.ratingFilter.length > 0 ||
      data.reviews.language.length > 0 ||
      data.reviews.recentDays !== undefined ||
      Boolean(data.reviews.endDate);

    if (hasReviewConfig) {
    const reviews: any = {
      uniqueOnly: data.reviews?.uniqueOnly ?? false,
    };
    if (data.reviews?.startPage !== undefined) {
      reviews.startPage = data.reviews.startPage;
    }
    if (data.reviews?.pagesToScrape !== undefined) {
      reviews.pagesToScrape = data.reviews.pagesToScrape;
    }
    if (data.reviews?.reviewsPerPage !== undefined) {
      reviews.reviewsPerPage = data.reviews.reviewsPerPage;
    }
    if (data.reviews?.maxReviews !== undefined) {
      reviews.maxReviews = data.reviews.maxReviews;
    }
    if (data.reviews?.deviceType) {
      reviews.deviceType = data.reviews.deviceType;
    }
    if (data.reviews?.sortBy) {
      reviews.sortBy = data.reviews.sortBy;
    }
    if (data.reviews?.rating !== undefined) {
      reviews.rating = data.reviews.rating;
    }
    if (data.reviews?.ratingFilter?.length > 0) {
      reviews.ratingFilter = data.reviews.ratingFilter;
    }
    if (data.reviews?.language?.length > 0) {
      reviews.language = data.reviews.language;
    }
    if (data.reviews?.recentDays !== undefined) {
      reviews.recentDays = data.reviews.recentDays;
    }
    if (data.reviews?.endDate) {
      reviews.endDate = data.reviews.endDate;
    }
      config.reviews = reviews;
    }

    const result: any = {
      baseQueries,
      config,
    };

    if (data.idempotencyKey) {
      result.idempotencyKey = data.idempotencyKey;
    }

    if (generation?.id !== undefined) {
      result.id = generation?.id;
    }

    return result as StartGenerationDto;
  };

  const handleRerun = async () => {
    if (!id || !generation) return;
    try {
      const dto = buildStartGenerationDto(watch());
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
      const dto = buildStartGenerationDto(watch());
      const generationId = await editGenerationStore.startGeneration(dto);
      if (generationId) {
        navigate({ to: '/generations/$id/data', params: { id: generationId } });
      }
    } catch (error) {
      console.error('Ошибка запуска:', error);
    }
  };

  const handleBack = () => {
    navigate({ to: '/generations' });
  };

  const generationErrors = generation?.errors ?? [];
  const baseQueries = watch('baseQueriesText')
    .split('\n')
    .filter((q) => q.trim());

  if (isLoading && !isCreate) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box className={styles.stickyHeader}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
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
              <>
                <Button variant="contained" onClick={handleRerun} disabled={isSaving}>
                  {isSaving ? <CircularProgress size={24} /> : 'Re-run'}
                </Button>
                <Button variant="contained" onClick={handleStart} disabled={isSaving}>
                  {isSaving ? <CircularProgress size={24} /> : 'As new'}
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {(error || generationErrors.length > 0) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error && <Typography>{error}</Typography>}
          {generationErrors.length > 0 && (
            <Box component="ul" sx={{ pl: 2, mb: 0 }}>
              {generationErrors.map((item, index) => (
                <li key={index}>
                  <Typography variant="body2">{item}</Typography>
                </li>
              ))}
            </Box>
          )}
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
                  {...register('baseQueriesText', {
                    required: 'Base queries are required',
                  })}
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
                      <Chip key={index} label={query} onDelete={() => handleRemoveQuery(index)} size="small" />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    No base queries
                  </Typography>
                )}
              </Box>
              <GeneralAccordion control={control} register={register} errors={errors} />
              <AppCardsAccordion control={control} />
              <ClusteringAccordion control={control} register={register} errors={errors} />
              <SanityAccordion control={control} register={register} errors={errors} />
              <VariantsAccordion control={control} errors={errors} />
              <ReviewsAccordion control={control} />
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
            <Tabs value={activeTab} onChange={(_, value) => editGenerationStore.setActiveTab(value)} sx={{ mb: 0 }}>
              <Tab sx={{ p: 1 }} label="Overview" value="overview" />
              <Tab sx={{ p: 1 }} label="Base Queries" value="baseQueries" />
              <Tab sx={{ p: 1 }} label="Roots" value="roots" />
              <Tab sx={{ p: 1 }} label="Clusters" value="clusters" />
              <Tab sx={{ p: 1 }} label="Variants" value="variants" />
              <Tab sx={{ p: 1 }} label="Apps" value="apps" />
              <Tab sx={{ p: 1 }} label="JSON" value="json" />
            </Tabs>
            <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'baseQueries' && <BaseQueriesTab />}
              {activeTab === 'roots' && <RootsTab />}
              {activeTab === 'clusters' && <ClustersTab />}
              {activeTab === 'variants' && <VariantsTab />}
              {activeTab === 'apps' && <AppsTab />}
              {activeTab === 'json' && <JsonTab />}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
});
