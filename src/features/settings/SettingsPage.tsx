import { useState } from 'react';
import {
  Box,
  Chip,
  Divider,
  Grid,
  Slider,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  type ChipProps,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import GraphicEqOutlinedIcon from '@mui/icons-material/GraphicEqOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import AccessibilityNewOutlinedIcon from '@mui/icons-material/AccessibilityNewOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { PatientAvatar } from '@/components/PatientAvatar';
import {
  localeOf,
  useBilingual,
  useLang,
  useScopedT,
  type Dictionary,
  type Lang,
} from '@/i18n/I18nProvider';
import { useColorMode } from '@/theme/ColorModeProvider';
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
} from '@/lib/speech';
import { useCurrentNurse } from '@/store/useAppStore';
import { formatNumber } from '@/lib/format';
import type { ColorMode } from '@/theme/theme';
import { RESEARCH_HEADLINES } from '@/data/clinical';

const dict = {
  pageTitle: { en: 'Settings', ko: '설정' },
  pageSubtitle: {
    en: 'Personalize MediVoice for your shift',
    ko: '근무에 맞게 MediVoice를 설정하세요',
  },

  appearance: { en: 'Appearance', ko: '화면 설정' },
  appearanceSub: { en: 'Language and theme', ko: '언어 및 테마' },
  language: { en: 'Language', ko: '언어' },
  languageHint: {
    en: 'Applies to the interface and the bedside speaker locale.',
    ko: '인터페이스와 병상 스피커 로케일에 적용됩니다.',
  },
  theme: { en: 'Theme', ko: '테마' },
  themeHint: {
    en: 'Dark mode reduces glare during night-shift rounds.',
    ko: '다크 모드는 야간 근무 라운딩 시 눈부심을 줄여줍니다.',
  },
  light: { en: 'Light', ko: '라이트' },
  dark: { en: 'Dark', ko: '다크' },

  bedside: { en: 'Bedside interaction', ko: '병상 상호작용' },
  bedsideSub: { en: 'AI speaker and speech recognition', ko: 'AI 스피커 및 음성 인식' },
  sttLocale: { en: 'Speech recognition locale', ko: '음성 인식 로케일' },
  sttLocaleHint: {
    en: 'Follows the interface language. Korean rounds use the ko-KR engine.',
    ko: '인터페이스 언어를 따릅니다. 한국어 라운딩은 ko-KR 엔진을 사용합니다.',
  },
  voiceRate: { en: 'Speaker voice rate', ko: '스피커 음성 속도' },
  voiceRateHint: {
    en: 'How quickly the AI speaker reads prompts to the patient.',
    ko: 'AI 스피커가 환자에게 질문을 읽는 속도입니다.',
  },
  slower: { en: 'Slower', ko: '느리게' },
  faster: { en: 'Faster', ko: '빠르게' },
  interim: { en: 'Show interim results', ko: '실시간 중간 결과 표시' },
  interimHint: {
    en: 'Stream partial transcripts while the patient is still speaking.',
    ko: '환자가 말하는 동안 부분 전사 결과를 실시간으로 표시합니다.',
  },
  capabilities: { en: 'Browser capabilities', ko: '브라우저 지원 현황' },
  recognition: { en: 'Speech recognition', ko: '음성 인식' },
  synthesis: { en: 'Speech synthesis', ko: '음성 합성' },
  available: { en: 'Available', ko: '사용 가능' },
  unavailable: { en: 'Unavailable', ko: '사용 불가' },

  notifications: { en: 'Notifications', ko: '알림' },
  notificationsSub: { en: 'Alerts pushed to this station', ko: '스테이션으로 전송되는 경고' },
  criticalVitals: { en: 'Critical vital signs', ko: '중증 활력징후' },
  criticalVitalsHint: {
    en: 'Alert when a patient crosses a critical vital threshold.',
    ko: '환자의 활력징후가 위험 기준을 초과하면 경고합니다.',
  },
  medsDue: { en: 'Medication due', ko: '투약 시간 도래' },
  medsDueHint: {
    en: 'Remind me as scheduled medications come due on the MAR.',
    ko: 'MAR의 예정된 투약 시간이 되면 알려줍니다.',
  },
  fallRisk: { en: 'Fall-risk alerts', ko: '낙상 위험 경고' },
  fallRiskHint: {
    en: 'Flag patients with a high Morse fall-risk score.',
    ko: 'Morse 낙상 위험 점수가 높은 환자를 표시합니다.',
  },

  profile: { en: 'Profile', ko: '프로필' },
  profileSub: { en: 'Signed-in nurse', ko: '로그인한 간호사' },
  role: { en: 'Role', ko: '직무' },
  unit: { en: 'Unit', ko: '병동' },
  shift: { en: 'Shift', ko: '근무조' },
  license: { en: 'License No.', ko: '면허번호' },
  readOnly: { en: 'Read-only', ko: '읽기 전용' },

  about: { en: 'About', ko: '정보' },
  aboutSub: { en: 'MediVoice NIS', ko: 'MediVoice NIS' },
  tagline: {
    en: 'AI-speaker-based nursing information system',
    ko: 'AI 스피커 기반 간호정보시스템',
  },
  synthetic: {
    en: 'All patient data shown here is synthetic and generated for demonstration only.',
    ko: '여기에 표시된 모든 환자 데이터는 합성 데이터이며 시연 목적으로만 생성되었습니다.',
  },
  researchNote: {
    en: 'Built on the research of',
    ko: '다음 연구를 기반으로 제작되었습니다:',
  },
  version: { en: 'Version', ko: '버전' },
} satisfies Dictionary;

/** One labelled row with a description and a control on the right. */
function SettingRow({
  icon,
  title,
  description,
  control,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  control: React.ReactNode;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={2}
      sx={{ py: 1.75 }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
        {icon && (
          <Box sx={{ color: 'text.secondary', display: 'flex', mt: 0.25 }}>{icon}</Box>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600}>
            {title}
          </Typography>
          {description && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
              {description}
            </Typography>
          )}
        </Box>
      </Stack>
      <Box sx={{ flexShrink: 0 }}>{control}</Box>
    </Stack>
  );
}

/** Read-only profile detail field. */
function ProfileField({ label, value, ko }: { label: string; value: string; ko?: string }) {
  return (
    <Box>
      <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.6 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
      {ko && (
        <Typography variant="caption" color="text.secondary">
          {ko}
        </Typography>
      )}
    </Box>
  );
}

function CapabilityChip({ supported, label }: { supported: boolean; label: string }) {
  const color: ChipProps['color'] = supported ? 'success' : 'default';
  return (
    <Chip
      size="small"
      color={color}
      variant={supported ? 'filled' : 'outlined'}
      icon={
        supported ? (
          <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
        ) : (
          <BlockOutlinedIcon sx={{ fontSize: 16 }} />
        )
      }
      label={label}
      sx={
        supported
          ? (theme) => ({
              color: theme.palette.success.main,
              bgcolor: alpha(theme.palette.success.main, 0.14),
              fontWeight: 700,
              '& .MuiChip-icon': { color: theme.palette.success.main },
            })
          : undefined
      }
    />
  );
}

export function SettingsPage() {
  const t = useScopedT(dict);
  const bilingual = useBilingual();
  const { lang, setLang } = useLang();
  const { mode, setMode } = useColorMode();
  const nurse = useCurrentNurse();

  const [voiceRate, setVoiceRate] = useState(1);
  const [interimResults, setInterimResults] = useState(true);
  const [notifyVitals, setNotifyVitals] = useState(true);
  const [notifyMeds, setNotifyMeds] = useState(true);
  const [notifyFalls, setNotifyFalls] = useState(false);

  const sttSupported = isSpeechRecognitionSupported();
  const ttsSupported = isSpeechSynthesisSupported();

  const handleLang = (_: React.MouseEvent<HTMLElement>, next: Lang | null) => {
    if (next) setLang(next);
  };
  const handleMode = (_: React.MouseEvent<HTMLElement>, next: ColorMode | null) => {
    if (next) setMode(next);
  };

  return (
    <>
      <PageHeader
        title={t('pageTitle')}
        subtitle={t('pageSubtitle')}
        icon={<SettingsOutlinedIcon />}
      />

      <Grid container spacing={3}>
        {/* Appearance */}
        <Grid item xs={12} md={6}>
          <SectionCard
            title={t('appearance')}
            subtitle={t('appearanceSub')}
            icon={<PaletteOutlinedIcon fontSize="small" />}
          >
            <SettingRow
              icon={<TranslateOutlinedIcon fontSize="small" />}
              title={t('language')}
              description={t('languageHint')}
              control={
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={lang}
                  onChange={handleLang}
                  aria-label={t('language')}
                  color="primary"
                >
                  <ToggleButton value="en" sx={{ px: 2, fontWeight: 700 }}>
                    EN
                  </ToggleButton>
                  <ToggleButton value="ko" sx={{ px: 2, fontWeight: 700 }}>
                    한국어
                  </ToggleButton>
                </ToggleButtonGroup>
              }
            />
            <Divider />
            <SettingRow
              icon={
                mode === 'dark' ? (
                  <DarkModeOutlinedIcon fontSize="small" />
                ) : (
                  <LightModeOutlinedIcon fontSize="small" />
                )
              }
              title={t('theme')}
              description={t('themeHint')}
              control={
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={mode}
                  onChange={handleMode}
                  aria-label={t('theme')}
                  color="primary"
                >
                  <ToggleButton value="light" sx={{ px: 1.5 }}>
                    <LightModeOutlinedIcon sx={{ fontSize: 18, mr: 0.75 }} />
                    {t('light')}
                  </ToggleButton>
                  <ToggleButton value="dark" sx={{ px: 1.5 }}>
                    <DarkModeOutlinedIcon sx={{ fontSize: 18, mr: 0.75 }} />
                    {t('dark')}
                  </ToggleButton>
                </ToggleButtonGroup>
              }
            />
          </SectionCard>
        </Grid>

        {/* Bedside interaction */}
        <Grid item xs={12} md={6}>
          <SectionCard
            title={t('bedside')}
            subtitle={t('bedsideSub')}
            icon={<RecordVoiceOverOutlinedIcon fontSize="small" />}
          >
            <SettingRow
              icon={<GraphicEqOutlinedIcon fontSize="small" />}
              title={t('sttLocale')}
              description={t('sttLocaleHint')}
              control={
                <Chip
                  size="small"
                  variant="outlined"
                  color="primary"
                  label={localeOf[lang]}
                  className="tnum"
                  sx={{ fontWeight: 700, fontFamily: 'monospace' }}
                />
              }
            />
            <Divider />
            <Box sx={{ py: 1.75 }}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box sx={{ color: 'text.secondary', display: 'flex', mt: 0.25 }}>
                  <SpeedOutlinedIcon fontSize="small" />
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="baseline"
                    spacing={1}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {t('voiceRate')}
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="primary.main" className="tnum">
                      {formatNumber(voiceRate, lang, 2)}×
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {t('voiceRateHint')}
                  </Typography>
                  <Box sx={{ px: 0.5, mt: 1 }}>
                    <Slider
                      value={voiceRate}
                      onChange={(_, v) => setVoiceRate(v as number)}
                      min={0.7}
                      max={1.3}
                      step={0.05}
                      marks={[
                        { value: 0.7 },
                        { value: 1, label: '1.0×' },
                        { value: 1.3 },
                      ]}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(v) => `${formatNumber(v, lang, 2)}×`}
                      aria-label={t('voiceRate')}
                    />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        {t('slower')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('faster')}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              </Stack>
            </Box>
            <Divider />
            <SettingRow
              icon={<GraphicEqOutlinedIcon fontSize="small" />}
              title={t('interim')}
              description={t('interimHint')}
              control={
                <Switch
                  checked={interimResults}
                  onChange={(e) => setInterimResults(e.target.checked)}
                  inputProps={{ 'aria-label': t('interim') }}
                />
              }
            />
            <Divider sx={{ mb: 1.75 }} />
            <Typography variant="overline" color="text.secondary">
              {t('capabilities')}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
              <Stack spacing={0.75} alignItems="flex-start">
                <Typography variant="caption" color="text.secondary">
                  {t('recognition')}
                </Typography>
                <CapabilityChip
                  supported={sttSupported}
                  label={sttSupported ? t('available') : t('unavailable')}
                />
              </Stack>
              <Stack spacing={0.75} alignItems="flex-start">
                <Typography variant="caption" color="text.secondary">
                  {t('synthesis')}
                </Typography>
                <CapabilityChip
                  supported={ttsSupported}
                  label={ttsSupported ? t('available') : t('unavailable')}
                />
              </Stack>
            </Stack>
          </SectionCard>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <SectionCard
            title={t('notifications')}
            subtitle={t('notificationsSub')}
            icon={<NotificationsActiveOutlinedIcon fontSize="small" />}
          >
            <SettingRow
              icon={<MonitorHeartOutlinedIcon fontSize="small" />}
              title={t('criticalVitals')}
              description={t('criticalVitalsHint')}
              control={
                <Switch
                  checked={notifyVitals}
                  onChange={(e) => setNotifyVitals(e.target.checked)}
                  color="error"
                  inputProps={{ 'aria-label': t('criticalVitals') }}
                />
              }
            />
            <Divider />
            <SettingRow
              icon={<MedicationOutlinedIcon fontSize="small" />}
              title={t('medsDue')}
              description={t('medsDueHint')}
              control={
                <Switch
                  checked={notifyMeds}
                  onChange={(e) => setNotifyMeds(e.target.checked)}
                  inputProps={{ 'aria-label': t('medsDue') }}
                />
              }
            />
            <Divider />
            <SettingRow
              icon={<AccessibilityNewOutlinedIcon fontSize="small" />}
              title={t('fallRisk')}
              description={t('fallRiskHint')}
              control={
                <Switch
                  checked={notifyFalls}
                  onChange={(e) => setNotifyFalls(e.target.checked)}
                  color="warning"
                  inputProps={{ 'aria-label': t('fallRisk') }}
                />
              }
            />
          </SectionCard>
        </Grid>

        {/* Profile */}
        <Grid item xs={12} md={6}>
          <SectionCard
            title={t('profile')}
            subtitle={t('profileSub')}
            icon={<BadgeOutlinedIcon fontSize="small" />}
            action={
              <Chip size="small" variant="outlined" label={t('readOnly')} sx={{ fontWeight: 600 }} />
            }
          >
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
              <PatientAvatar initials="HJ" acuity="stable" size={56} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" fontWeight={800} noWrap>
                  {nurse.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {nurse.nameKo} · {bilingual(nurse.role)}
                </Typography>
              </Box>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2.5}>
              <Grid item xs={6}>
                <ProfileField label={t('role')} value={bilingual(nurse.role)} />
              </Grid>
              <Grid item xs={6}>
                <ProfileField label={t('shift')} value={nurse.shift} />
              </Grid>
              <Grid item xs={12}>
                <ProfileField label={t('unit')} value={bilingual(nurse.unit)} />
              </Grid>
              <Grid item xs={12}>
                <ProfileField label={t('license')} value={nurse.licenseNo} />
              </Grid>
            </Grid>
          </SectionCard>
        </Grid>

        {/* About */}
        <Grid item xs={12}>
          <SectionCard
            title={t('about')}
            subtitle={t('aboutSub')}
            icon={<InfoOutlinedIcon fontSize="small" />}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    display: 'grid',
                    placeItems: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    flexShrink: 0,
                  }}
                >
                  <SettingsOutlinedIcon />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={800}>
                    MediVoice
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('tagline')}
                  </Typography>
                </Box>
              </Stack>
              <Chip
                size="small"
                variant="outlined"
                label={`${t('version')} 1.0.0`}
                className="tnum"
                sx={{ fontWeight: 600 }}
              />
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                {t('synthetic')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('researchNote')}{' '}
                <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
                  {RESEARCH_HEADLINES.studyAuthors}
                </Box>
              </Typography>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
}
