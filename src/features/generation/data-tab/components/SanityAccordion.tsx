import { Control, Controller, useWatch } from 'react-hook-form';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormControlLabel,
  Switch,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, HelpOutline as HelpOutlineIcon } from '@mui/icons-material';
import type { GenerationFormData } from '@/features/generation/types';

interface SanityAccordionProps {
  control: Control<GenerationFormData>;
  register: any;
  errors: any;
}

export const SanityAccordion = ({ control, errors }: SanityAccordionProps) => {
  const okOverlapThreshold = useWatch({ control, name: 'sanity.okOverlapThreshold' });

  return (
    <Accordion sx={{ mt: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle2">Sanity</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Controller
            name="sanity.minRootResults"
            control={control}
            rules={{ required: true, min: 1 }}
            render={({ field }) => (
              <TextField
                fullWidth
                label="Min Root Results"
                type="number"
                {...field}
                value={field.value ?? ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : Number(e.target.value);
                  field.onChange(value);
                }}
                error={!!errors.sanity?.minRootResults}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Минимальное число результатов в SERP(root), чтобы root оценивался; иначе BAD.">
                        <HelpOutlineIcon fontSize="small" sx={{ cursor: 'help' }} />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" gutterBottom>
              OK Overlap Threshold: {okOverlapThreshold?.toFixed(2) || '0.30'}
            </Typography>
              <Tooltip title="Порог overlap = |SERP(root) ∩ SERP(base)| / |SERP(root)|; выше — OK, иначе MIXED/BAD.">
                <HelpOutlineIcon fontSize="small" sx={{ cursor: 'help' }} />
              </Tooltip>
            </Box>
            <Controller
              name="sanity.okOverlapThreshold"
              control={control}
              render={({ field }) => (
                <Slider
                  {...field}
                  value={field.value ?? 0}
                  onChange={(_, value) => field.onChange(value)}
                  min={0}
                  max={1}
                  step={0.01}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => value.toFixed(2)}
                />
              )}
            />
          </Box>
          <FormControlLabel
            control={
              <Controller
                name="sanity.zeroOverlapIsBad"
                control={control}
                render={({ field }) => (
                  <Switch {...field} checked={field.value} />
                )}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                Zero Overlap is Bad
                <Tooltip title="Если включено, overlap = 0 сразу помечает root как BAD.">
                  <HelpOutlineIcon fontSize="small" sx={{ cursor: 'help' }} />
                </Tooltip>
              </Box>
            }
          />
          <FormControlLabel
            control={
              <Controller
                name="sanity.dedup"
                control={control}
                render={({ field }) => (
                  <Switch {...field} checked={field.value} />
                )}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                Dedup
                <Tooltip title="Если включено, перед расчётом overlap удаляем дубликаты app_id.">
                  <HelpOutlineIcon fontSize="small" sx={{ cursor: 'help' }} />
                </Tooltip>
              </Box>
            }
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" gutterBottom sx={{ mb: 0 }}>
              One Word Policy
            </Typography>
              <Tooltip title="Правила для однословных root’ов; FORCE_MIXED запрещает OK даже при большом overlap.">
              <HelpOutlineIcon fontSize="small" sx={{ cursor: 'help' }} />
            </Tooltip>
          </Box>
          <FormControl fullWidth>
            <InputLabel>One Word Policy</InputLabel>
            <Controller
              name="sanity.oneWordPolicy"
              control={control}
              render={({ field }) => (
                            <Select {...field} label="One Word Policy">
                              <MenuItem value="FORCE_MIXED">Force Mixed</MenuItem>
                              <MenuItem value="WARN">Warn</MenuItem>
                              <MenuItem value="ERROR">Error</MenuItem>
                              <MenuItem value="IGNORE">Ignore</MenuItem>
                            </Select>
              )}
            />
          </FormControl>
          <Controller
            name="sanity.serpTopK"
            control={control}
            rules={{ required: true, min: 1 }}
            render={({ field }) => (
              <TextField
                fullWidth
                label="SERP Top K"
                type="number"
                {...field}
                value={field.value ?? ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : Number(e.target.value);
                  field.onChange(value);
                }}
                error={!!errors.sanity?.serpTopK}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Сколько app_id из SERP использовать при расчёте overlap в sanity (если отличается от общего serpTopK).">
                        <HelpOutlineIcon fontSize="small" sx={{ cursor: 'help' }} />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

