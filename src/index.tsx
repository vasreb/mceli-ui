import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './routes';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="bottom-right" />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);

