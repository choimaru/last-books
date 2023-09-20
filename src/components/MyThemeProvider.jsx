import React from 'react';
import { CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { createTheme } from '@material-ui/core/styles';

export default function MyThemeProvider({ children }) {
  const theme = createTheme({});

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
