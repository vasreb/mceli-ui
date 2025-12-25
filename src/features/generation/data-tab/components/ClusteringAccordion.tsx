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
  InputAdornment,
  Tooltip,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, HelpOutline as HelpOutlineIcon } from '@mui/icons-material';
import type { GenerationFormData } from '@/features/generation/types';

interface ClusteringAccordionProps {
  control: Control<GenerationFormData>;
  register: any;
  errors: any;
}

export const ClusteringAccordion = ({ control, errors }: ClusteringAccordionProps) => {
  const threshold = useWatch({ control, name: 'clustering.threshold' });

  return (
    <Accordion sx={{ mt: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle2">Clustering</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Controller
            name="clustering.serpTopK"
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
                error={!!errors.clustering?.serpTopK}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Сколько app_id из SERP использовать для кластеризации root’ов; больше K → устойчивее, меньше → быстрее.">
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
              <Typography variant="body2" gutterBottom sx={{ mb: 0 }}>
                Inclusion Rule
              </Typography>
              <Tooltip title="Какие root’ы допускаются к кластеризации (OK_ONLY — только OK).">
                <HelpOutlineIcon fontSize="small" sx={{ cursor: 'help' }} />
              </Tooltip>
            </Box>
          <FormControl fullWidth>
            <InputLabel>Inclusion Rule</InputLabel>
            <Controller
              name="clustering.inclusionRule"
              control={control}
              render={({ field }) => (
                            <Select {...field} label="Inclusion Rule">
                              <MenuItem value="OK_ONLY">OK Only</MenuItem>
                              <MenuItem value="OK_AND_MIXED">OK and Mixed</MenuItem>
                              <MenuItem value="ALL">All</MenuItem>
                            </Select>
              )}
            />
          </FormControl>
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" gutterBottom>
              Threshold: {threshold?.toFixed(2) || '0.70'}
            </Typography>
              <Tooltip title="Порог сходства root’ов (Jaccard) для добавления ребра; выше — больше дробление, ниже — склейка.">
                <HelpOutlineIcon fontSize="small" sx={{ cursor: 'help' }} />
              </Tooltip>
            </Box>
            <Controller
              name="clustering.threshold"
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
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

