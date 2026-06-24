import {
  AppBar,
  Badge,
  Box,
  IconButton,
  InputBase,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useColorMode } from '@/theme/ColorModeProvider';
import { useLang, useScopedT } from '@/i18n/I18nProvider';
import { commonDict } from '@/i18n/common.i18n';
import { PatientAvatar } from '@/components/PatientAvatar';

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { mode, toggle } = useColorMode();
  const { lang, setLang } = useLang();
  const t = useScopedT(commonDict);

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ gap: 1 }}>
        <IconButton edge="start" onClick={onMenuClick} sx={{ display: { md: 'none' } }} aria-label="menu">
          <MenuRoundedIcon />
        </IconButton>

        <Box
          sx={(theme) => ({
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            height: 40,
            width: 360,
            maxWidth: '40vw',
            borderRadius: 2,
            bgcolor: alpha(theme.palette.text.primary, 0.04),
            border: `1px solid ${theme.palette.divider}`,
          })}
        >
          <SearchRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          <InputBase placeholder={t('searchPlaceholder')} sx={{ flex: 1, fontSize: '0.875rem' }} />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <ToggleButtonGroup
          size="small"
          exclusive
          value={lang}
          onChange={(_, value) => value && setLang(value)}
          aria-label={t('language')}
          sx={{ mr: 0.5, '& .MuiToggleButton-root': { px: 1.25, py: 0.4, fontSize: '0.72rem', fontWeight: 700 } }}
        >
          <ToggleButton value="en">EN</ToggleButton>
          <ToggleButton value="ko">한국어</ToggleButton>
        </ToggleButtonGroup>

        <Tooltip title={mode === 'light' ? t('darkMode') : t('lightMode')}>
          <IconButton onClick={toggle} aria-label="toggle theme">
            {mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Notifications">
          <IconButton aria-label="notifications">
            <Badge color="error" variant="dot">
              <NotificationsNoneRoundedIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <Stack direction="row" alignItems="center" sx={{ ml: 0.5 }}>
          <PatientAvatar initials="HJ" acuity="stable" size={36} />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
