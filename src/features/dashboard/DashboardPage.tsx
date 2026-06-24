import { useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import MicNoneIcon from '@mui/icons-material/MicNone';
import AddTaskIcon from '@mui/icons-material/AddTask';
import GroupsIcon from '@mui/icons-material/Groups';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PieChartOutlineIcon from '@mui/icons-material/PieChartOutline';
import InsightsIcon from '@mui/icons-material/Insights';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import NorthEastIcon from '@mui/icons-material/NorthEast';

import {
  PageHeader,
  StatCard,
  SectionCard,
  PatientAvatar,
  Sparkline,
  EmptyState,
} from '@/components';
import {
  useCurrentNurse,
  usePatients,
  useSchedule,
  useAllRecords,
} from '@/store/useAppStore';
import { WARDS, QUESTION_SETS, RESEARCH_HEADLINES } from '@/data/clinical';
import { acuityColor, vitalColors, chartCategorical } from '@/theme/tokens';
import { vitalTone } from '@/lib/clinical';
import { formatDate, formatTime, timeAgo, formatNumber } from '@/lib/format';
import { useLang, useBilingual, useScopedT, type Dictionary } from '@/i18n/I18nProvider';
import type {
  Acuity,
  NursingRecord,
  Patient,
  ScheduledRound,
  VitalSample,
} from '@/types/clinical';

/* ------------------------------------------------------------------ *
 * Localized chrome
 * ------------------------------------------------------------------ */

const dict = {
  subtitle: { en: 'Unit overview', ko: '병동 현황' },
  greetingMorning: { en: 'Good morning', ko: '좋은 아침입니다' },
  greetingAfternoon: { en: 'Good afternoon', ko: '안녕하세요' },
  greetingEvening: { en: 'Good evening', ko: '좋은 저녁입니다' },
  startRound: { en: 'Start Voice Round', ko: '음성 회진 시작' },
  newAssessment: { en: 'New Assessment', ko: '새 사정' },

  kpiPatients: { en: 'Patients on unit', ko: '재원 환자' },
  kpiPatientsCaption: { en: 'across 5 nursing units', ko: '5개 병동' },
  kpiHighAcuity: { en: 'High-acuity patients', ko: '고위험 환자' },
  kpiHighAcuityCaption: { en: 'serious or critical', ko: '중증 · 위급' },
  kpiRounds: { en: 'Rounds today', ko: '오늘 회진' },
  kpiRoundsCaption: { en: 'completed of scheduled', ko: '예정 대비 완료' },
  kpiSaved: { en: 'Documentation time saved', ko: '기록 시간 단축' },
  kpiSavedDelta: { en: 'repeat use', ko: '반복 사용' },
  kpiSavedCaption: { en: 'vs. manual charting', ko: '수기 기록 대비' },

  census: { en: 'Census by ward', ko: '병동별 재원' },
  censusSub: { en: 'Patients per nursing unit', ko: '병동별 환자 수' },
  acuityMix: { en: 'Acuity mix', ko: '중증도 분포' },
  acuitySub: { en: 'Distribution across the unit', ko: '병동 전체 분포' },
  activity: { en: 'Rounding activity', ko: '회진 활동' },
  activitySub: { en: 'Nursing records, last 7 days', ko: '최근 7일 간호기록' },

  watchlist: { en: 'Critical watchlist', ko: '집중 관찰 명단' },
  watchlistSub: { en: 'Serious & critical patients', ko: '중증 · 위급 환자' },
  watchlistEmpty: { en: 'No high-acuity patients', ko: '고위험 환자 없음' },
  watchlistEmptyDesc: {
    en: 'Every patient on the unit is currently stable or guarded.',
    ko: '현재 모든 환자가 안정 또는 주의 단계입니다.',
  },

  schedule: { en: "Today's schedule", ko: '오늘 일정' },
  scheduleSub: { en: 'Upcoming voice rounds', ko: '예정된 음성 회진' },
  scheduleEmpty: { en: 'All rounds completed', ko: '모든 회진 완료' },
  scheduleEmptyDesc: {
    en: 'No further rounds are scheduled for the rest of the shift.',
    ko: '이번 근무 동안 예정된 회진이 더 없습니다.',
  },
  viewAll: { en: 'View all', ko: '전체 보기' },
  start: { en: 'Start', ko: '시작' },
  inProgress: { en: 'In progress', ko: '진행 중' },
  scheduled: { en: 'Scheduled', ko: '예정' },

  recent: { en: 'Recent records', ko: '최근 기록' },
  recentSub: { en: 'Latest documentation activity', ko: '최근 문서 작성 내역' },
  recentEmpty: { en: 'No records yet', ko: '기록 없음' },
  recentEmptyDesc: {
    en: 'Completed voice rounds and notes will appear here.',
    ko: '완료된 음성 회진과 기록이 여기에 표시됩니다.',
  },
  by: { en: 'by', ko: '작성자' },
  signed: { en: 'Signed', ko: '서명됨' },
  draft: { en: 'Draft', ko: '미서명' },
  patientsUnit: { en: 'patients', ko: '명' },
} satisfies Dictionary;

/* ------------------------------------------------------------------ *
 * Record-type labels (bilingual chrome around a free-text model field)
 * ------------------------------------------------------------------ */

const RECORD_TYPE_LABEL: Record<NursingRecord['type'], { en: string; ko: string }> = {
  rounding: { en: 'Voice round', ko: '음성 회진' },
  SOAP: { en: 'SOAP note', ko: 'SOAP 기록' },
  narrative: { en: 'Narrative', ko: '서술 기록' },
  assessment: { en: 'Assessment', ko: '사정' },
};

const RECORD_TYPE_COLOR: Record<NursingRecord['type'], string> = {
  rounding: chartCategorical[0],
  SOAP: chartCategorical[1],
  narrative: chartCategorical[2],
  assessment: chartCategorical[3],
};

const HIGH_ACUITY: Acuity[] = ['serious', 'critical'];

/* ------------------------------------------------------------------ *
 * Small helpers
 * ------------------------------------------------------------------ */

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function latestVital(p: Patient): VitalSample | undefined {
  if (p.vitals.length === 0) return undefined;
  return p.vitals[p.vitals.length - 1];
}

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */

export function DashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { lang } = useLang();
  const t = useScopedT(dict);
  const bi = useBilingual();

  const nurse = useCurrentNurse();
  const patients = usePatients();
  const schedule = useSchedule();
  const records = useAllRecords();

  const nurseName = lang === 'ko' ? nurse.nameKo : nurse.name;

  /* greeting ------------------------------------------------------- */
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return t('greetingMorning');
    if (h < 18) return t('greetingAfternoon');
    return t('greetingEvening');
  }, [t]);

  /* KPIs ----------------------------------------------------------- */
  const highAcuityCount = useMemo(
    () => patients.filter((p) => HIGH_ACUITY.includes(p.acuity)).length,
    [patients],
  );

  const roundsToday = useMemo(() => {
    const todays = schedule.filter((s) => isToday(s.scheduledAt));
    return {
      completed: todays.filter((s) => s.status === 'completed').length,
      total: todays.length,
    };
  }, [schedule]);

  /* census by ward ------------------------------------------------- */
  const censusData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of patients) {
      counts.set(p.ward.code, (counts.get(p.ward.code) ?? 0) + 1);
    }
    return WARDS.map((w) => ({
      code: w.code,
      name: bi(w.name),
      count: counts.get(w.code) ?? 0,
    }));
  }, [patients, bi]);

  /* acuity mix ----------------------------------------------------- */
  const acuityData = useMemo(() => {
    const order: Acuity[] = ['stable', 'guarded', 'serious', 'critical'];
    const counts = new Map<Acuity, number>();
    for (const p of patients) counts.set(p.acuity, (counts.get(p.acuity) ?? 0) + 1);
    return order
      .map((a) => ({ acuity: a, value: counts.get(a) ?? 0, color: acuityColor[a] }))
      .filter((d) => d.value > 0);
  }, [patients]);

  /* rounding activity (last 7 days) -------------------------------- */
  const activityData = useMemo(() => {
    const days: { key: string; label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      days.push({
        key: dayKey(d),
        label: new Intl.DateTimeFormat(lang === 'ko' ? 'ko-KR' : 'en-US', {
          weekday: 'short',
        }).format(d),
        count: 0,
      });
    }
    const index = new Map(days.map((d, i) => [d.key, i]));
    for (const r of records) {
      const k = dayKey(new Date(r.createdAt));
      const i = index.get(k);
      if (i !== undefined) days[i].count += 1;
    }
    return days;
  }, [records, lang]);

  /* watchlist ------------------------------------------------------ */
  const watchlist = useMemo(
    () =>
      patients
        .filter((p) => HIGH_ACUITY.includes(p.acuity))
        .sort(
          (a, b) =>
            (b.acuity === 'critical' ? 1 : 0) - (a.acuity === 'critical' ? 1 : 0),
        )
        .slice(0, 5),
    [patients],
  );

  /* today's schedule ----------------------------------------------- */
  const patientById = useMemo(
    () => new Map(patients.map((p) => [p.id, p])),
    [patients],
  );
  const questionSetById = useMemo(
    () => new Map(QUESTION_SETS.map((q) => [q.id, q])),
    [],
  );

  const upcoming = useMemo(
    () =>
      schedule
        .filter((s) => s.status === 'scheduled' || s.status === 'in-progress')
        .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt))
        .slice(0, 5),
    [schedule],
  );

  /* recent records ------------------------------------------------- */
  const recent = useMemo(
    () =>
      [...records]
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 5),
    [records],
  );

  const todayLabel = formatDate(new Date().toISOString(), lang);

  return (
    <>
      <PageHeader
        icon={<MonitorHeartIcon />}
        title={`${greeting}, ${nurseName}`}
        subtitle={`${todayLabel} · ${bi(nurse.unit)} · ${nurse.shift} ${
          lang === 'ko' ? '근무' : 'shift'
        }`}
        actions={
          <>
            <Button
              variant="contained"
              size="large"
              startIcon={<MicNoneIcon />}
              onClick={() => navigate('/rounds')}
            >
              {t('startRound')}
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<AddTaskIcon />}
              onClick={() => navigate('/schedule')}
            >
              {t('newAssessment')}
            </Button>
          </>
        }
      />

      {/* KPI row */}
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label={t('kpiPatients')}
            value={formatNumber(patients.length, lang)}
            tone="info"
            icon={<GroupsIcon />}
            caption={t('kpiPatientsCaption')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label={t('kpiHighAcuity')}
            value={formatNumber(highAcuityCount, lang)}
            tone="critical"
            icon={<LocalHospitalIcon />}
            caption={t('kpiHighAcuityCaption')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label={t('kpiRounds')}
            value={`${roundsToday.completed} / ${roundsToday.total}`}
            tone="normal"
            icon={<EventAvailableIcon />}
            caption={t('kpiRoundsCaption')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label={t('kpiSaved')}
            value={formatNumber(RESEARCH_HEADLINES.repeatUseReductionPct, lang)}
            unit="%"
            tone="normal"
            icon={<SpeedIcon />}
            delta={{ label: t('kpiSavedDelta'), direction: 'up', good: true }}
            caption={t('kpiSavedCaption')}
          />
        </Grid>
      </Grid>

      {/* Charts row */}
      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid item xs={12} md={6} lg={5}>
          <SectionCard
            title={t('census')}
            subtitle={t('censusSub')}
            icon={<InsightsIcon fontSize="small" />}
          >
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={censusData}
                  margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke={theme.palette.divider}
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="code"
                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                    axisLine={{ stroke: theme.palette.divider }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: alpha(theme.palette.primary.main, 0.06) }}
                    contentStyle={{
                      background: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 10,
                      color: theme.palette.text.primary,
                    }}
                    labelFormatter={(_, payload) =>
                      (payload?.[0]?.payload as { name?: string })?.name ?? ''
                    }
                    formatter={(value: number) => [
                      `${value} ${t('patientsUnit')}`,
                      '',
                    ]}
                  />
                  <Bar
                    dataKey="count"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                    isAnimationActive={false}
                  >
                    {censusData.map((entry, i) => (
                      <Cell
                        key={entry.code}
                        fill={chartCategorical[i % chartCategorical.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </Grid>

        <Grid item xs={12} sm={6} md={6} lg={3}>
          <SectionCard
            title={t('acuityMix')}
            subtitle={t('acuitySub')}
            icon={<PieChartOutlineIcon fontSize="small" />}
          >
            <Box sx={{ height: 280, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      background: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 10,
                      color: theme.palette.text.primary,
                    }}
                    formatter={(value: number, _name, item) => [
                      `${value} ${t('patientsUnit')}`,
                      (item?.payload as { acuity?: string })?.acuity ?? '',
                    ]}
                  />
                  <Pie
                    data={acuityData}
                    dataKey="value"
                    nameKey="acuity"
                    innerRadius={56}
                    outerRadius={88}
                    paddingAngle={2}
                    stroke={theme.palette.background.paper}
                    strokeWidth={2}
                    isAnimationActive={false}
                  >
                    {acuityData.map((entry) => (
                      <Cell key={entry.acuity} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Typography variant="h4" fontWeight={800} className="tnum">
                  {patients.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('kpiPatients')}
                </Typography>
              </Box>
            </Box>
            <Stack
              direction="row"
              flexWrap="wrap"
              useFlexGap
              spacing={1}
              justifyContent="center"
              sx={{ mt: 0.5 }}
            >
              {acuityData.map((d) => (
                <Stack key={d.acuity} direction="row" spacing={0.5} alignItems="center">
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: d.color,
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {d.acuity} ({d.value})
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={12} lg={4}>
          <SectionCard
            title={t('activity')}
            subtitle={t('activitySub')}
            icon={<HistoryEduIcon fontSize="small" />}
          >
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={activityData}
                  margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
                >
                  <defs>
                    <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={vitalColors.sbp}
                        stopOpacity={0.32}
                      />
                      <stop
                        offset="100%"
                        stopColor={vitalColors.sbp}
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke={theme.palette.divider}
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                    axisLine={{ stroke: theme.palette.divider }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ stroke: theme.palette.divider }}
                    contentStyle={{
                      background: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 10,
                      color: theme.palette.text.primary,
                    }}
                    formatter={(value: number) => [value, t('recent')]}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={vitalColors.sbp}
                    strokeWidth={2.5}
                    fill="url(#activityFill)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Operational row */}
      <Grid container spacing={2} sx={{ mt: 0 }}>
        {/* Watchlist */}
        <Grid item xs={12} lg={7}>
          <SectionCard
            title={t('watchlist')}
            subtitle={t('watchlistSub')}
            icon={<WarningAmberIcon fontSize="small" />}
            action={
              <Chip
                size="small"
                color="error"
                variant="outlined"
                label={watchlist.length}
              />
            }
            disableContentPadding
          >
            {watchlist.length === 0 ? (
              <EmptyState
                icon={<WarningAmberIcon />}
                title={t('watchlistEmpty')}
                description={t('watchlistEmptyDesc')}
              />
            ) : (
              <Stack divider={<Divider flexItem />}>
                {watchlist.map((p) => (
                  <WatchlistRow
                    key={p.id}
                    patient={p}
                    onOpen={() => navigate(`/patients/${p.id}`)}
                    lang={lang}
                  />
                ))}
              </Stack>
            )}
          </SectionCard>
        </Grid>

        {/* Today's schedule */}
        <Grid item xs={12} lg={5}>
          <SectionCard
            title={t('schedule')}
            subtitle={t('scheduleSub')}
            icon={<ScheduleIcon fontSize="small" />}
            action={
              <Button
                size="small"
                component={RouterLink}
                to="/schedule"
                endIcon={<ChevronRightIcon />}
              >
                {t('viewAll')}
              </Button>
            }
            disableContentPadding
          >
            {upcoming.length === 0 ? (
              <EmptyState
                icon={<EventAvailableIcon />}
                title={t('scheduleEmpty')}
                description={t('scheduleEmptyDesc')}
              />
            ) : (
              <Stack divider={<Divider flexItem />}>
                {upcoming.map((round) => {
                  const patient = patientById.get(round.patientId);
                  const set = questionSetById.get(round.questionSetId);
                  return (
                    <ScheduleRow
                      key={round.id}
                      round={round}
                      patientName={
                        patient
                          ? lang === 'ko'
                            ? patient.nameKo
                            : patient.name
                          : round.patientId
                      }
                      patientInitials={patient?.initials ?? '?'}
                      patientAcuity={patient?.acuity ?? 'stable'}
                      setName={set ? bi(set.name) : round.questionSetId}
                      lang={lang}
                      statusLabel={
                        round.status === 'in-progress'
                          ? t('inProgress')
                          : t('scheduled')
                      }
                      startLabel={t('start')}
                      onStart={() => navigate(`/rounds/${round.patientId}`)}
                    />
                  );
                })}
              </Stack>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      {/* Recent records */}
      <Grid container spacing={2} sx={{ mt: 0, mb: 1 }}>
        <Grid item xs={12}>
          <SectionCard
            title={t('recent')}
            subtitle={t('recentSub')}
            icon={<HistoryEduIcon fontSize="small" />}
            action={
              <Button
                size="small"
                component={RouterLink}
                to="/records"
                endIcon={<ChevronRightIcon />}
              >
                {t('viewAll')}
              </Button>
            }
            disableContentPadding
          >
            {recent.length === 0 ? (
              <EmptyState
                icon={<HistoryEduIcon />}
                title={t('recentEmpty')}
                description={t('recentEmptyDesc')}
              />
            ) : (
              <Stack divider={<Divider flexItem />}>
                {recent.map((r) => {
                  const patient = patientById.get(r.patientId);
                  return (
                    <RecordRow
                      key={r.id}
                      record={r}
                      patientName={
                        patient
                          ? lang === 'ko'
                            ? patient.nameKo
                            : patient.name
                          : r.patientId
                      }
                      patientInitials={patient?.initials ?? '?'}
                      patientAcuity={patient?.acuity ?? 'stable'}
                      typeLabel={bi(RECORD_TYPE_LABEL[r.type])}
                      typeColor={RECORD_TYPE_COLOR[r.type]}
                      byLabel={t('by')}
                      signedLabel={t('signed')}
                      draftLabel={t('draft')}
                      lang={lang}
                      onOpen={() => navigate(`/patients/${r.patientId}`)}
                    />
                  );
                })}
              </Stack>
            )}
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Row components
 * ------------------------------------------------------------------ */

function VitalChip({
  metric,
  value,
  text,
}: {
  metric: 'hr' | 'sbp' | 'spo2';
  value: number;
  text: string;
}) {
  const tone = vitalTone(metric, value);
  return (
    <Chip
      size="small"
      label={text}
      className="tnum"
      sx={(theme) => {
        const color =
          tone === 'normal'
            ? theme.palette.success.main
            : tone === 'low'
              ? theme.palette.info.main
              : theme.palette.warning.main;
        return {
          fontWeight: 700,
          color,
          bgcolor: alpha(color, 0.12),
        };
      }}
    />
  );
}

function WatchlistRow({
  patient,
  onOpen,
  lang,
}: {
  patient: Patient;
  onOpen: () => void;
  lang: 'en' | 'ko';
}) {
  const v = latestVital(patient);
  const hrSeries = patient.vitals.slice(-12).map((s) => s.hr);
  const name = lang === 'ko' ? patient.nameKo : patient.name;

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      sx={{
        px: 2.5,
        py: 1.75,
        cursor: 'pointer',
        transition: 'background-color 120ms ease',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Grid container spacing={1.5} alignItems="center">
        <Grid item xs={12} sm={5}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <PatientAvatar
              initials={patient.initials}
              acuity={patient.acuity}
              showStatusDot
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={700} noWrap>
                {name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {patient.ward.code} · {patient.room}-{patient.bed} ·{' '}
                <Box component="span" sx={{ textTransform: 'capitalize' }}>
                  {patient.acuity}
                </Box>
              </Typography>
            </Box>
          </Stack>
        </Grid>

        <Grid item xs={9} sm={4}>
          {v ? (
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              <VitalChip metric="hr" value={v.hr} text={`HR ${v.hr}`} />
              <VitalChip
                metric="sbp"
                value={v.sbp}
                text={`BP ${v.sbp}/${v.dbp}`}
              />
              <VitalChip metric="spo2" value={v.spo2} text={`SpO₂ ${v.spo2}%`} />
            </Stack>
          ) : (
            <Typography variant="caption" color="text.secondary">
              —
            </Typography>
          )}
        </Grid>

        <Grid item xs={3} sm={3}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ flexGrow: 1, minWidth: 60 }}>
              {hrSeries.length > 1 && (
                <Sparkline data={hrSeries} color={vitalColors.hr} height={32} />
              )}
            </Box>
            <ChevronRightIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

function ScheduleRow({
  round,
  patientName,
  patientInitials,
  patientAcuity,
  setName,
  lang,
  statusLabel,
  startLabel,
  onStart,
}: {
  round: ScheduledRound;
  patientName: string;
  patientInitials: string;
  patientAcuity: Acuity;
  setName: string;
  lang: 'en' | 'ko';
  statusLabel: string;
  startLabel: string;
  onStart: () => void;
}) {
  const inProgress = round.status === 'in-progress';
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{ px: 2.5, py: 1.5, '&:hover': { bgcolor: 'action.hover' } }}
    >
      <PatientAvatar initials={patientInitials} acuity={patientAcuity} size={36} />
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={700} noWrap>
            {patientName}
          </Typography>
          <Chip
            size="small"
            variant="outlined"
            color={inProgress ? 'warning' : 'default'}
            label={statusLabel}
            sx={{ height: 20 }}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary" noWrap component="div">
          {setName}
        </Typography>
      </Box>
      <Stack alignItems="flex-end" spacing={0.5} sx={{ flexShrink: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={700}
          className="tnum"
        >
          {formatTime(round.scheduledAt, lang)}
        </Typography>
        <Button
          size="small"
          variant={inProgress ? 'contained' : 'outlined'}
          startIcon={<PlayArrowIcon />}
          onClick={onStart}
          sx={{ py: 0.25 }}
        >
          {startLabel}
        </Button>
      </Stack>
    </Stack>
  );
}

function RecordRow({
  record,
  patientName,
  patientInitials,
  patientAcuity,
  typeLabel,
  typeColor,
  byLabel,
  signedLabel,
  draftLabel,
  lang,
  onOpen,
}: {
  record: NursingRecord;
  patientName: string;
  patientInitials: string;
  patientAcuity: Acuity;
  typeLabel: string;
  typeColor: string;
  byLabel: string;
  signedLabel: string;
  draftLabel: string;
  lang: 'en' | 'ko';
  onOpen: () => void;
}) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      onClick={onOpen}
      sx={{
        px: 2.5,
        py: 1.5,
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <PatientAvatar initials={patientInitials} acuity={patientAcuity} size={36} />
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          <Chip
            size="small"
            label={typeLabel}
            sx={{
              height: 20,
              fontWeight: 700,
              color: typeColor,
              bgcolor: alpha(typeColor, 0.12),
            }}
          />
          <Typography variant="subtitle2" fontWeight={700} noWrap>
            {patientName}
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary" noWrap component="div">
          {byLabel} {record.author} · {record.shift}
        </Typography>
      </Box>
      <Stack alignItems="flex-end" spacing={0.5} sx={{ flexShrink: 0 }}>
        <Typography variant="caption" color="text.secondary" className="tnum">
          {timeAgo(record.createdAt, lang)}
        </Typography>
        <Chip
          size="small"
          variant="outlined"
          color={record.signed ? 'success' : 'default'}
          icon={record.signed ? undefined : <NorthEastIcon sx={{ fontSize: 12 }} />}
          label={record.signed ? signedLabel : draftLabel}
          sx={{ height: 20 }}
        />
      </Stack>
    </Stack>
  );
}
