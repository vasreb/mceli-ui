import { Box, Container, Typography } from '@mui/material';
import { ExampleTable } from '../simple-components/ExampleTable';
import styles from './HomePage.module.scss';

export function HomePage() {
  return (
    <Container maxWidth="lg" className={styles.container}>
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          MCELI UI
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Добро пожаловать! Это базовый проект на стеке TypeScript, React, TanStack Table, 
          MobX, TanStack Router, RSBuild, SCSS Modules, React Hook Form, Material UI 5.
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Пример таблицы (TanStack Table)
          </Typography>
          <ExampleTable />
        </Box>
      </Box>
    </Container>
  );
}

