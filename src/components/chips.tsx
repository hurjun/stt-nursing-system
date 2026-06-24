import { Chip, type ChipProps } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { acuityColor } from '@/theme/tokens';
import { LAB_FLAG_META } from '@/lib/clinical';
import type { Acuity, LabFlag } from '@/types/clinical';

const toneToPalette: Record<string, ChipProps['color']> = {
  normal: 'success',
  low: 'info',
  high: 'warning',
  critical: 'error',
};

export function AcuityChip({ acuity, size = 'small' }: { acuity: Acuity; size?: ChipProps['size'] }) {
  const color = acuityColor[acuity];
  return (
    <Chip
      size={size}
      label={acuity}
      sx={{
        textTransform: 'capitalize',
        color,
        bgcolor: alpha(color, 0.14),
        fontWeight: 700,
      }}
    />
  );
}

export function LabFlagChip({ flag, size = 'small' }: { flag: LabFlag; size?: ChipProps['size'] }) {
  if (flag === 'N') return null;
  const meta = LAB_FLAG_META[flag];
  return <Chip size={size} variant="outlined" color={toneToPalette[meta.tone]} label={flag} />;
}

const FLAG_COLORS: Array<{ test: RegExp; color: ChipProps['color'] }> = [
  { test: /fall|injury|alert/i, color: 'warning' },
  { test: /dnr|dni/i, color: 'error' },
  { test: /isolation|allerg/i, color: 'info' },
  { test: /npo/i, color: 'secondary' },
];

export function FlagChip({ label, size = 'small' }: { label: string; size?: ChipProps['size'] }) {
  const match = FLAG_COLORS.find((f) => f.test.test(label));
  return <Chip size={size} variant="outlined" color={match?.color ?? 'default'} label={label} />;
}

export function PriorityChip({
  priority,
  size = 'small',
}: {
  priority: 'high' | 'medium' | 'low' | 'urgent' | 'important' | 'routine';
  size?: ChipProps['size'];
}) {
  const color: ChipProps['color'] =
    priority === 'high' || priority === 'urgent'
      ? 'error'
      : priority === 'medium' || priority === 'important'
        ? 'warning'
        : 'default';
  return <Chip size={size} variant="outlined" color={color} label={priority} sx={{ textTransform: 'capitalize' }} />;
}
