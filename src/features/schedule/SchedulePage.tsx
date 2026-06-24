import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Snackbar,
  Alert,
  Stack,
  Tooltip,
  Typography,
  type ChipProps,
  type SelectChangeEvent,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import { PageHeader, SectionCard, StatCard, PatientAvatar, EmptyState } from '@/components';
import { QUESTION_SETS } from '@/data/clinical';
import {
  useCurrentNurse,
  usePatients,
  useSchedule,
  useAppStore,
} from '@/store/useAppStore';
import { useBilingual, useLang, useScopedT, type Dictionary } from '@/i18n/I18nProvider';
import { formatDate, formatTime } from '@/lib/format';
import type { Patient, QuestionSet, ScheduledRound } from '@/types/clinical';

const dict = {
  title: { en: 'Schedule', ko: '회진 일정' },
  subtitle: {
    en: 'Plan and launch AI-speaker rounding for your patients',
    ko: 'AI 스피커 회진을 계획하고 시작합니다',
  },
  kpiScheduled: { en: 'Scheduled', ko: '예정' },
  kpiInProgress: { en: 'In progress', ko: '진행 중' },
  kpiCompleted: { en: 'Completed', ko: '완료' },
  kpiMissed: { en: 'Missed', ko: '누락' },
  kpiScheduledCaption: { en: 'Awaiting start', ko: '시작 대기' },
  kpiInProgressCaption: { en: 'At the bedside', ko: '침상 진행' },
  kpiCompletedCaption: { en: 'Documented', ko: '기록 완료' },
  kpiMissedCaption: { en: 'Needs follow-up', ko: '후속 필요' },
  newTitle: { en: 'New rounding', ko: '새 회진' },
  newSubtitle: { en: 'Assign a question set and time', ko: '질문 세트와 시간을 지정' },
  patientLabel: { en: 'Patient', ko: '환자' },
  questionSetLabel: { en: 'Question set', ko: '질문 세트' },
  dateLabel: { en: 'Date', ko: '날짜' },
  timeLabel: { en: 'Time', ko: '시간' },
  assignedTo: { en: 'Assigned to', ko: '담당 간호사' },
  questions: { en: 'questions', ko: '문항' },
  schedule: { en: 'Schedule rounding', ko: '회진 예약' },
  reset: { en: 'Reset', ko: '초기화' },
  timelineTitle: { en: 'Today', ko: '오늘 일정' },
  timelineSubtitle: { en: 'Rounding timeline by hour', ko: '시간대별 회진 일정' },
  rounds: { en: 'rounds', ko: '건' },
  start: { en: 'Start', ko: '시작' },
  complete: { en: 'Complete', ko: '완료' },
  overdue: { en: 'Overdue', ko: '지연' },
  statusScheduled: { en: 'Scheduled', ko: '예정' },
  statusInProgress: { en: 'In progress', ko: '진행 중' },
  statusCompleted: { en: 'Completed', ko: '완료' },
  statusMissed: { en: 'Missed', ko: '누락' },
  emptyTitle: { en: 'No rounds scheduled', ko: '예약된 회진이 없습니다' },
  emptyDesc: {
    en: 'Use the form to assign a question set to a patient and add it to today’s rounding timeline.',
    ko: '왼쪽 양식에서 환자에게 질문 세트를 배정하면 오늘 일정에 추가됩니다.',
  },
  room: { en: 'Room', ko: '병실' },
  bed: { en: 'Bed', ko: '베드' },
  added: { en: 'Rounding scheduled', ko: '회진이 예약되었습니다' },
  completed: { en: 'Round marked complete', ko: '회진이 완료 처리되었습니다' },
  now: { en: 'Now', ko: '지금' },
  later: { en: 'Upcoming', ko: '예정' },
  earlier: { en: 'Earlier', ko: '지난 일정' },
} satisfies Dictionary;

type Status = ScheduledRound['status'];

const STATUS_COLOR: Record<Status, ChipProps['color']> = {
  scheduled: 'info',
  'in-progress': 'warning',
  completed: 'success',
  missed: 'error',
};

const STATUS_LABEL_KEY: Record<Status, keyof typeof dict> = {
  scheduled: 'statusScheduled',
  'in-progress': 'statusInProgress',
  completed: 'statusCompleted',
  missed: 'statusMissed',
};

/** Combine a calendar date with a clock time into a single Date. */
function combine(date: Date | null, time: Date | null): Date | null {
  if (!date || !time || Number.isNaN(+date) || Number.isNaN(+time)) return null;
  const out = new Date(date);
  out.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return out;
}

export function SchedulePage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { lang } = useLang();
  const t = useScopedT(dict);
  const bilingual = useBilingual();

  const patients = usePatients();
  const schedule = useSchedule();
  const currentNurse = useCurrentNurse();
  const addScheduledRound = useAppStore((s) => s.addScheduledRound);
  const completeScheduledRound = useAppStore((s) => s.completeScheduledRound);

  const [patientId, setPatientId] = useState('');
  const [questionSetId, setQuestionSetId] = useState(QUESTION_SETS[0]?.id ?? '');
  const [date, setDate] = useState<Date | null>(() => new Date());
  const [time, setTime] = useState<Date | null>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() < 30 ? 30 : 0);
    if (d.getMinutes() === 0) d.setHours(d.getHours() + 1);
    d.setSeconds(0, 0);
    return d;
  });
  const [snack, setSnack] = useState<string | null>(null);

  const patientById = useMemo(() => {
    const map = new Map<string, Patient>();
    for (const p of patients) map.set(p.id, p);
    return map;
  }, [patients]);

  const questionSetById = useMemo(() => {
    const map = new Map<string, QuestionSet>();
    for (const q of QUESTION_SETS) map.set(q.id, q);
    return map;
  }, []);

  const counts = useMemo(() => {
    const base: Record<Status, number> = {
      scheduled: 0,
      'in-progress': 0,
      completed: 0,
      missed: 0,
    };
    for (const r of schedule) base[r.status] += 1;
    return base;
  }, [schedule]);

  const sorted = useMemo(
    () =>
      [...schedule].sort(
        (a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt),
      ),
    [schedule],
  );

  const selectedSet = questionSetById.get(questionSetId);
  const canSubmit = Boolean(patientId && questionSetId && combine(date, time));

  function handleSubmit() {
    const at = combine(date, time);
    if (!patientId || !questionSetId || !at) return;
    const round: ScheduledRound = {
      id: 'sched-' + Math.random().toString(36).slice(2, 10),
      patientId,
      scheduledAt: at.toISOString(),
      questionSetId,
      assignedNurse: currentNurse.name,
      status: 'scheduled',
    };
    addScheduledRound(round);
    setPatientId('');
    setSnack(t('added'));
  }

  function handleReset() {
    setPatientId('');
    setQuestionSetId(QUESTION_SETS[0]?.id ?? '');
    setDate(new Date());
    const d = new Date();
    d.setMinutes(d.getMinutes() < 30 ? 30 : 0);
    if (d.getMinutes() === 0) d.setHours(d.getHours() + 1);
    d.setSeconds(0, 0);
    setTime(d);
  }

  function handleStart(round: ScheduledRound) {
    navigate(`/rounds/${round.patientId}`);
  }

  function handleComplete(round: ScheduledRound) {
    completeScheduledRound(round.id);
    setSnack(t('completed'));
  }

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        icon={<EventNoteOutlinedIcon />}
      />

      {/* KPI strip */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard
            label={t('kpiScheduled')}
            value={counts.scheduled}
            tone="info"
            icon={<EventAvailableOutlinedIcon fontSize="small" />}
            caption={t('kpiScheduledCaption')}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            label={t('kpiInProgress')}
            value={counts['in-progress']}
            tone="high"
            icon={<HourglassTopOutlinedIcon fontSize="small" />}
            caption={t('kpiInProgressCaption')}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            label={t('kpiCompleted')}
            value={counts.completed}
            tone="normal"
            icon={<TaskAltOutlinedIcon fontSize="small" />}
            caption={t('kpiCompletedCaption')}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            label={t('kpiMissed')}
            value={counts.missed}
            tone="critical"
            icon={<ErrorOutlineOutlinedIcon fontSize="small" />}
            caption={t('kpiMissedCaption')}
          />
        </Grid>
      </Grid>

      {/* Two-column layout: form + timeline */}
      <Grid container spacing={3} alignItems="flex-start">
        <Grid item xs={12} md={5} lg={4}>
          <SectionCard
            title={t('newTitle')}
            subtitle={t('newSubtitle')}
            icon={<AddCircleOutlineIcon />}
          >
            <Stack spacing={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel id="sched-patient-label">{t('patientLabel')}</InputLabel>
                <Select
                  labelId="sched-patient-label"
                  label={t('patientLabel')}
                  value={patientId}
                  onChange={(e: SelectChangeEvent) => setPatientId(e.target.value)}
                  renderValue={(value) => {
                    const p = patientById.get(value);
                    if (!p) return '';
                    return (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PatientAvatar initials={p.initials} acuity={p.acuity} size={24} />
                        <span>{lang === 'ko' ? p.nameKo : p.name}</span>
                      </Stack>
                    );
                  }}
                >
                  {patients.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ width: '100%' }}>
                        <PatientAvatar initials={p.initials} acuity={p.acuity} size={30} />
                        <ListItemText
                          primary={lang === 'ko' ? p.nameKo : p.name}
                          secondary={`${bilingual(p.ward.name)} · ${t('room')} ${p.room}-${p.bed}`}
                          primaryTypographyProps={{ fontWeight: 600, noWrap: true }}
                          secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
                        />
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel id="sched-set-label">{t('questionSetLabel')}</InputLabel>
                <Select
                  labelId="sched-set-label"
                  label={t('questionSetLabel')}
                  value={questionSetId}
                  onChange={(e: SelectChangeEvent) => setQuestionSetId(e.target.value)}
                >
                  {QUESTION_SETS.map((qs) => (
                    <MenuItem key={qs.id} value={qs.id}>
                      <ListItemText
                        primary={bilingual(qs.name)}
                        secondary={`${qs.questionIds.length} ${t('questions')} · ${bilingual(qs.description)}`}
                        primaryTypographyProps={{ fontWeight: 600, noWrap: true }}
                        secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedSet && (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <QuestionAnswerOutlinedIcon
                      fontSize="small"
                      sx={{ color: 'primary.main' }}
                    />
                    <Typography variant="body2" fontWeight={700} sx={{ flexGrow: 1 }}>
                      {bilingual(selectedSet.name)}
                    </Typography>
                    <Chip
                      size="small"
                      label={`${selectedSet.questionIds.length} ${t('questions')}`}
                      color="primary"
                      variant="outlined"
                      className="tnum"
                    />
                  </Stack>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    {bilingual(selectedSet.description)}
                  </Typography>
                </Box>
              )}

              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label={t('dateLabel')}
                    value={date}
                    onChange={setDate}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TimePicker
                    label={t('timeLabel')}
                    value={time}
                    onChange={setTime}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
              </Grid>

              <Divider />

              <Stack direction="row" spacing={1} alignItems="center">
                <RecordVoiceOverOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {t('assignedTo')}:{' '}
                  <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
                    {lang === 'ko' ? currentNurse.nameKo : currentNurse.name}
                  </Box>
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AddCircleOutlineIcon />}
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                >
                  {t('schedule')}
                </Button>
                <Tooltip title={t('reset')}>
                  <IconButton onClick={handleReset} aria-label={t('reset')}>
                    <RestartAltRoundedIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={7} lg={8}>
          <SectionCard
            title={t('timelineTitle')}
            subtitle={t('timelineSubtitle')}
            icon={<ScheduleOutlinedIcon />}
            action={
              <Chip
                size="small"
                label={`${sorted.length} ${t('rounds')}`}
                variant="outlined"
                className="tnum"
              />
            }
            disableContentPadding
          >
            {sorted.length === 0 ? (
              <EmptyState
                icon={<EventNoteOutlinedIcon />}
                title={t('emptyTitle')}
                description={t('emptyDesc')}
              />
            ) : (
              <Stack divider={<Divider />}>
                {sorted.map((round) => {
                  const patient = patientById.get(round.patientId);
                  const qset = questionSetById.get(round.questionSetId);
                  if (!patient) return null;
                  const at = new Date(round.scheduledAt);
                  const isPast = +at < Date.now();
                  const isOverdue = round.status === 'scheduled' && isPast;
                  const isOpen = round.status === 'scheduled' || round.status === 'in-progress';
                  const accent =
                    round.status === 'completed'
                      ? theme.palette.success.main
                      : round.status === 'missed'
                        ? theme.palette.error.main
                        : isOverdue
                          ? theme.palette.error.main
                          : round.status === 'in-progress'
                            ? theme.palette.warning.main
                            : theme.palette.info.main;

                  return (
                    <Box
                      key={round.id}
                      sx={{
                        display: 'flex',
                        gap: 1.5,
                        px: 2.5,
                        py: 1.75,
                        position: 'relative',
                        borderLeft: `3px solid ${accent}`,
                        bgcolor: isOverdue
                          ? alpha(theme.palette.error.main, 0.05)
                          : 'transparent',
                        transition: 'background-color 120ms ease',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      {/* Time column */}
                      <Box sx={{ width: 64, flexShrink: 0, textAlign: 'right', pt: 0.25 }}>
                        <Typography variant="subtitle2" fontWeight={800} className="tnum">
                          {formatTime(round.scheduledAt, lang)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" className="tnum">
                          {formatDate(round.scheduledAt, lang)}
                        </Typography>
                      </Box>

                      <PatientAvatar
                        initials={patient.initials}
                        acuity={patient.acuity}
                        size={40}
                      />

                      {/* Detail */}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          flexWrap="wrap"
                          useFlexGap
                        >
                          <Typography variant="subtitle2" fontWeight={700} noWrap>
                            {lang === 'ko' ? patient.nameKo : patient.name}
                          </Typography>
                          <Chip
                            size="small"
                            color={STATUS_COLOR[round.status]}
                            variant="outlined"
                            label={t(STATUS_LABEL_KEY[round.status])}
                            sx={{ height: 20, fontSize: '0.68rem' }}
                          />
                          {isOverdue && (
                            <Chip
                              size="small"
                              color="error"
                              icon={<WarningAmberRoundedIcon sx={{ fontSize: 14 }} />}
                              label={t('overdue')}
                              sx={{ height: 20, fontSize: '0.68rem' }}
                            />
                          )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {bilingual(patient.ward.name)} · {t('room')} {patient.room}-{patient.bed}
                        </Typography>
                        {qset && (
                          <Stack
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                            sx={{ mt: 0.5 }}
                          >
                            <QuestionAnswerOutlinedIcon
                              sx={{ fontSize: 15, color: 'text.secondary' }}
                            />
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {bilingual(qset.name)}
                            </Typography>
                            <Typography variant="caption" color="text.disabled" className="tnum">
                              · {qset.questionIds.length} {t('questions')}
                            </Typography>
                          </Stack>
                        )}
                      </Box>

                      {/* Actions */}
                      <Stack
                        direction="row"
                        spacing={0.75}
                        alignItems="center"
                        sx={{ flexShrink: 0 }}
                      >
                        {isOpen && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<PlayArrowRoundedIcon />}
                              onClick={() => handleStart(round)}
                            >
                              {t('start')}
                            </Button>
                            <Tooltip title={t('complete')}>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleComplete(round)}
                                aria-label={t('complete')}
                              >
                                <DoneRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      <Snackbar
        open={snack !== null}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnack(null)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snack}
        </Alert>
      </Snackbar>
    </>
  );
}
