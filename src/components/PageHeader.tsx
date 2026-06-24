import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
}

/** Consistent page title block with an optional action area on the right. */
export function PageHeader({ title, subtitle, icon, actions }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      gap={2}
      sx={{ mb: 3 }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        {icon && (
          <Box
            sx={{
              display: 'grid',
              placeItems: 'center',
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            {icon}
          </Box>
        )}
        <Box>
          <Typography variant="h4" fontWeight={800}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
      {actions && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}
