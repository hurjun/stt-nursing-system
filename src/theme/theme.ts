import { alpha, createTheme, type Theme } from '@mui/material/styles';
import { brand, teal } from './tokens';

export type ColorMode = 'light' | 'dark';

const fontFamily = ['Inter', 'Noto Sans KR', 'system-ui', 'Segoe UI', 'sans-serif'].join(',');

/**
 * Builds the MediVoice theme for a given color mode. The two modes share the
 * same typographic and shape language; only surface and text colors change.
 */
export function getTheme(mode: ColorMode): Theme {
  const isLight = mode === 'light';

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: isLight ? brand[600] : brand[400],
        light: brand[400],
        dark: brand[700],
        contrastText: '#ffffff',
      },
      secondary: {
        main: isLight ? teal[500] : teal[400],
        contrastText: '#ffffff',
      },
      success: { main: isLight ? '#1F9254' : '#34D399' },
      warning: { main: isLight ? '#C77700' : '#FBBF24' },
      error: { main: isLight ? '#D32F2F' : '#F87171' },
      info: { main: isLight ? '#0288D1' : '#38BDF8' },
      background: {
        default: isLight ? '#F4F6FA' : '#0A1120',
        paper: isLight ? '#FFFFFF' : '#111B2E',
      },
      text: {
        primary: isLight ? '#15233B' : '#E6EDF7',
        secondary: isLight ? '#5A6B85' : '#9FB0C9',
      },
      divider: isLight ? 'rgba(15,28,48,0.10)' : 'rgba(148,170,200,0.16)',
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily,
      h1: { fontWeight: 800, letterSpacing: '-0.02em' },
      h2: { fontWeight: 800, letterSpacing: '-0.02em' },
      h3: { fontWeight: 700, letterSpacing: '-0.015em' },
      h4: { fontWeight: 700, letterSpacing: '-0.01em' },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none' },
      overline: { fontWeight: 700, letterSpacing: '0.08em' },
    },
  });

  return createTheme(theme, {
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: theme.palette.background.default },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: isLight
              ? '0 1px 2px rgba(16,30,54,0.04), 0 8px 24px -16px rgba(16,30,54,0.20)'
              : '0 1px 2px rgba(0,0,0,0.4)',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 10, paddingInline: 16 },
          sizeLarge: { paddingBlock: 10 },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600 },
          sizeSmall: { fontSize: '0.72rem' },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: alpha('#15233B', 0.94),
            fontSize: '0.75rem',
            borderRadius: 8,
            padding: '6px 10px',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            '&.Mui-selected': {
              backgroundColor: alpha(theme.palette.primary.main, isLight ? 0.1 : 0.2),
              '&:hover': { backgroundColor: alpha(theme.palette.primary.main, isLight ? 0.14 : 0.26) },
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: theme.palette.divider },
          head: { fontWeight: 700, color: theme.palette.text.secondary },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'inherit' },
        styleOverrides: {
          root: {
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'saturate(180%) blur(8px)',
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: { root: { borderRadius: 999, height: 8 } },
      },
      MuiTab: {
        styleOverrides: { root: { textTransform: 'none', fontWeight: 600, minHeight: 48 } },
      },
    },
  });
}
