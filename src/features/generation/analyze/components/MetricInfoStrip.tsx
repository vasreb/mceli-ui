import { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { MetricInfo } from './types';
import { MetricTipCard } from './MetricTipCard';
import type { MetricTipStore } from '../stores/metricTipStore';
import { observer } from 'mobx-react-lite';

type MetricInfoStripProps = {
  tips: MetricInfo[];
  expandedTip: string | null;
  onToggleTip: (metric: string) => void;
  onSortTip?: (metric: string) => void;
  store: MetricTipStore;
};

export const MetricInfoStrip = observer(
  ({
    tips,
    expandedTip,
    onToggleTip,
    onSortTip,
    store,
  }: MetricInfoStripProps) => {
  const [showMore, setShowMore] = useState(false);

  const sortedTips = store.getSortedTips(tips);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
        {sortedTips.slice(0, 5).map((tip) => (
          <MetricTipCard
            key={tip.metric}
            tip={tip}
            expanded={expandedTip === tip.metric}
            color={store.getColor(tip.metric)}
            onToggle={() => onToggleTip(tip.metric)}
            onSort={onSortTip ? () => onSortTip(tip.metric) : undefined}
            onColorChange={(selected) => store.setColor(tip.metric, selected)}
          />
        ))}
        {sortedTips.length > 5 && (
          <IconButton
            size="small"
            onClick={() => setShowMore((prev) => !prev)}
            sx={{ borderRadius: 2, border: '1px solid rgba(0,0,0,0.2)' }}
          >
            {showMore ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        )}
      </Box>
      {showMore && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {sortedTips.slice(5).map((tip) => (
            <MetricTipCard
              key={tip.metric}
              tip={tip}
              expanded={expandedTip === tip.metric}
              color={store.getColor(tip.metric)}
              onToggle={() => onToggleTip(tip.metric)}
              onSort={onSortTip ? () => onSortTip(tip.metric) : undefined}
              onColorChange={(selected) => store.setColor(tip.metric, selected)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
});

