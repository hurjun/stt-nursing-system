import type { ReactNode } from 'react';
import { Box, Card, Divider, Stack, Typography, type SxProps, type Theme } from '@mui/material';

interface SectionCardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  sx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
  disableContentPadding?: boolean;
}

/** Card with a titled header, divider and padded content region. */
export function SectionCard({
  title,
  subtitle,
  icon,
  action,
  children,
  sx,
  contentSx,
  disableContentPadding,
}: SectionCardProps) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', ...sx }}>
      {(title || action) && (
        <>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            sx={{ px: 2.5, py: 1.75 }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
              {icon && <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>}
              <Box sx={{ minWidth: 0 }}>
                {title && (
                  <Typography variant="subtitle1" fontWeight={700} noWrap>
                    {title}
                  </Typography>
                )}
                {subtitle && (
                  <Typography variant="caption" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Stack>
            {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
          </Stack>
          <Divider />
        </>
      )}
      <Box sx={{ p: disableContentPadding ? 0 : 2.5, flexGrow: 1, ...contentSx }}>{children}</Box>
    </Card>
  );
}
