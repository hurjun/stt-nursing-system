import type { ReactNode } from 'react';
import { Box, Card, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { toneColor, type Tone } from './tone';

interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  unit?: string;
  icon?: ReactNode;
  tone?: Tone;
  caption?: ReactNode;
  delta?: { label: string; direction: 'up' | 'down' | 'flat'; good?: boolean };
}

/** Compact KPI tile used across the dashboard and research screens. */
export function StatCard({ label, value, unit, icon, tone = 'info', caption, delta }: StatCardProps) {
  const DeltaIcon =
    delta?.direction === 'up'
      ? TrendingUpIcon
      : delta?.direction === 'down'
        ? TrendingDownIcon
        : TrendingFlatIcon;

  return (
    <Card sx={{ p: 2.5, height: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
        {icon && (
          <Box
            sx={(theme) => ({
              display: 'grid',
              placeItems: 'center',
              width: 38,
              height: 38,
              borderRadius: 2,
              color: toneColor(theme, tone),
              bgcolor: alpha(toneColor(theme, tone), 0.12),
            })}
          >
            {icon}
          </Box>
        )}
      </Stack>
      <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ mt: 1 }}>
        <Typography variant="h4" fontWeight={800} className="tnum">
          {value}
        </Typography>
        {unit && (
          <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
            {unit}
          </Typography>
        )}
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
        {delta && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.25}
            sx={{
              color: delta.good === false ? 'error.main' : 'success.main',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
          >
            <DeltaIcon sx={{ fontSize: 16 }} />
            <span>{delta.label}</span>
          </Stack>
        )}
        {caption && (
          <Typography variant="caption" color="text.secondary">
            {caption}
          </Typography>
        )}
      </Stack>
    </Card>
  );
}
