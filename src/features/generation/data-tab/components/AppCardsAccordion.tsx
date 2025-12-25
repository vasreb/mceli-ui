import { Control, Controller } from 'react-hook-form';
import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Box } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import type { GenerationFormData } from '@/features/generation/types';

interface AppCardsAccordionProps {
  control: Control<GenerationFormData>;
}

export const AppCardsAccordion = ({ control }: AppCardsAccordionProps) => (
  <Accordion sx={{ mt: 2 }}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="subtitle2">App Cards</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Controller
          name="appCards.ttlDays"
          control={control}
          render={({ field }) => (
            <TextField
              fullWidth
              label="TTL Days"
              type="number"
              {...field}
              value={field.value ?? ''}
              onChange={(event) => {
                const value = event.target.value === '' ? undefined : Number(event.target.value);
                field.onChange(value);
              }}
            />
          )}
        />
      </Box>
    </AccordionDetails>
  </Accordion>
);

