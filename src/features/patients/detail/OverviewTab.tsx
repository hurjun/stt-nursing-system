import { Box, Chip, Divider, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import BloodtypeOutlinedIcon from '@mui/icons-material/BloodtypeOutlined';
import AirOutlinedIcon from '@mui/icons-material/AirOutlined';
import ThermostatOutlinedIcon from '@mui/icons-material/ThermostatOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import { SectionCard } from '@/components/SectionCard';
import { StatCard } from '@/components/StatCard';
import { PriorityChip } from '@/components/chips';
import type { Tone } from '@/components/tone';
import { useBilingual, useLang, useScopedT } from '@/i18n/I18nProvider';
import { formatDate, timeAgo } from '@/lib/format';
import {
  VITAL_RANGES,
  meanArterialPressure,
  newsLikeScore,
  vitalTone,
  type VitalMetric,
} from '@/lib/clinical';
import type { Patient, VitalSample } from '@/types/clinical';
import { detailDict } from './dict';

const toneMap: Record<'normal' | 'low' | 'high', Tone> = {
  normal: 'normal',
  low: 'low',
  high: 'high',
};

interface OverviewTabProps {
  patient: Patient;
}

function vitalStat(metric: VitalMetric, value: number) {
  const tone = vitalTone(metric, value);
  return { tone: toneMap[tone], range: VITAL_RANGES[metric] };
}

export function OverviewTab({ patient }: OverviewTabProps) {
  const t = useScopedT(detailDict);
  const bilingual = useBilingual();
  const { lang } = useLang();

  const latest: VitalSample | undefined = patient.vitals[patient.vitals.length - 1];
  const activeNanda = patient.nanda.filter((n) => n.status === 'active');
  const io = patient.intakeOutput[0];
  const intake = io ? io.oralMl + io.ivMl : 0;
  const output = io ? io.urineMl + io.otherOutputMl : 0;
  const balance = intake - output;

  const news = latest ? newsLikeScore(latest) : 0;
  const newsTone: Tone = news >= 7 ? 'critical' : news >= 5 ? 'high' : news >= 1 ? 'info' : 'normal';
  const newsLabel = news >= 5 ? t('newsHigh') : news >= 3 ? t('newsMedium') : t('newsLow');

  const cards: Array<{ metric: VitalMetric; label: string; value: string; unit: string; icon: React.ReactNode }> =
    latest
      ? [
          { metric: 'hr', label: VITAL_RANGES.hr.label, value: `${latest.hr}`, unit: 'bpm', icon: <FavoriteBorderIcon fontSize="small" /> },
          {
            metric: 'sbp',
            label: t('bloodPressure'),
            value: `${latest.sbp}/${latest.dbp}`,
            unit: 'mmHg',
            icon: <BloodtypeOutlinedIcon fontSize="small" />,
          },
          { metric: 'spo2', label: VITAL_RANGES.spo2.label, value: `${latest.spo2}`, unit: '%', icon: <AirOutlinedIcon fontSize="small" /> },
          { metric: 'temp', label: VITAL_RANGES.temp.label, value: latest.temp.toFixed(1), unit: '°C', icon: <ThermostatOutlinedIcon fontSize="small" /> },
          { metric: 'rr', label: VITAL_RANGES.rr.label, value: `${latest.rr}`, unit: '/min', icon: <MonitorHeartOutlinedIcon fontSize="small" /> },
          { metric: 'pain', label: VITAL_RANGES.pain.label, value: `${latest.pain}`, unit: '/10', icon: <HealingOutlinedIcon fontSize="small" /> },
        ]
      : [];

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12}>
        <SectionCard
          title={t('latestVitals')}
          icon={<MonitorHeartOutlinedIcon fontSize="small" />}
          subtitle={latest ? `${t('measuredAt')} ${timeAgo(latest.timestamp, lang)}` : undefined}
        >
          {latest ? (
            <Grid container spacing={2}>
              {cards.map((c) => {
                const { tone } = vitalStat(c.metric, parseFloat(c.value));
                return (
                  <Grid item xs={6} sm={4} md={2} key={c.metric}>
                    <StatCard
                      label={c.label}
                      value={c.value}
                      unit={c.unit}
                      tone={tone}
                      icon={c.icon}
                      caption={`${VITAL_RANGES[c.metric].low}–${VITAL_RANGES[c.metric].high}`}
                    />
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t('measuredAt')} —
            </Typography>
          )}
        </SectionCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <SectionCard title={t('newsScore')} icon={<PsychologyOutlinedIcon fontSize="small" />}>
          <Stack alignItems="center" spacing={1.5} sx={{ py: 1 }}>
            <Box
              sx={(theme) => {
                const color =
                  newsTone === 'critical'
                    ? theme.palette.error.main
                    : newsTone === 'high'
                      ? theme.palette.warning.main
                      : newsTone === 'info'
                        ? theme.palette.info.main
                        : theme.palette.success.main;
                return {
                  width: 116,
                  height: 116,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  color,
                  border: `6px solid ${alpha(color, 0.22)}`,
                  bgcolor: alpha(color, 0.08),
                };
              }}
            >
              <Typography variant="h2" fontWeight={800} className="tnum" lineHeight={1}>
                {news}
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={700} textAlign="center">
              {newsLabel}
            </Typography>
            {latest && (
              <Stack direction="row" spacing={1} divider={<Divider orientation="vertical" flexItem />}>
                <Box textAlign="center">
                  <Typography variant="overline" color="text.secondary">
                    {t('map')}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} className="tnum">
                    {meanArterialPressure(latest)} mmHg
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="overline" color="text.secondary">
                    {t('painScale')}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} className="tnum">
                    {latest.pain}/10
                  </Typography>
                </Box>
              </Stack>
            )}
          </Stack>
        </SectionCard>
      </Grid>

      <Grid item xs={12} md={8}>
        <SectionCard title={t('problemList')} icon={<AssignmentOutlinedIcon fontSize="small" />}>
          <Stack divider={<Divider flexItem />} spacing={1.25}>
            {patient.diagnoses.map((dx) => (
              <Stack
                key={dx.icd10 + dx.onsetDate}
                direction="row"
                spacing={1.5}
                alignItems="center"
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                  <Chip
                    size="small"
                    label={dx.icd10}
                    className="mono"
                    sx={(theme) => ({
                      fontWeight: 700,
                      color: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    })}
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {dx.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dx.category === 'primary' ? t('primaryDx') : t('secondaryDx')} · {t('onset')}{' '}
                      {formatDate(dx.onsetDate, lang)}
                    </Typography>
                  </Box>
                </Stack>
                {dx.category === 'primary' && (
                  <Chip size="small" color="primary" variant="outlined" label={t('primaryDx')} />
                )}
              </Stack>
            ))}
          </Stack>
        </SectionCard>
      </Grid>

      <Grid item xs={12} md={7}>
        <SectionCard title={t('activeNanda')} icon={<PsychologyOutlinedIcon fontSize="small" />}>
          <Stack spacing={1.25}>
            {activeNanda.map((n) => (
              <Stack
                key={n.id}
                direction="row"
                spacing={1.5}
                alignItems="center"
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                  <Chip size="small" variant="outlined" className="mono" label={n.code} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {bilingual(n.label)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {bilingual(n.domain)}
                    </Typography>
                  </Box>
                </Stack>
                <PriorityChip priority={n.priority} />
              </Stack>
            ))}
            {activeNanda.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                {bilingual({ en: 'No active nursing diagnoses.', ko: '활성 간호진단이 없습니다.' })}
              </Typography>
            )}
          </Stack>
        </SectionCard>
      </Grid>

      <Grid item xs={12} md={5}>
        <SectionCard title={t('intakeOutput')} icon={<WaterDropOutlinedIcon fontSize="small" />}>
          <Stack spacing={2}>
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="body2" fontWeight={600}>
                  {t('intake')}
                </Typography>
                <Typography variant="body2" fontWeight={700} className="tnum" color="info.main">
                  {intake} mL
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (intake / Math.max(intake, output, 1)) * 100)}
                color="info"
              />
            </Box>
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="body2" fontWeight={600}>
                  {t('output')}
                </Typography>
                <Typography variant="body2" fontWeight={700} className="tnum" color="secondary.main">
                  {output} mL
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (output / Math.max(intake, output, 1)) * 100)}
                color="secondary"
              />
            </Box>
            <Divider />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" fontWeight={700}>
                {t('balance')}
              </Typography>
              <Typography
                variant="h6"
                fontWeight={800}
                className="tnum"
                sx={{ color: balance >= 0 ? 'info.main' : 'warning.main' }}
              >
                {balance >= 0 ? '+' : ''}
                {balance} mL
              </Typography>
            </Stack>
          </Stack>
        </SectionCard>
      </Grid>
    </Grid>
  );
}
