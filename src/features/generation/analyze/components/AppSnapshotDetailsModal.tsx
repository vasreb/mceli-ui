import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Link,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from '@tanstack/react-router';

import { api } from '@/api/client';
import type { AppCardSnapshotMetricsResponse, AppCardSnapshotResponse } from '@/api/types';
import { APP_METRIC_FIELDS } from '../appMetricsFields';
import { ReviewsAccordion } from '@/features/generation/data-tab/components/ReviewsAccordion';

type AppSnapshotDetailsModalProps = {
  open: boolean;
  snapshotId?: string;
  onClose: () => void;
};

export const AppSnapshotDetailsModal = ({ open, snapshotId, onClose }: AppSnapshotDetailsModalProps) => {
  const [card, setCard] = useState<AppCardSnapshotResponse | null>(null);
  const [metrics, setMetrics] = useState<AppCardSnapshotMetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'metrics' | 'data' | 'reviews'>('metrics');
  const [expandedFields, setExpandedFields] = useState<Set<string>>(() => new Set());
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const generationId = (params as any)?.id;

  useEffect(() => {
    if (!snapshotId) {
      return;
    }
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    Promise.all([api.getAppCardSnapshot(snapshotId), api.getAppCardSnapshotMetrics(snapshotId)])
      .then(([cardData, metricsData]) => {
        if (!isMounted) return;
        setCard(cardData);
        setMetrics(metricsData);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || 'Ошибка загрузки app snapshot');
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [snapshotId]);

  useEffect(() => {
    if (!open) {
      setActiveTab('metrics');
    }
  }, [open]);

  useEffect(() => {
    setExpandedFields(() => new Set());
  }, [snapshotId, activeTab]);

  const URL_REGEX = /(https?:\/\/[^\s]+)/g;

  const formatValue = (value: unknown) => {
    if (typeof value === 'number') {
      return value.toFixed(3);
    }
    if (typeof value === 'boolean') {
      return value ? 'yes' : 'no';
    }
    if (value === null || value === undefined) {
      return '—';
    }
    return String(value);
  };

  const formatTimestamp = (value: unknown) => {
    const num = Number(value);
    if (Number.isNaN(num)) {
      return null;
    }
    const date = new Date(num);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.toLocaleString();
  };

  const reviewAppIds = card?.appId ? [card.appId] : undefined;
  const canGoToReviews = Boolean(generationId && card?.appId);
  const handleGoToReviews = () => {
    if (!generationId || !card?.appId) return;
    navigate({
      to: '/generations/$id/analyze/$tab',
      params: { id: generationId, tab: 'reviews' },
      search: { 'filter.appId': card.appId },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>App snapshot</DialogTitle>
      <DialogContent dividers>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            flexWrap: 'wrap',
            mb: 1,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            aria-label="App snapshot tabs"
            sx={{ mb: 0 }}
          >
            <Tab value="metrics" label="Metrics" />
            <Tab value="data" label="Data" />
            <Tab value="reviews" label="Reviews" />
          </Tabs>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : metrics && card ? (
          activeTab === 'metrics' ? (
            <Box>
              <Typography variant="subtitle2" mb={1}>
                Metrics
              </Typography>
              <Box
                sx={{
                  border: '1px solid rgba(0,0,0,0.12)',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <Box
                  component="table"
                  sx={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    '& th, & td': {
                      borderBottom: '1px solid rgba(0,0,0,0.08)',
                      padding: '8px 12px',
                      textAlign: 'left',
                    },
                    '& th': {
                      backgroundColor: '#fafafa',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    },
                  }}
                >
                  <Box component="thead">
                    <Box component="tr">
                      <Box component="th">Metric</Box>
                      <Box component="th">Value</Box>
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {APP_METRIC_FIELDS.map(([label, accessor]) => (
                      <Box component="tr" key={label}>
                        <Box component="td">{label}</Box>
                        <Box component="td">
                          <Typography component="span" fontWeight={600}>
                            {formatValue(accessor(metrics.metrics))}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          ) : activeTab === 'data' ? (
            <Box>
              <Typography variant="subtitle2" mb={1}>
                App Data
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Object.entries(card.data || {}).map(([field, value]) => {
                  const stringValue = formatValue(value);
                  const fieldKey = `${field}`;
                  const isLong = typeof stringValue === 'string' && stringValue.length > 200;
                  const isExpanded = expandedFields.has(fieldKey);
                  const displayValue = isLong && !isExpanded ? `${stringValue.slice(0, 200)}…` : stringValue;
                  const extra =
                    field === 'updated'
                      ? formatTimestamp(value)
                      : field === 'updatedAt'
                      ? formatTimestamp(value)
                      : null;
                  const combinedValue = extra ? `${displayValue} (${extra})` : displayValue;
                  const parts = combinedValue.split(URL_REGEX);
                  const renderedValue = parts.map((part, index) =>
                    URL_REGEX.test(part) ? (
                      <Link key={`${part}-${index}`} href={part} target="_blank" rel="noreferrer">
                        {part}
                      </Link>
                    ) : (
                      part
                    ),
                  );
                  return (
                    <Box
                      key={fieldKey}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        borderBottom: '1px dashed rgba(0,0,0,0.08)',
                        pb: 1,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {field}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.9rem',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                          cursor: isLong ? 'pointer' : 'default',
                        }}
                        onClick={() => {
                          if (!isLong) return;
                          setExpandedFields((prev) => {
                            const next = new Set(prev);
                            if (next.has(fieldKey)) {
                              next.delete(fieldKey);
                            } else {
                              next.add(fieldKey);
                            }
                            return next;
                          });
                        }}
                      >
                        {renderedValue}
                        {extra ? ` (${extra})` : ''}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography variant="subtitle2" mb={1}>
                Reviews
              </Typography>
              <Button size="small" variant="outlined" disabled={!canGoToReviews} onClick={handleGoToReviews}>
                Go
              </Button>
              <ReviewsAccordion appIds={reviewAppIds} generationId={generationId} />
            </Box>
          )
        ) : (
          <Typography variant="body2" color="text.secondary">
            App snapshot пока не загружен.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};
