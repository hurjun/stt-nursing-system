import { Avatar, Badge } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { acuityColor } from '@/theme/tokens';
import type { Acuity } from '@/types/clinical';

interface PatientAvatarProps {
  initials: string;
  acuity: Acuity;
  size?: number;
  showStatusDot?: boolean;
}

/** Initial-based avatar with an acuity-colored ring (and optional status dot). */
export function PatientAvatar({ initials, acuity, size = 40, showStatusDot }: PatientAvatarProps) {
  const color = acuityColor[acuity];
  const avatar = (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor: alpha(color, 0.16),
        color,
        fontWeight: 700,
        fontSize: size * 0.36,
        border: `2px solid ${alpha(color, 0.5)}`,
      }}
    >
      {initials}
    </Avatar>
  );

  if (!showStatusDot) return avatar;

  return (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      badgeContent={
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: color,
            border: '2px solid white',
            display: 'block',
          }}
        />
      }
    >
      {avatar}
    </Badge>
  );
}
