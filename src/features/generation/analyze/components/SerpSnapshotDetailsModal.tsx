import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Link,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { api } from '@/api/client';
import type { SerpSnapshotDTO, SerpSnapshotMetricsResponse } from '@/api/types';
import { SERP_METRIC_FIELDS } from '../serpMetricsFields';

type SerpSnapshotDetailsModalProps = {
  open: boolean;
  snapshotId?: string;
  onClose: () => void;
};

export const SerpSnapshotDetailsModal = ({
  open,
  snapshotId,
  onClose,
}: SerpSnapshotDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'snapshot'>('metrics');
  const [snapshot, setSnapshot] = useState<SerpSnapshotDTO | null>(null);
  const [metrics, setMetrics] = useState<SerpSnapshotMetricsResponse | null>(null);
  const [isLoadingSnapshot, setIsLoadingSnapshot] = useState(false);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !snapshotId) {
      return;
    }
    let isMounted = true;

    setIsLoadingSnapshot(true);
    setSnapshotError(null);
    setSnapshot(null);
    api
      .getSerpSnapshot(snapshotId)
      .then((data) => {
        if (!isMounted) return;
        setSnapshot(data);
      })
      .catch((error) => {
        if (!isMounted) return;
        setSnapshotError(error?.message || 'Ошибка загрузки сниппета');
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingSnapshot(false);
      });

    setIsLoadingMetrics(true);
    setMetricsError(null);
    setMetrics(null);
    api
      .getSerpSnapshotMetrics(snapshotId)
      .then((data) => {
        if (!isMounted) return;
        setMetrics(data);
      })
      .catch((error) => {
        if (!isMounted) return;
        setMetricsError(error?.message || 'Ошибка загрузки метрик');
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingMetrics(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open, snapshotId]);

  useEffect(() => {
    if (!open) {
      setActiveTab('metrics');
    }
  }, [open]);

  const [expandedFields, setExpandedFields] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setExpandedFields(() => new Set());
  }, [snapshotId, open]);

  const parsedResultItems = useMemo(() => {
    if (!snapshot?.result) {
      return [];
    }
    const raw = snapshot.result;
    if (Array.isArray(raw)) {
      return raw;
    }
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        if (parsed?.items && Array.isArray(parsed.items)) {
          return parsed.items;
        }
      } catch {
        return [];
      }
    }
    if (typeof raw === 'object' && raw !== null && Array.isArray((raw as any).items)) {
      return (raw as any).items;
    }
    return [];
  }, [snapshot]);

  const formatFieldValue = (value: unknown) => {
    if (value === null || value === undefined) {
      return '—';
    }
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Snapshot details</DialogTitle>
      <DialogContent dividers>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          aria-label="Snapshot detail tabs"
          sx={{ mb: 2 }}
        >
          <Tab value="metrics" label="Metrics" />
          <Tab value="snapshot" label="Snapshot" />
        </Tabs>

        {activeTab === 'metrics' ? (
          <Box>
            {metricsError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {metricsError}
              </Alert>
            )}
            {isLoadingMetrics ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : metrics ? (
              <Box>
                <Typography variant="caption" sx={{ width: '100%' }}>
                  Updated at: {metrics.updatedAt}
                </Typography>
                <Box sx={{ mt: 2 }}>
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
                      }}
                    >
                      <Box component="thead">
                        <Box component="tr">
                          <Box component="th">Field</Box>
                          <Box component="th">Value</Box>
                        </Box>
                      </Box>
                      <Box component="tbody">
                        {SERP_METRIC_FIELDS.map(([, label, accessor]) => (
                          <Box component="tr" key={label}>
                            <Box component="td">{label}</Box>
                            <Box component="td">
                              <Typography component="span" fontWeight={600}>
                                {String(accessor(metrics.metrics))}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Метрики пока недоступны.
              </Typography>
            )}
          </Box>
        ) : (
          <Box>
            {snapshotError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {snapshotError}
              </Alert>
            )}
            {isLoadingSnapshot ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : snapshot ? (
              <Box>
                <Typography variant="subtitle2">Query</Typography>
                <Typography gutterBottom>{snapshot.queryText}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Locale: {snapshot.locale} · TopK: {snapshot.topK ?? '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Created at: {snapshot.createdAt}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1 }}>
                  {snapshot.topAppIds.map((appId) => (
                    <Chip key={appId} size="small" label={appId} />
                  ))}
                </Box>
                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                  Result
                </Typography>
                {parsedResultItems.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                    {parsedResultItems.map((item, index) => (
                      <Box
                        key={`${item.appId ?? item.id ?? index}-${index}`}
                        sx={{
                          border: '1px solid rgba(0,0,0,0.12)',
                          borderRadius: 2,
                          p: 2,
                          width: 260,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
                          {item.icon && (
                            <Box
                              component="img"
                              src={item.icon as string}
                              alt={item.title as string}
                              sx={{ width: 64, height: 64, objectFit: 'cover' }}
                            />
                          )}
                          <Typography variant="h6" fontWeight={600}>
                            {item.title ?? item.appId}
                          </Typography>
                          {Object.entries(item as Record<string, unknown>)
                            .filter(([field]) => field !== 'title')
                            .map(([field, value]) => {
                            const stringValue = formatFieldValue(value);
                            const fieldKey = `${index}-${field}`;
                            const isLong = typeof stringValue === 'string' && stringValue.length > 200;
                            const isExpanded = expandedFields.has(fieldKey);
                            const displayValue = isLong && !isExpanded ? `${stringValue.slice(0, 200)}…` : stringValue;
                            return (
                            <Typography
                                key={fieldKey}
                                variant="body2"
                                sx={{
                                  fontSize: '0.8rem',
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
                                {field}:&nbsp;
                                {field === 'url' ? (
                                  <Link
                                    href={displayValue as string}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    sx={{ wordBreak: 'break-all' }}
                                  >
                                    {displayValue}
                                  </Link>
                                ) : (
                                  displayValue
                                )}
                              </Typography>
                            );
                          })}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box
                    component="pre"
                    sx={{
                      fontFamily: 'monospace',
                      backgroundColor: '#f5f5f5',
                      p: 1,
                      borderRadius: 1,
                      maxHeight: 240,
                      overflow: 'auto',
                    }}
                  >
                    {JSON.stringify(snapshot.result, null, 2)}
                  </Box>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Snapshot пока не загружен.
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

