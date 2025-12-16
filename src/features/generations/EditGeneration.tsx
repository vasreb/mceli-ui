import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, useParams, useRouterState } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { editGenerationStore } from './stores/editGenerationStore';
import styles from './EditGeneration.module.scss';

interface GenerationFormData {
  name: string;
  description: string;
}

export const EditGeneration = observer(() => {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const params = useParams({ strict: false });
  const uuid = (params as any)?.uuid;
  const isCreate = routerState.location.pathname === '/generations/create' || !uuid;
  const { generation, isLoading, error, isSaving } = editGenerationStore;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GenerationFormData>({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (!isCreate && uuid) {
      editGenerationStore.loadGeneration(uuid);
    }
    return () => {
      editGenerationStore.reset();
    };
  }, [uuid, isCreate]);

  useEffect(() => {
    if (generation && !isCreate) {
      reset({
        name: generation.name,
        description: generation.description,
      });
    }
  }, [generation, isCreate, reset]);

  const onSubmit = async (data: GenerationFormData) => {
    try {
      if (isCreate) {
        const uuid = await editGenerationStore.createGeneration({
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        navigate({ to: '/generations/$uuid', params: { uuid } });
      } else {
        if (generation) {
          editGenerationStore.updateField('name', data.name);
          editGenerationStore.updateField('description', data.description);
          await editGenerationStore.saveGeneration();
          navigate({ to: '/generations' });
        }
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  const handleCancel = () => {
    navigate({ to: '/generations' });
  };

  if (isLoading && !isCreate) {
    return (
      <Container maxWidth="md" className={styles.container}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" className={styles.container}>
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isCreate ? 'Создание генерации' : 'Редактирование генерации'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={2}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 3 }}>
            <TextField
              fullWidth
              label="Название"
              {...register('name', { required: 'Название обязательно' })}
              error={!!errors.name}
              helperText={errors.name?.message}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Описание"
              multiline
              rows={4}
              {...register('description', { required: 'Описание обязательно' })}
              error={!!errors.description}
              helperText={errors.description?.message}
              margin="normal"
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isSaving}
              >
                {isSaving ? <CircularProgress size={24} /> : isCreate ? 'Создать' : 'Сохранить'}
              </Button>
              <Button variant="outlined" onClick={handleCancel}>
                Отмена
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
});

