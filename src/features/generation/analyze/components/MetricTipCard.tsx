import { Box, Typography, IconButton, Popover, Stack } from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import PaletteIcon from '@mui/icons-material/Palette';
import type { MetricInfo } from './types';
import type { MouseEvent } from 'react';
import { useState } from 'react';
import { PALETTE_COLORS } from './palette';

type MetricTipCardProps = {
  tip: MetricInfo;
  expanded: boolean;
  onToggle: () => void;
  onSort?: () => void;
  color?: string | null;
  onColorChange?: (selected: string | null) => void;
};

export const MetricTipCard = ({ tip, expanded, onToggle, onSort, color, onColorChange }: MetricTipCardProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleSortClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onSort?.();
  };

  const handlePaletteToggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl((prev) => (prev ? null : event.currentTarget));
  };

  const paletteOpen = Boolean(anchorEl);
  const paletteId = paletteOpen ? `${tip.metric}-palette` : undefined;

  const handleColorSelect = (selected: string | null) => {
    onColorChange?.(selected);
    setAnchorEl(null);
  };

  return (
    <>
      <Box
        sx={{
          border: '1px solid rgba(0,0,0,0.12)',
          borderRadius: 2,
          p: 1,
          width: 220,
          cursor: 'pointer',
          backgroundColor: color ?? '#fff',
          boxShadow: expanded ? '0 0 8px rgba(0,0,0,0.1)' : 'none',
          transition: 'box-shadow 0.2s ease',
          wordBreak: 'break-word',
        }}
        onClick={onToggle}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2" fontSize="0.8rem" fontWeight={600} gutterBottom>
            {tip.title}
          </Typography>
          <Stack direction="row" spacing={0.5}>
            {onSort && (
              <IconButton size="small" onClick={handleSortClick}>
                <SortIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton size="small" onClick={handlePaletteToggle}>
              <PaletteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Что отражает:
        </Typography>
        <Typography variant="body2" fontSize="0.75rem">
          {tip.what}
        </Typography>
        {expanded && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Как считается:
            </Typography>
            <Typography variant="caption" display="block">
              {tip.how}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Как интерпретировать:
            </Typography>
            <Typography variant="caption" display="block">
              {tip.interpret}
            </Typography>
          </Box>
        )}
      </Box>
      <Popover
        id={paletteId}
        open={paletteOpen}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Stack direction="row" spacing={1} sx={{ p: 1 }}>
          {PALETTE_COLORS.map((itemColor) => (
            <Box
              key={itemColor}
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                bgcolor: itemColor,
                cursor: 'pointer',
                border: '1px solid rgba(0,0,0,0.12)',
              }}
              onClick={() => handleColorSelect(itemColor)}
            />
          ))}
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              bgcolor: '#fff',
              cursor: 'pointer',
              border: '1px dashed rgba(0,0,0,0.4)',
            }}
            onClick={() => handleColorSelect(null)}
          />
        </Stack>
      </Popover>
    </>
  );
};

