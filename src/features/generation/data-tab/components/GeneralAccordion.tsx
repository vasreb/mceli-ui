import { Control, Controller } from 'react-hook-form';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, HelpOutline as HelpOutlineIcon } from '@mui/icons-material';
import type { GenerationFormData } from '@/features/generation/types';

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
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Максимальный возраст SERP-снимка (в днях), который можно переиспользовать из БД. Если старше — делаем новый запрос в Google Play.">
                          <HelpOutlineIcon fontSize="small" sx={{ cursor: 'help' }} />
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
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
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Сколько первых приложений брать из SERP (топ-K) при сохранении снимка. Чем больше — тем стабильнее оценки, но дороже.">
                          <HelpOutlineIcon fontSize="small" sx={{ cursor: 'help' }} />
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
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
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Минимальное число появлений n-граммы в тексте/корпусе, чтобы считать её кандидатом в root. Меньше — больше шума.">
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

