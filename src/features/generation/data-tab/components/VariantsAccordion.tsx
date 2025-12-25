import { Control, Controller } from 'react-hook-form';
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
  InputAdornment,
  Tooltip,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, HelpOutline as HelpOutlineIcon } from '@mui/icons-material';
import type { GenerationFormData } from '@/features/generation/types';

interface VariantsAccordionProps {
  control: Control<GenerationFormData>;
  errors: any;
}

export const VariantsAccordion = ({ control, errors }: VariantsAccordionProps) => {
  return (
    <Accordion sx={{ mt: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle2">Variants</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" gutterBottom sx={{ mb: 0 }}>
              Inclusion Rule
            </Typography>
            <Tooltip title="Какие root’ы допускаются к генерации variants. OK_ONLY — только OK, MIXED/BAD не тратят бюджет.">
              <HelpOutlineIcon fontSize="small" sx={{ cursor: 'help' }} />
            </Tooltip>
          </Box>
          <FormControl fullWidth>
            <InputLabel>Inclusion Rule</InputLabel>
            <Controller
              name="variants.inclusionRule"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Inclusion Rule"
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const value = e.target.value as string;
                    field.onChange(value === '' ? undefined : value as GenerationFormData['variants']['inclusionRule']);
                  }}
                >
                  <MenuItem value="">Use default</MenuItem>
                  <MenuItem value="OK_ONLY">OK Only</MenuItem>
                  <MenuItem value="OK_AND_MIXED">OK and Mixed</MenuItem>
                  <MenuItem value="ALL">All</MenuItem>
                </Select>
              )}
            />
          </FormControl>
          <Controller
            name="variants.ttlDays"
            control={control}
            rules={{ min: 1 }}
            render={({ field }) => (
              <TextField
                fullWidth
                label="TTL Days"
                type="number"
                {...field}
                value={field.value ?? ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : Number(e.target.value);
                  field.onChange(value);
                }}
                error={!!errors.variants?.ttlDays}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="TTL (в днях) для сохранённых variants: пока не истёк, не генерируем заново.">
                        <HelpOutlineIcon fontSize="small" sx={{ cursor: 'help' }} />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
          <FormControlLabel
            control={
              <Controller
                name="variants.autosuggestions"
                control={control}
                render={({ field }) => <Switch {...field} checked={field.value ?? false} />}
              />
            }
            label="Autosuggestions"
          />
          <FormControlLabel
            control={
              <Controller
                name="variants.similar"
                control={control}
                render={({ field }) => <Switch {...field} checked={field.value ?? false} />}
              />
            }
            label="Similar"
          />
          <FormControlLabel
            control={
              <Controller
                name="variants.questions"
                control={control}
                render={({ field }) => <Switch {...field} checked={field.value ?? false} />}
              />
            }
            label="Questions"
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

