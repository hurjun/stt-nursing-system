import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ py: 6, px: 3, textAlign: 'center' }}>
      {icon && (
        <Box
          sx={{
            display: 'grid',
            placeItems: 'center',
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'action.hover',
            color: 'text.secondary',
          }}
        >
          {icon}
        </Box>
      )}
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380 }}>
          {description}
        </Typography>
      )}
      {action}
    </Stack>
  );
}
