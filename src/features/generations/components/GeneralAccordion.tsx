import { Control, Controller } from 'react-hook-form';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import type { GenerationFormData } from '../types';

interface GeneralAccordionProps {
  control: Control<GenerationFormData>;
  register: any;
  errors: any;
}

export const GeneralAccordion = ({ control, register, errors }: GeneralAccordionProps) => {
  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle2">General</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Locale"
            {...register('locale')}
            disabled
          />
          <Controller
            name="serpSnapshotMaxAgeDays"
            control={control}
            rules={{ required: true, min: 1 }}
            render={({ field }) => (
              <TextField
                fullWidth
                label="SERP Snapshot Max Age (days)"
                type="number"
                {...field}
                value={field.value ?? ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : Number(e.target.value);
                  field.onChange(value);
                }}
                error={!!errors.serpSnapshotMaxAgeDays}
              />
            )}
          />
          <Controller
            name="serpTopK"
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
                error={!!errors.serpTopK}
              />
            )}
          />
          <Controller
            name="ngramMinCount"
            control={control}
            rules={{ required: true, min: 1 }}
            render={({ field }) => (
              <TextField
                fullWidth
                label="N-gram Min Count"
                type="number"
                {...field}
                value={field.value ?? ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : Number(e.target.value);
                  field.onChange(value);
                }}
                error={!!errors.ngramMinCount}
              />
            )}
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

