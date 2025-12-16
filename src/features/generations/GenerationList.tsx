import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from '@tanstack/react-router';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { generationListStore } from './stores/generationListStore';
import styles from './GenerationList.module.scss';

export const GenerationList = observer(() => {
  const navigate = useNavigate();
  const { generations, isLoading, error } = generationListStore;

  useEffect(() => {
    generationListStore.loadGenerations();
  }, []);

  const handleCreate = () => {
    navigate({ to: '/generations/create' });
  };

  const handleEdit = (uuid: string) => {
    navigate({ to: '/generations/$uuid', params: { uuid } });
  };

  const handleDelete = async (uuid: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту генерацию?')) {
      await generationListStore.deleteGeneration(uuid);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" className={styles.container}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Список генераций
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Создать
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Дата создания</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {generations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      Нет генераций
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                generations.map((generation) => (
                  <TableRow key={generation.uuid} hover>
                    <TableCell>{generation.name}</TableCell>
                    <TableCell>{generation.description}</TableCell>
                    <TableCell>
                      {new Date(generation.createdAt).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(generation.uuid)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(generation.uuid)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
});

