/**
 * Xingu — MUI theme (official)
 *
 * Single source of truth for product code. Mirrors `colors_and_type.css`
 * exactly — same hues, same scale, same shadows. Drop into either:
 *   - xingu-charging/console (replaces src/theme/themePrimitives.ts colors)
 *   - xingu-charging/app     (replaces the `ev` block + createBrandedTheme defaults)
 *
 * Hue rationale:
 *   229° (deep indigo blue) — connector-face logo color (#0125C6) — primary
 *   28°  (warm orange) — accent / hero / energy moments — secondary
 *   220° (cool gray) — neutrals, harmonised with brand hue
 */

import { createTheme, type ThemeOptions, type Theme } from '@mui/material/styles';

// ───────── Brand ramps ─────────────────────────────────────────────────
export const brand = {
  50:  'hsl(229, 100%, 96%)',
  100: 'hsl(229, 100%, 92%)',
  200: 'hsl(229,  95%, 82%)',
  300: 'hsl(229,  90%, 68%)',
  400: 'hsl(229,  95%, 50%)',
  500: 'hsl(229,  99%, 39%)',  // CONNECTOR FACE · primary.main
  600: 'hsl(229, 100%, 33%)',
  700: 'hsl(229, 100%, 27%)',
  800: 'hsl(229, 100%, 19%)',
  900: 'hsl(229, 100%, 12%)',
} as const;

export const accent = {
  50:  'hsl(28, 100%, 96%)',
  100: 'hsl(28, 100%, 90%)',
  200: 'hsl(28,  95%, 78%)',
  300: 'hsl(28,  92%, 67%)',
  400: 'hsl(28,  88%, 56%)',   // accent.main — used SPARINGLY
  500: 'hsl(28,  80%, 47%)',
  600: 'hsl(28,  80%, 38%)',
  700: 'hsl(28,  80%, 30%)',
  800: 'hsl(28,  80%, 22%)',
  900: 'hsl(28,  80%, 14%)',
} as const;

export const gray = {
  50:  'hsl(220, 35%, 97%)',
  100: 'hsl(220, 30%, 94%)',
  200: 'hsl(220, 20%, 88%)',
  300: 'hsl(220, 20%, 80%)',
  400: 'hsl(220, 20%, 65%)',
  500: 'hsl(220, 20%, 42%)',
  600: 'hsl(220, 20%, 35%)',
  700: 'hsl(220, 20%, 25%)',
  800: 'hsl(220, 30%,  6%)',
  900: 'hsl(220, 35%,  3%)',
} as const;

export const green = { 50:'hsl(152,80%,96%)', 200:'hsl(152,70%,80%)', 400:'hsl(152,65%,42%)', 500:'hsl(152,70%,32%)', 800:'hsl(152,80%,12%)' };
export const amber = { 50:'hsl(45,100%,97%)', 200:'hsl(45,94%,80%)',  400:'hsl(45,90%,45%)',  500:'hsl(45,90%,38%)',  800:'hsl(45,95%,16%)' };
export const red   = { 50:'hsl(0,100%,97%)',  100:'hsl(0,92%,90%)',   400:'hsl(0,90%,50%)',   500:'hsl(0,90%,38%)',   800:'hsl(0,95%,14%)' };

// ───────── Module augmentation ─────────────────────────────────────────
declare module '@mui/material/styles' {
  interface Palette {
    accent: Palette['primary'];
    brand: typeof brand;
    connector: { available: string; charging: string; occupied: string; unavailable: string; faulted: string };
  }
  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
    brand?: typeof brand;
    connector?: { available: string; charging: string; occupied: string; unavailable: string; faulted: string };
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    accent: true;
  }
}

// ───────── Theme builder ───────────────────────────────────────────────
export function createXinguTheme(overrides: ThemeOptions = {}): Theme {
  return createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: brand[500],         // #0125C6 — connector face
        light: brand[300],
        dark: brand[700],
        contrastText: '#ffffff',
      },
      accent: {
        main: accent[400],        // orange — sparingly
        light: accent[300],
        dark: accent[600],
        contrastText: '#ffffff',
      },
      secondary: {
        main: gray[700],
        light: gray[500],
        dark: gray[800],
        contrastText: '#ffffff',
      },
      error:   { main: red[400],   light: red[100],   dark: red[800] },
      warning: { main: amber[400], light: amber[200], dark: amber[800] },
      success: { main: green[400], light: green[200], dark: green[800] },
      info:    { main: brand[300], light: brand[100], dark: brand[700] },
      grey: gray as unknown as Record<string, string>,
      brand,
      connector: {
        available:   green[400],
        charging:    brand[400],
        occupied:    amber[400],
        unavailable: gray[400],
        faulted:     red[400],
      },
      background: {
        default: 'hsl(0, 0%, 99%)',
        paper:   gray[50],
      },
      text: {
        primary:   gray[800],
        secondary: gray[600],
        disabled:  gray[400],
      },
      divider: 'hsla(220, 20%, 80%, 0.4)',
      action: {
        hover:    'hsla(220, 20%, 88%, 0.20)',
        selected: 'hsla(220, 20%, 88%, 0.30)',
        focus:    'hsla(229, 99%, 39%, 0.30)',
      },
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: { fontSize: '3rem',     fontWeight: 600, lineHeight: 1.1,  letterSpacing: '-0.02em' },
      h2: { fontSize: '2.25rem',  fontWeight: 600, lineHeight: 1.15, letterSpacing: '-0.015em' },
      h3: { fontSize: '1.875rem', fontWeight: 600, lineHeight: 1.2 },
      h4: { fontSize: '1.5rem',   fontWeight: 600, lineHeight: 1.3 },
      h5: { fontSize: '1.25rem',  fontWeight: 600 },
      h6: { fontSize: '1.125rem', fontWeight: 600 },
      subtitle1: { fontSize: '1.125rem' },
      subtitle2: { fontSize: '0.875rem', fontWeight: 500 },
      body1: { fontSize: '0.875rem' },
      body2: { fontSize: '0.8125rem' },
      caption: { fontSize: '0.75rem' },
      button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: { borderRadius: 8 },
    shadows: [
      'none',
      'hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px',
      // …MUI requires 25 entries; populate the rest with the same base shadow.
      ...(Array(23).fill('hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px') as any),
    ] as any,
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
            textTransform: 'none',
          },
          containedPrimary: {
            background: `linear-gradient(to bottom, ${brand[400]}, ${brand[600]})`,
            border: `1px solid ${brand[700]}`,
            boxShadow: `inset 0 1px 0 hsla(229, 90%, 60%, 0.4), inset 0 -1px 0 1px hsla(229, 100%, 12%, 0.5)`,
            '&:hover': {
              background: `linear-gradient(to bottom, ${brand[500]}, ${brand[700]})`,
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: brand[500],
              boxShadow: `0 0 0 3px hsla(229, 99%, 39%, 0.3)`,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: 'none',
            border: `1px solid hsla(220, 20%, 80%, 0.4)`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 999, fontWeight: 500 },
        },
      },
    },
    ...overrides,
  });
}

export default createXinguTheme();
