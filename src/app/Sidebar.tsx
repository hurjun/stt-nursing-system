import { Box, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import { NAV_SECTIONS } from './navigation';
import { useLang, useScopedT } from '@/i18n/I18nProvider';
import { commonDict } from '@/i18n/common.i18n';
import { useCurrentNurse } from '@/store/useAppStore';
import { PatientAvatar } from '@/components/PatientAvatar';

function isActivePath(pathname: string, path: string): boolean {
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const t = useScopedT(commonDict);
  const { lang } = useLang();
  const { pathname } = useLocation();
  const nurse = useCurrentNurse();

  return (
    <Stack sx={{ height: '100%' }}>
      {/* Brand */}
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ px: 2.5, py: 2.25 }}>
        <Box
          sx={{
            display: 'grid',
            placeItems: 'center',
            width: 40,
            height: 40,
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, #1284FF, #0B6BCB)',
            color: '#fff',
            boxShadow: '0 6px 16px -6px rgba(11,107,203,0.7)',
          }}
        >
          <GraphicEqRoundedIcon />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={800} lineHeight={1.1}>
            {t('appName')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('appTagline')}
          </Typography>
        </Box>
      </Stack>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1.5, py: 1 }}>
        {NAV_SECTIONS.map((section) => (
          <Box key={section.titleKey} sx={{ mb: 1.5 }}>
            <Typography
              variant="overline"
              sx={{ px: 1.5, color: 'text.secondary', fontSize: '0.66rem', letterSpacing: '0.09em' }}
            >
              {t(section.titleKey)}
            </Typography>
            <List dense disablePadding sx={{ mt: 0.5 }}>
              {section.items.map((item) => {
                const active = isActivePath(pathname, item.path);
                const Icon = item.icon;
                return (
                  <ListItemButton
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    selected={active}
                    onClick={onNavigate}
                    sx={{ mb: 0.25, py: 0.9 }}
                  >
                    <ListItemIcon sx={{ minWidth: 38, color: active ? 'primary.main' : 'text.secondary' }}>
                      <Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={t(item.labelKey)}
                      primaryTypographyProps={{
                        fontWeight: active ? 700 : 500,
                        color: active ? 'primary.main' : 'text.primary',
                        fontSize: '0.875rem',
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Nurse profile */}
      <Box sx={{ p: 1.5 }}>
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          sx={(theme) => ({
            p: 1.25,
            borderRadius: 2.5,
            bgcolor: alpha(theme.palette.primary.main, 0.06),
            border: `1px solid ${theme.palette.divider}`,
          })}
        >
          <PatientAvatar initials="HJ" acuity="stable" size={38} showStatusDot />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {lang === 'ko' ? nurse.nameKo : nurse.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {lang === 'ko' ? nurse.unit.ko : nurse.unit.en}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
