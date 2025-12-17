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
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import type { GenerationFormData } from '../types';

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
              />
            )}
          />
          <Box>
            <Typography variant="body2" gutterBottom>
              OK Overlap Threshold: {okOverlapThreshold?.toFixed(2) || '0.30'}
            </Typography>
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
            label="Zero Overlap is Bad"
          />
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
              />
            )}
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

