import { createTheme } from '@mui/material/styles';

/**
 * Vital — V3 "Cinematic" dark theme. Mirrors src/styles/v3.css.
 */

const accent = {
  300: 'hsl(14, 100%, 70%)',
  400: 'hsl(14, 100%, 56%)', // #FF551F — accent.main
  500: 'hsl(14,  95%, 48%)',
  600: 'hsl(13,  92%, 40%)',
};
const brand = {
  300: 'hsl(229, 94%, 68%)',
  400: 'hsl(229, 96%, 50%)',
  700: 'hsl(229, 100%, 27%)',
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: accent[400], light: accent[300], dark: accent[600], contrastText: '#0A0B0F' },
    secondary: { main: brand[400], light: brand[300], dark: brand[700], contrastText: '#fff' },
    error: { main: 'hsl(358, 90%, 38%)' },
    success: { main: 'hsl(120, 58%, 35%)' },
    background: { default: '#0A0B0F', paper: '#14161D' },
    text: {
      primary: '#fff',
      secondary: 'rgba(255,255,255,0.5)',
      disabled: 'rgba(255,255,255,0.25)',
    },
    divider: 'rgba(255,255,255,0.08)',
  },
  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 0.95 },
    h2: { fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1 },
    h3: { fontWeight: 800, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 8, fontWeight: 700 } },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#14161D',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14,
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  },
});

export default theme;
