import { Control, Controller, FieldValues, useForm, useWatch } from 'react-hook-form';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Button,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { useCallback, useMemo, useState, type SyntheticEvent, type MouseEvent } from 'react';
import { editGenerationStore } from '@/features/generation/stores/editGenerationStore';
import type { GenerationFormData } from '@/features/generation/types';

interface ReviewsAccordionProps {
  control?: Control<GenerationFormData>;
  appIds?: string[];
  generationId?: string;
}

const sanitizeReviewValues = (values?: Record<string, unknown>) => {
  if (!values) {
    return undefined;
  }
  const normalized: Record<string, unknown> = {};
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return;
    }
    if (Array.isArray(value) && value.length === 0) {
      return;
    }
    normalized[key] = value;
  });
  return Object.keys(normalized).length ? normalized : undefined;
};

export const ReviewsAccordion = observer(({ control, appIds, generationId }: ReviewsAccordionProps) => {
  const { fetchReviews, isFetchingReviews, fetchReviewsError, generation } = editGenerationStore;

  const [expanded, setExpanded] = useState(false);
  const form = useForm<FieldValues>({
    defaultValues: {
      reviews: {},
    },
  });
  const effectiveControl = control ? (control as unknown as Control<FieldValues>) : form.control;
  const reviewsValues = useWatch({
    control: effectiveControl,
    name: 'reviews',
  });
  const reviewConfig = useMemo(() => sanitizeReviewValues(reviewsValues), [reviewsValues]);
  const fetchConfig = useMemo(() => {
    if (appIds && appIds.length) {
      return { ...reviewConfig, appIds };
    }
    return reviewConfig;
  }, [appIds, reviewConfig]);

  const effectiveGenerationId = generationId ?? generation?.id;

  const handleFetch = useCallback(() => {
    if (!effectiveGenerationId) {
      return;
    }
    fetchReviews(fetchConfig, effectiveGenerationId);
  }, [fetchReviews, effectiveGenerationId, fetchConfig]);

  const handleAccordionChange = useCallback((_event: SyntheticEvent, value: boolean) => {
    setExpanded(value);
  }, []);

  const handleFetchClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      handleFetch();
    },
    [handleFetch],
  );

  return (
    <Accordion sx={{ mt: 2 }} expanded={expanded} onChange={handleAccordionChange}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Typography variant="subtitle2">Reviews</Typography>
          <Button
            variant="outlined"
            size="small"
            disabled={!effectiveGenerationId || isFetchingReviews}
            onClick={handleFetchClick}
          >
            {isFetchingReviews ? 'Fetching...' : 'Fetch Reviews'}
          </Button>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Controller
            name="reviews.startPage"
            control={effectiveControl}
            render={({ field }) => (
              <TextField
                fullWidth
                label="Start Page"
                type="number"
                {...field}
                value={field.value ?? ''}
                onChange={(event) => {
                  const value = event.target.value === '' ? undefined : Number(event.target.value);
                  field.onChange(value);
                }}
              />
            )}
          />
          <Controller
            name="reviews.pagesToScrape"
            control={effectiveControl}
            render={({ field }) => (
              <TextField
                fullWidth
                label="Pages To Scrape"
                type="number"
                {...field}
                value={field.value ?? ''}
                onChange={(event) => {
                  const value = event.target.value === '' ? undefined : Number(event.target.value);
                  field.onChange(value);
                }}
              />
            )}
          />
          <Controller
            name="reviews.reviewsPerPage"
            control={effectiveControl}
            render={({ field }) => (
              <TextField
                fullWidth
                label="Reviews Per Page"
                type="number"
                {...field}
                value={field.value ?? ''}
                onChange={(event) => {
                  const value = event.target.value === '' ? undefined : Number(event.target.value);
                  field.onChange(value);
                }}
              />
            )}
          />
          <Controller
            name="reviews.maxReviews"
            control={effectiveControl}
            render={({ field }) => (
              <TextField
                fullWidth
                label="Max Reviews"
                type="number"
                {...field}
                value={field.value ?? ''}
                onChange={(event) => {
                  const value = event.target.value === '' ? undefined : Number(event.target.value);
                  field.onChange(value);
                }}
              />
            )}
          />
          <Controller
            name="reviews.deviceType"
            control={effectiveControl}
            render={({ field }) => <TextField fullWidth label="Device Type" {...field} value={field.value ?? ''} />}
          />
          <Controller
            name="reviews.uniqueOnly"
            control={effectiveControl}
            render={({ field }) => (
              <FormControlLabel control={<Switch {...field} checked={Boolean(field.value)} />} label="Unique Only" />
            )}
          />
          <Controller
            name="reviews.sortBy"
            control={effectiveControl}
            render={({ field }) => <TextField fullWidth label="Sort By" {...field} value={field.value ?? ''} />}
          />
          <Controller
            name="reviews.rating"
            control={effectiveControl}
            render={({ field }) => (
              <TextField
                fullWidth
                label="Rating"
                type="number"
                {...field}
                value={field.value ?? ''}
                onChange={(event) => {
                  const value = event.target.value === '' ? undefined : Number(event.target.value);
                  field.onChange(value);
                }}
              />
            )}
          />
          <Controller
            name="reviews.ratingFilter"
            control={effectiveControl}
            render={({ field }) => {
              const ratingFilterValues = Array.isArray(field.value) ? field.value : [];
              return (
              <TextField
                fullWidth
                label="Rating Filter (comma separated)"
                {...field}
                  value={ratingFilterValues.join(', ')}
                onChange={(event) => {
                  const next = event.target.value
                    .split(',')
                    .map((value) => Number(value.trim()))
                    .filter((number) => !Number.isNaN(number));
                  field.onChange(next);
                }}
              />
              );
            }}
          />
          <Controller
            name="reviews.language"
            control={effectiveControl}
            render={({ field }) => {
              const languageValues = Array.isArray(field.value) ? field.value : [];
              return (
              <TextField
                fullWidth
                label="Language (comma separated)"
                {...field}
                  value={languageValues.join(', ')}
                onChange={(event) => {
                  const languages = event.target.value
                    .split(',')
                    .map((value) => value.trim())
                    .filter((value) => value);
                  field.onChange(languages);
                }}
              />
              );
            }}
          />
          <Controller
            name="reviews.recentDays"
            control={effectiveControl}
            render={({ field }) => (
              <TextField
                fullWidth
                label="Recent Days"
                type="number"
                {...field}
                value={field.value ?? ''}
                onChange={(event) => {
                  const value = event.target.value === '' ? undefined : Number(event.target.value);
                  field.onChange(value);
                }}
              />
            )}
          />
          <Controller
            name="reviews.endDate"
            control={effectiveControl}
            render={({ field }) => (
              <TextField
                fullWidth
                label="End Date"
                type="date"
                {...field}
                value={field.value ?? ''}
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </Box>
          {fetchReviewsError && (
            <Typography variant="body2" color="error">
              {fetchReviewsError}
            </Typography>
          )}
      </AccordionDetails>
    </Accordion>
  );
});
