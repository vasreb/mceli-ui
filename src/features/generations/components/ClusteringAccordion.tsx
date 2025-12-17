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
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import type { GenerationFormData } from '../types';

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
              />
            )}
          />
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
          <Box>
            <Typography variant="body2" gutterBottom>
              Threshold: {threshold?.toFixed(2) || '0.70'}
            </Typography>
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

