import { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Dialog, DialogContent, DialogTitle, Tab, Tabs, Typography } from '@mui/material';
import { api } from '@/api/client';
import type { RootInfoResponse, RootMetricsResponse } from '@/api/types';
import { ROOT_METRIC_FIELDS } from '../rootMetricsFields';

type RootDetailsModalProps = {
  open: boolean;
  generationId?: string;
  rootId?: string;
  onClose: () => void;
};

export const RootDetailsModal = ({ open, generationId, rootId, onClose }: RootDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'data'>('metrics');
  const [info, setInfo] = useState<RootInfoResponse | null>(null);
  const [metrics, setMetrics] = useState<RootMetricsResponse | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !generationId || !rootId) {
      return;
    }
    let isMounted = true;

    setIsLoadingInfo(true);
    setInfoError(null);
    setInfo(null);
    api
      .getAnalyzeRootInfo(rootId)
      .then((data) => {
        if (!isMounted) return;
        setInfo(data);
      })
      .catch((error) => {
        if (!isMounted) return;
        setInfoError(error?.message || 'Ошибка загрузки root info');
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingInfo(false);
      });

    setIsLoadingMetrics(true);
    setMetricsError(null);
    setMetrics(null);
    api
      .getAnalyzeRootMetrics(rootId)
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
  }, [open, generationId, rootId]);

  useEffect(() => {
    if (!open) {
      setActiveTab('metrics');
    }
  }, [open]);

  const formatValue = (value: unknown) => {
    if (value === null || value === undefined) {
      return '—';
    }
    if (Array.isArray(value)) {
      return value.join(', ');
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

  const infoFields = info
    ? [
        ['id', info.id],
        ['text', info.text],
        ['source', info.source],
        ['baseQueryIds', info.baseQueryIds],
        ['appsIds', info.appsIds],
        ['sanityStatus', info.sanityStatus],
        ['sanityOverlap', info.sanityOverlap],
        ['sanityCheckedAt', info.sanityCheckedAt],
        ['serpSnapshotId', info.serpSnapshotId],
        ['createdAt', info.createdAt],
      ]
    : [];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Root details</DialogTitle>
      <DialogContent dividers>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          aria-label="Root details tabs"
          sx={{ mb: 2 }}
        >
          <Tab value="metrics" label="Metrics" />
          <Tab value="data" label="Data" />
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
                          <Box component="th">Metric</Box>
                          <Box component="th">Value</Box>
                        </Box>
                      </Box>
                      <Box component="tbody">
                        {ROOT_METRIC_FIELDS.map(([label, accessor]) => (
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
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Метрики пока не загружены.
              </Typography>
            )}
          </Box>
        ) : (
          <Box>
            {infoError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {infoError}
              </Alert>
            )}
            {isLoadingInfo ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : info ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {infoFields.map(([field, value]) => (
                  <Box
                    key={field}
                    sx={{
                      borderBottom: '1px dashed rgba(0,0,0,0.08)',
                      pb: 1,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {field}
                    </Typography>
                    <Typography variant="body2">{formatValue(value)}</Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Данные root пока не загружены.
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
