import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import MovieFilterRoundedIcon from '@mui/icons-material/MovieFilterRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';

import { PageHeader, SectionCard, StatCard, PatientAvatar, AcuityChip, EmptyState } from '@/components';
import type { Dictionary } from '@/i18n/I18nProvider';
import { localeOf, useBilingual, useLang, useScopedT } from '@/i18n/I18nProvider';
import {
  useAppStore,
  useCurrentNurse,
  usePatientById,
  usePatients,
  useSchedule,
} from '@/store/useAppStore';
import {
  ROUNDING_QUESTIONS,
  QUESTION_SETS,
  STRUCTURED_REPLIES,
  RESEARCH_HEADLINES,
} from '@/data/clinical';
import {
  cancelSpeech,
  isSpeechRecognitionSupported,
  speak,
  useSpeechRecognition,
} from '@/lib/speech';
import { downloadRoundingReport } from '@/lib/pdf';
import { secondsToClock } from '@/lib/format';
import type {
  NursingRecord,
  Patient,
  RoundingAnswer,
  RoundingQuestion,
  Shift,
} from '@/types/clinical';
import { AISpeakerStage, type StagePhase } from './AISpeakerStage';
import { TranscriptEntry } from './TranscriptEntry';
import { RoundSetupPanel } from './RoundSetupPanel';

type RoundMode = 'live' | 'simulation';

const STT_ENGINE = RESEARCH_HEADLINES.bestEngine;

const dict = {
  title: { en: 'Voice Rounds', ko: '음성 회진' },
  subtitle: {
    en: 'AI-speaker assisted bedside rounding',
    ko: 'AI 스피커 기반 침상 회진',
  },
  modeLive: { en: 'Live microphone', ko: '실시간 마이크' },
  modeSim: { en: 'Simulation', ko: '시뮬레이션' },
  liveUnavailable: {
    en: 'Live microphone unavailable in this browser — using Simulation.',
    ko: '이 브라우저에서는 마이크를 사용할 수 없어 시뮬레이션으로 진행합니다.',
  },
  start: { en: 'Start round', ko: '회진 시작' },
  skip: { en: 'Skip', ko: '건너뛰기' },
  repeat: { en: 'Repeat', ko: '다시 듣기' },
  stop: { en: 'Stop', ko: '중지' },
  reset: { en: 'New round', ko: '새 회진' },
  captureNow: { en: 'Capture answer', ko: '응답 기록' },
  speaker: { en: 'AI Speaker', ko: 'AI 스피커' },
  transcript: { en: 'Live transcript', ko: '실시간 전사' },
  transcriptHint: { en: 'Captured Q & A, normalized for the chart', ko: '인식된 문답을 차트용으로 정규화' },
  emptyTranscriptTitle: { en: 'No responses yet', ko: '아직 응답이 없습니다' },
  emptyTranscriptHint: {
    en: 'Start the round and the AI speaker will interview the patient, one question at a time.',
    ko: '회진을 시작하면 AI 스피커가 한 문항씩 환자를 면담합니다.',
  },
  pickPatientTitle: { en: 'Select a patient to begin', ko: '시작하려면 환자를 선택하세요' },
  pickPatientHint: {
    en: 'Choose a patient and a question set on the left, then press Start to launch the AI-speaker interview.',
    ko: '왼쪽에서 환자와 질문 세트를 고른 뒤 시작을 눌러 AI 스피커 면담을 시작하세요.',
  },
  progress: { en: 'Progress', ko: '진행' },
  questionsLabel: { en: 'Questions', ko: '질문 수' },
  captured: { en: 'Captured', ko: '기록됨' },
  avgConfidence: { en: 'Avg confidence', ko: '평균 정확도' },
  elapsed: { en: 'Elapsed', ko: '경과 시간' },
  completeTitle: { en: 'Rounding record created', ko: '간호기록이 생성되었습니다' },
  completeBody: {
    en: 'The session has been transcribed, normalized and filed to the nursing record — ready for review and signature.',
    ko: '세션이 전사·정규화되어 간호기록에 저장되었습니다. 검토 및 서명할 수 있습니다.',
  },
  exportPdf: { en: 'Export PDF', ko: 'PDF 내보내기' },
  viewRecords: { en: 'Go to records', ko: '기록 보기' },
  viewPatient: { en: 'Open patient', ko: '환자 차트' },
  startAnother: { en: 'Round another patient', ko: '다른 환자 회진' },
  roundedPatient: { en: 'Patient', ko: '환자' },
  recordedBy: { en: 'Recorded by', ko: '기록 간호사' },
  duration: { en: 'Duration', ko: '소요 시간' },
  engineBadge: { en: 'STT engine', ko: 'STT 엔진' },
  scheduledLinked: {
    en: 'Linked scheduled round marked complete.',
    ko: '예정된 회진이 완료 처리되었습니다.',
  },
  asking: { en: 'AI speaker is asking', ko: 'AI 스피커 질문' },
  patientName: { en: 'Now rounding', ko: '회진 대상' },
  cer0: { en: 'CER 0% on the reference utterance', ko: '기준 발화 문자오류율 0%' },
} satisfies Dictionary;

/** Derives the working shift from the hour of day (matches the seed convention). */
function shiftFromHour(hour: number): Shift {
  if (hour >= 7 && hour < 15) return 'Day';
  if (hour >= 15 && hour < 23) return 'Evening';
  return 'Night';
}

function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Picks a deterministic-feeling but varied reply index for the simulation. */
function pickReplyIndex(question: RoundingQuestion, seed: number): number {
  const n = question.sampleReplies.length;
  if (n === 0) return 0;
  return (seed * 7 + 3) % n;
}

/** A realistic STT confidence around 0.9, jittered per answer. */
function simulatedConfidence(seed: number): number {
  const jitter = ((seed * 37) % 11) / 100; // 0.00 – 0.10
  return Math.min(0.99, 0.88 + jitter);
}

export function VoiceRoundsPage() {
  const theme = useTheme();
  const t = useScopedT(dict);
  const b = useBilingual();
  const { lang } = useLang();
  const navigate = useNavigate();
  const { patientId: routePatientId } = useParams<{ patientId: string }>();

  const patients = usePatients();
  const routePatient = usePatientById(routePatientId);
  const schedule = useSchedule();
  const nurse = useCurrentNurse();
  const addRecord = useAppStore((s) => s.addRecord);
  const completeScheduledRound = useAppStore((s) => s.completeScheduledRound);

  const locale = localeOf[lang];
  const liveSupported = isSpeechRecognitionSupported();

  /* ----------------------------- selection state ---------------------------- */
  const [selectedId, setSelectedId] = useState<string | undefined>(routePatientId);
  const [questionSetId, setQuestionSetId] = useState<string>(QUESTION_SETS[0].id);
  const [mode, setMode] = useState<RoundMode>(liveSupported ? 'live' : 'simulation');

  const selectedPatient = usePatientById(selectedId) ?? routePatient ?? patients[0];

  // Preselect from the route once it resolves.
  useEffect(() => {
    if (routePatientId) setSelectedId(routePatientId);
  }, [routePatientId]);

  /* ------------------------------- run state -------------------------------- */
  const [phase, setPhase] = useState<StagePhase>('idle');
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<RoundingAnswer[]>([]);
  const [streaming, setStreaming] = useState('');
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [savedRecord, setSavedRecord] = useState<NursingRecord | null>(null);
  const [linkedSchedule, setLinkedSchedule] = useState(false);

  const running = phase !== 'idle' && phase !== 'complete';

  const questions = useMemo<RoundingQuestion[]>(() => {
    const set = QUESTION_SETS.find((s) => s.id === questionSetId);
    if (!set) return [];
    return set.questionIds
      .map((id) => ROUNDING_QUESTIONS.find((q) => q.id === id))
      .filter((q): q is RoundingQuestion => Boolean(q));
  }, [questionSetId]);

  const total = questions.length;

  /* --------------------------- live recognition ----------------------------- */
  const recognition = useSpeechRecognition({ lang: locale, continuous: false, interimResults: true });

  /* ----------------------- imperative scheduling refs ----------------------- */
  const timers = useRef<number[]>([]);
  const cancelledRef = useRef(false);
  const tickRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  const after = useCallback((ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  // Elapsed-time ticker while a round is active.
  useEffect(() => {
    if (running && startedAt) {
      tickRef.current = window.setInterval(() => {
        setElapsed(Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
      }, 1000);
      return () => {
        if (tickRef.current) window.clearInterval(tickRef.current);
      };
    }
    return undefined;
  }, [running, startedAt]);

  // Cleanup all speech + timers on unmount.
  useEffect(
    () => () => {
      cancelledRef.current = true;
      cancelSpeech();
      clearTimers();
      if (tickRef.current) window.clearInterval(tickRef.current);
    },
    [clearTimers],
  );

  /* ------------------------------ chart helpers ----------------------------- */
  const buildAnswer = useCallback(
    (question: RoundingQuestion, idx: number, transcript: string, confidence: number): RoundingAnswer => {
      const replyIdx = pickReplyIndex(question, idx);
      const structured =
        STRUCTURED_REPLIES[question.id]?.[replyIdx] ?? STRUCTURED_REPLIES[question.id]?.[0] ?? transcript;
      return {
        questionId: question.id,
        category: question.category,
        prompt: question.prompt,
        transcript,
        confidence,
        structured,
        answeredAt: new Date().toISOString(),
      };
    },
    [],
  );

  /* ------------------------- finalize / persist round ----------------------- */
  const finalizeRound = useCallback(
    (collected: RoundingAnswer[]) => {
      const patient = selectedPatient;
      if (!patient || collected.length === 0) {
        setPhase('idle');
        return;
      }
      const started = startedAt ?? new Date().toISOString();
      const durationSec = Math.max(
        collected.length * 6,
        Math.floor((Date.now() - new Date(started).getTime()) / 1000),
      );
      const sessionId = newId('rs');
      const record: NursingRecord = {
        id: newId('rec'),
        patientId: patient.id,
        type: 'rounding',
        createdAt: new Date().toISOString(),
        author: nurse.name,
        shift: shiftFromHour(new Date().getHours()),
        signed: false,
        session: {
          id: sessionId,
          patientId: patient.id,
          startedAt: started,
          durationSec,
          sttEngine: STT_ENGINE,
          locale,
          answers: collected,
        },
      };
      addRecord(record);

      // Complete a matching scheduled round if one is due for this patient.
      const match = schedule.find(
        (sr) => sr.patientId === patient.id && sr.status !== 'completed',
      );
      if (match) {
        completeScheduledRound(match.id);
        setLinkedSchedule(true);
      }

      setSavedRecord(record);
      setPhase('complete');
    },
    [selectedPatient, startedAt, nurse.name, locale, addRecord, schedule, completeScheduledRound],
  );

  /* ----------------------------- step engine -------------------------------- */
  // Forward declaration via ref so phase handlers can call the next step.
  const runStepRef = useRef<(idx: number, collected: RoundingAnswer[]) => void>(() => {});

  const captureAnswer = useCallback(
    (idx: number, collected: RoundingAnswer[], transcript: string, confidence: number) => {
      const question = questions[idx];
      if (!question) return;
      const answer = buildAnswer(question, idx, transcript || question.sampleReplies[0]?.[lang] || '—', confidence);
      const next = [...collected, answer];
      setAnswers(next);
      setStreaming('');
      setPhase('captured');
      after(750, () => {
        if (cancelledRef.current) return;
        runStepRef.current(idx + 1, next);
      });
    },
    [questions, buildAnswer, lang, after],
  );

  // Listening for simulation mode: stream a sample reply character-by-character.
  const simulateListen = useCallback(
    (idx: number, collected: RoundingAnswer[]) => {
      const question = questions[idx];
      if (!question) return;
      const replyIdx = pickReplyIndex(question, idx);
      const reply = question.sampleReplies[replyIdx]?.[lang] ?? '';
      const confidence = simulatedConfidence(idx);
      setPhase('listening');
      setStreaming('');

      // Brief pause, then type out the reply.
      after(900, () => {
        if (cancelledRef.current) return;
        const chars = Array.from(reply);
        let i = 0;
        const step = () => {
          if (cancelledRef.current) return;
          i += 1;
          setStreaming(chars.slice(0, i).join(''));
          if (i < chars.length) {
            after(26, step);
          } else {
            after(450, () => {
              if (cancelledRef.current) return;
              captureAnswer(idx, collected, reply, confidence);
            });
          }
        };
        step();
      });
    },
    [questions, lang, after, captureAnswer],
  );

  // Listening for live mode: start the recognizer, then capture on stop/end.
  const liveListen = useCallback(() => {
    setPhase('listening');
    setStreaming('');
    recognition.reset();
    recognition.start();
  }, [recognition]);

  const runStep = useCallback(
    (idx: number, collected: RoundingAnswer[]) => {
      if (cancelledRef.current) return;
      if (idx >= questions.length) {
        finalizeRound(collected);
        return;
      }
      setActiveIndex(idx);
      const question = questions[idx];
      setPhase('speaking');
      setStreaming('');
      // AI speaker asks the question via TTS, then we listen.
      speak(b(question.prompt), locale).then(() => {
        if (cancelledRef.current) return;
        if (mode === 'simulation' || !liveSupported) {
          simulateListen(idx, collected);
        } else {
          liveListen();
        }
      });
    },
    [questions, finalizeRound, b, locale, mode, liveSupported, simulateListen, liveListen],
  );

  // Keep the ref in sync so captureAnswer can advance without a dependency cycle.
  useEffect(() => {
    runStepRef.current = runStep;
  }, [runStep]);

  /* -------------------------- live capture handling ------------------------- */
  // While listening live, mirror the interim transcript into the streaming line.
  useEffect(() => {
    if (phase === 'listening' && mode === 'live') {
      const text = (recognition.finalTranscript || recognition.interimTranscript).trim();
      if (text) setStreaming(text);
    }
  }, [phase, mode, recognition.finalTranscript, recognition.interimTranscript]);

  // When the live recognizer ends with a final transcript, capture and advance.
  useEffect(() => {
    if (
      phase === 'listening' &&
      mode === 'live' &&
      !recognition.listening &&
      recognition.finalTranscript.trim()
    ) {
      const confidence = recognition.confidence || 0.82;
      captureAnswer(activeIndex, answers, recognition.finalTranscript.trim(), confidence);
    }
  }, [phase, mode, recognition.listening, recognition.finalTranscript, recognition.confidence, activeIndex, answers, captureAnswer]);

  // Fall back to simulation if a live recognition error occurs mid-round.
  useEffect(() => {
    if (recognition.error && phase === 'listening' && mode === 'live') {
      recognition.reset();
      simulateListen(activeIndex, answers);
    }
  }, [recognition.error, phase, mode, activeIndex, answers, recognition, simulateListen]);

  /* -------------------------------- controls -------------------------------- */
  const handleStart = useCallback(() => {
    if (!selectedPatient || total === 0) return;
    cancelledRef.current = false;
    clearTimers();
    setAnswers([]);
    setStreaming('');
    setSavedRecord(null);
    setLinkedSchedule(false);
    setActiveIndex(0);
    setElapsed(0);
    setStartedAt(new Date().toISOString());
    runStep(0, []);
  }, [selectedPatient, total, clearTimers, runStep]);

  const handleStop = useCallback(() => {
    cancelledRef.current = true;
    cancelSpeech();
    clearTimers();
    recognition.stop();
    if (answers.length > 0) {
      cancelledRef.current = false;
      finalizeRound(answers);
    } else {
      setPhase('idle');
      setStreaming('');
      setStartedAt(null);
    }
  }, [clearTimers, recognition, answers, finalizeRound]);

  const handleSkip = useCallback(() => {
    if (!running) return;
    cancelSpeech();
    clearTimers();
    recognition.stop();
    setStreaming('');
    // Advance past the current question without recording an answer.
    after(50, () => {
      if (cancelledRef.current) return;
      runStepRef.current(activeIndex + 1, answers);
    });
  }, [running, clearTimers, recognition, after, activeIndex, answers]);

  const handleRepeat = useCallback(() => {
    if (!running) return;
    cancelSpeech();
    clearTimers();
    recognition.stop();
    setStreaming('');
    after(50, () => {
      if (cancelledRef.current) return;
      runStepRef.current(activeIndex, answers);
    });
  }, [running, clearTimers, recognition, after, activeIndex, answers]);

  const handleCaptureNow = useCallback(() => {
    // Live mode: let the nurse force-stop the recognizer to chart what was heard.
    recognition.stop();
  }, [recognition]);

  const handleReset = useCallback(() => {
    cancelledRef.current = true;
    cancelSpeech();
    clearTimers();
    recognition.stop();
    cancelledRef.current = false;
    setPhase('idle');
    setAnswers([]);
    setStreaming('');
    setActiveIndex(0);
    setElapsed(0);
    setStartedAt(null);
    setSavedRecord(null);
    setLinkedSchedule(false);
  }, [clearTimers, recognition]);

  const handleSelectPatient = useCallback(
    (id: string) => {
      if (running) return;
      setSelectedId(id);
      handleReset();
    },
    [running, handleReset],
  );

  const handleExportPdf = useCallback(() => {
    if (selectedPatient && savedRecord) {
      downloadRoundingReport(selectedPatient, savedRecord, nurse.name);
    }
  }, [selectedPatient, savedRecord, nurse.name]);

  /* ------------------------------- derived KPI ------------------------------ */
  const avgConfidence = useMemo(() => {
    if (answers.length === 0) return 0;
    return answers.reduce((sum, a) => sum + a.confidence, 0) / answers.length;
  }, [answers]);

  const progressValue = total === 0 ? 0 : (answers.length / total) * 100;

  /* --------------------------------- render --------------------------------- */
  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        icon={<RecordVoiceOverOutlinedIcon />}
        actions={
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Tooltip title={t('cer0')}>
              <Chip
                icon={<GraphicEqRoundedIcon />}
                label={`${STT_ENGINE} · ${locale}`}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 700, '& .MuiChip-icon': { color: 'primary.main' } }}
              />
            </Tooltip>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={mode}
              onChange={(_, v: RoundMode | null) => {
                if (v && !running) setMode(v);
              }}
              disabled={running}
            >
              <ToggleButton value="live" disabled={!liveSupported}>
                <MicRoundedIcon sx={{ fontSize: 18, mr: 0.75 }} />
                {t('modeLive')}
              </ToggleButton>
              <ToggleButton value="simulation">
                <MovieFilterRoundedIcon sx={{ fontSize: 18, mr: 0.75 }} />
                {t('modeSim')}
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        }
      />

      {!liveSupported && (
        <Alert severity="info" sx={{ mb: 2.5 }} icon={<MovieFilterRoundedIcon />}>
          {t('liveUnavailable')}
        </Alert>
      )}

      <Grid container spacing={2.5}>
        {/* ------------------------- left: setup ------------------------- */}
        <Grid item xs={12} md={4} lg={3.5}>
          <RoundSetupPanel
            patients={patients}
            selectedPatient={selectedPatient}
            onSelectPatient={handleSelectPatient}
            questionSetId={questionSetId}
            onSelectQuestionSet={(id) => {
              if (!running) {
                setQuestionSetId(id);
                handleReset();
              }
            }}
            locked={running}
          />
        </Grid>

        {/* ----------------------- center: stage ------------------------ */}
        <Grid item xs={12} md={8} lg={8.5}>
          <Stack spacing={2.5}>
            {/* Now-rounding banner */}
            {selectedPatient && (
              <SectionCard disableContentPadding>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  sx={{ p: 2 }}
                >
                  <PatientAvatar
                    initials={selectedPatient.initials}
                    acuity={selectedPatient.acuity}
                    size={48}
                    showStatusDot
                  />
                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography variant="subtitle1" fontWeight={800}>
                        {lang === 'ko' ? selectedPatient.nameKo : selectedPatient.name}
                      </Typography>
                      <AcuityChip acuity={selectedPatient.acuity} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" className="tnum">
                      {selectedPatient.mrn} · {selectedPatient.ward.code} ·{' '}
                      {b(selectedPatient.ward.name)} · {t('roundedPatient')} {selectedPatient.room}-
                      {selectedPatient.bed}
                    </Typography>
                  </Box>
                  <Chip
                    icon={<PersonRoundedIcon />}
                    label={`${t('recordedBy')}: ${lang === 'ko' ? nurse.nameKo : nurse.name}`}
                    variant="outlined"
                    sx={{ flexShrink: 0 }}
                  />
                </Stack>
              </SectionCard>
            )}

            {/* AI Speaker centerpiece */}
            <SectionCard
              title={t('speaker')}
              icon={<VolumeUpRoundedIcon fontSize="small" />}
              action={
                <Chip
                  size="small"
                  label={
                    mode === 'live' && liveSupported ? t('modeLive') : t('modeSim')
                  }
                  color={mode === 'live' && liveSupported ? 'info' : 'default'}
                  variant="outlined"
                />
              }
            >
              {!selectedPatient || total === 0 ? (
                <EmptyState
                  icon={<RecordVoiceOverOutlinedIcon />}
                  title={t('pickPatientTitle')}
                  description={t('pickPatientHint')}
                />
              ) : phase === 'complete' ? (
                <CompletionPanel
                  patient={selectedPatient}
                  elapsed={elapsed}
                  answers={answers}
                  linkedSchedule={linkedSchedule}
                  onExport={handleExportPdf}
                  onReset={handleReset}
                  onViewRecords={() => navigate('/records')}
                  onViewPatient={() => navigate(`/patients/${selectedPatient.id}`)}
                  t={t}
                  lang={lang}
                  nurseName={lang === 'ko' ? nurse.nameKo : nurse.name}
                />
              ) : (
                <Stack spacing={2.5}>
                  <AISpeakerStage phase={phase} current={activeIndex} total={total} />

                  {/* Active prompt readout */}
                  {running && questions[activeIndex] && (
                    <Box
                      sx={{
                        px: 2,
                        py: 1.5,
                        borderRadius: 2,
                        textAlign: 'center',
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      }}
                    >
                      <Stack direction="row" spacing={0.75} justifyContent="center" alignItems="center">
                        <ForumRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Typography variant="overline" color="primary.main">
                          {t('asking')}
                        </Typography>
                      </Stack>
                      <Typography variant="h6" fontWeight={700} sx={{ mt: 0.25 }}>
                        “{b(questions[activeIndex].prompt)}”
                      </Typography>
                    </Box>
                  )}

                  {/* Progress */}
                  <Box>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 0.75 }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {t('progress')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" className="tnum">
                        {answers.length} / {total}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={progressValue}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {/* Controls */}
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    justifyContent="center"
                  >
                    {phase === 'idle' ? (
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<PlayArrowRoundedIcon />}
                        onClick={handleStart}
                        disabled={total === 0}
                      >
                        {t('start')}
                      </Button>
                    ) : (
                      <>
                        {mode === 'live' && phase === 'listening' && (
                          <Button
                            variant="contained"
                            color="info"
                            startIcon={<CheckCircleRoundedIcon />}
                            onClick={handleCaptureNow}
                          >
                            {t('captureNow')}
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          startIcon={<ReplayRoundedIcon />}
                          onClick={handleRepeat}
                        >
                          {t('repeat')}
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<SkipNextRoundedIcon />}
                          onClick={handleSkip}
                        >
                          {t('skip')}
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<StopRoundedIcon />}
                          onClick={handleStop}
                        >
                          {t('stop')}
                        </Button>
                      </>
                    )}
                  </Stack>
                </Stack>
              )}
            </SectionCard>

            {/* Live KPIs */}
            {selectedPatient && total > 0 && phase !== 'complete' && (
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <StatCard
                    label={t('questionsLabel')}
                    value={total}
                    tone="info"
                    icon={<ForumRoundedIcon fontSize="small" />}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <StatCard
                    label={t('captured')}
                    value={answers.length}
                    tone="normal"
                    icon={<CheckCircleRoundedIcon fontSize="small" />}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <StatCard
                    label={t('avgConfidence')}
                    value={answers.length ? Math.round(avgConfidence * 100) : '—'}
                    unit={answers.length ? '%' : undefined}
                    tone={avgConfidence >= 0.85 ? 'normal' : 'high'}
                    icon={<GraphicEqRoundedIcon fontSize="small" />}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <StatCard
                    label={t('elapsed')}
                    value={secondsToClock(elapsed)}
                    tone="neutral"
                    icon={<RestartAltRoundedIcon fontSize="small" />}
                  />
                </Grid>
              </Grid>
            )}

            {/* Live transcript log */}
            <SectionCard
              title={t('transcript')}
              subtitle={t('transcriptHint')}
              icon={<DescriptionRoundedIcon fontSize="small" />}
              action={
                answers.length > 0 ? (
                  <Chip size="small" label={`${answers.length} / ${total}`} className="tnum" />
                ) : undefined
              }
            >
              {answers.length === 0 && phase !== 'listening' && phase !== 'speaking' ? (
                <EmptyState
                  icon={<ForumRoundedIcon />}
                  title={t('emptyTranscriptTitle')}
                  description={t('emptyTranscriptHint')}
                />
              ) : (
                <Stack divider={<Divider flexItem />}>
                  {answers.map((a, i) => (
                    <TranscriptEntry key={`${a.questionId}-${i}`} index={i} answer={a} />
                  ))}
                  {/* Pending row for the question currently being captured. */}
                  {(phase === 'listening' || phase === 'speaking') &&
                    questions[activeIndex] && (
                      <TranscriptEntry
                        index={answers.length}
                        pending
                        streaming={streaming}
                        answer={{
                          questionId: questions[activeIndex].id,
                          category: questions[activeIndex].category,
                          prompt: questions[activeIndex].prompt,
                          transcript: streaming,
                          confidence: 0,
                          structured: '',
                          answeredAt: new Date().toISOString(),
                        }}
                      />
                    )}
                </Stack>
              )}
            </SectionCard>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}

/* ------------------------------------------------------------------------- *
 * Completion panel — success state with export + navigation.
 * ------------------------------------------------------------------------- */

interface CompletionPanelProps {
  patient: Patient;
  elapsed: number;
  answers: RoundingAnswer[];
  linkedSchedule: boolean;
  onExport: () => void;
  onReset: () => void;
  onViewRecords: () => void;
  onViewPatient: () => void;
  t: (key: keyof typeof dict) => string;
  lang: 'en' | 'ko';
  nurseName: string;
}

function CompletionPanel({
  patient,
  elapsed,
  answers,
  linkedSchedule,
  onExport,
  onReset,
  onViewRecords,
  onViewPatient,
  t,
  lang,
  nurseName,
}: CompletionPanelProps) {
  const avg =
    answers.length === 0
      ? 0
      : Math.round((answers.reduce((s, a) => s + a.confidence, 0) / answers.length) * 100);

  return (
    <Stack spacing={2.5} alignItems="center" sx={{ py: 1 }}>
      <Box
        sx={(theme) => ({
          display: 'grid',
          placeItems: 'center',
          width: 76,
          height: 76,
          borderRadius: '50%',
          color: 'success.main',
          bgcolor: alpha(theme.palette.success.main, 0.14),
          animation: 'mv-fade-in 0.4s ease-out',
        })}
      >
        <CheckCircleRoundedIcon sx={{ fontSize: 44 }} />
      </Box>
      <Stack spacing={0.5} alignItems="center" sx={{ textAlign: 'center', maxWidth: 460 }}>
        <Typography variant="h6" fontWeight={800}>
          {t('completeTitle')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('completeBody')}
        </Typography>
      </Stack>

      {linkedSchedule && (
        <Alert severity="success" sx={{ width: '100%' }} icon={<CheckCircleRoundedIcon />}>
          {t('scheduledLinked')}
        </Alert>
      )}

      <Grid container spacing={1.5} sx={{ width: '100%' }}>
        <Grid item xs={6} sm={3}>
          <StatCard label={t('captured')} value={answers.length} tone="normal" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label={t('avgConfidence')} value={avg} unit="%" tone={avg >= 85 ? 'normal' : 'high'} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label={t('duration')} value={secondsToClock(elapsed)} tone="neutral" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label={t('recordedBy')} value={nurseName} tone="info" />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
        <Button variant="contained" startIcon={<PictureAsPdfRoundedIcon />} onClick={onExport}>
          {t('exportPdf')}
        </Button>
        <Button
          variant="outlined"
          component={RouterLink}
          to="/records"
          startIcon={<DescriptionRoundedIcon />}
          onClick={onViewRecords}
        >
          {t('viewRecords')}
        </Button>
        <Button
          variant="outlined"
          component={RouterLink}
          to={`/patients/${patient.id}`}
          startIcon={<PersonRoundedIcon />}
          onClick={onViewPatient}
        >
          {t('viewPatient')}
        </Button>
        <Button variant="text" startIcon={<RestartAltRoundedIcon />} onClick={onReset}>
          {t('startAnother')}
        </Button>
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {lang === 'ko' ? '환자' : 'Patient'}: {lang === 'ko' ? patient.nameKo : patient.name}
      </Typography>
    </Stack>
  );
}
