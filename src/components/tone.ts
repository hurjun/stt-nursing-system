import type { Theme } from '@mui/material/styles';

export type Tone = 'normal' | 'low' | 'high' | 'critical' | 'info' | 'neutral';

/** Maps a semantic clinical tone to a theme palette color. */
export function toneColor(theme: Theme, tone: Tone): string {
  switch (tone) {
    case 'normal':
      return theme.palette.success.main;
    case 'low':
      return theme.palette.info.main;
    case 'high':
      return theme.palette.warning.main;
    case 'critical':
      return theme.palette.error.main;
    case 'info':
      return theme.palette.info.main;
    default:
      return theme.palette.text.secondary;
  }
}
