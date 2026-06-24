import { useMemo, type ReactNode } from 'react';
import {
  Box,
  Chip,
  Divider,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip as MuiTooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import RecordVoiceOverRoundedIcon from '@mui/icons-material/RecordVoiceOverRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import ElderlyRoundedIcon from '@mui/icons-material/ElderlyRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { StatCard } from '@/components/StatCard';
import { useBilingual, useLang, useScopedT, type Dictionary } from '@/i18n/I18nProvider';
import { formatNumber } from '@/lib/format';
import { chartCategorical } from '@/theme/tokens';
import {
  EFFICIENCY_STEPS,
  RECOGNITION_BY_AGE,
  RESEARCH_HEADLINES,
  STT_BENCHMARKS,
  STT_REFERENCE_UTTERANCE,
} from '@/data/clinical';

const dict = {
  title: { en: 'Research', ko: '연구 결과' },
  subtitle: {
    en: 'Reproduced results from the AI-speaker-based nursing record assistance study',
    ko: 'AI 스피커 기반 간호기록 보조 시스템 연구 결과 재현',
  },
  citation: {
    en: 'A study on work efficiency improvement using an AI-speaker-based nursing record work assistance system',
    ko: 'AI 스피커 기반 간호기록 업무 보조 시스템을 활용한 업무 효율 개선 연구',
  },
  kpiRepeat: { en: 'Documentation time saved', ko: '기록 시간 단축' },
  kpiRepeatCaption: { en: 'Repeated-round workflow', ko: '반복 라운딩 워크플로' },
  kpiRepeatDelta: { en: 'vs. manual charting', ko: '수기 기록 대비' },
  kpiFirst: { en: 'First-use reduction', ko: '최초 사용 단축' },
  kpiFirstCaption: { en: 'Including one-time setup', ko: '1회성 준비 포함' },
  kpiEngine: { en: 'Best STT engine', ko: '최적 STT 엔진' },
  kpiEngineCaption: { en: 'Lowest character error rate', ko: '최저 문자 오류율' },
  kpiKnowledge: { en: 'Clinical knowledge base', ko: '임상 지식 베이스' },
  kpiKnowledgeCaption: {
    en: 'NANDA Dx / assessment items / interventions',
    ko: 'NANDA 진단 / 사정 항목 / 중재',
  },
  sttTitle: { en: 'STT engine comparison', ko: 'STT 엔진 비교' },
  sttSubtitle: {
    en: 'Korean speech-to-text on a fixed reference utterance',
    ko: '고정 기준 발화에 대한 한국어 음성 인식',
  },
  reference: { en: 'Reference utterance', ko: '기준 발화' },
  colEngine: { en: 'Engine', ko: '엔진' },
  colRecognized: { en: 'Recognized text', ko: '인식 결과' },
  colErrors: { en: 'Char. errors', ko: '문자 오류' },
  colCer: { en: 'CER', ko: 'CER' },
  colLatency: { en: 'Latency', ko: '지연' },
  recommended: { en: 'Recommended', ko: '권장' },
  cerByEngine: { en: 'Character error rate by engine', ko: '엔진별 문자 오류율' },
  effTitle: { en: 'Time-and-motion efficiency', ko: '동작 시간 분석' },
  effSubtitle: {
    en: 'Traditional charting vs. AI-speaker-assisted workflow, per step',
    ko: '단계별 수기 기록 대비 AI 스피커 보조 워크플로',
  },
  traditional: { en: 'Traditional', ko: '수기 방식' },
  assisted: { en: 'AI-assisted', ko: 'AI 보조' },
  repeatedRound: { en: 'Repeated round (per cycle)', ko: '반복 라운딩 (사이클당)' },
  totalTraditional: { en: 'Traditional total', ko: '수기 합계' },
  totalAssisted: { en: 'AI-assisted total', ko: 'AI 보조 합계' },
  reduction: { en: 'Reduction', ko: '단축률' },
  corridorNote: {
    en: 'Walking steps assume a 45.5 m corridor traversed at 1.41 m/s, as measured in the study; one-time setup steps are excluded from the repeated-round totals.',
    ko: '이동 단계는 연구에서 측정한 45.5 m 복도를 1.41 m/s로 이동하는 것을 가정하며, 1회성 준비 단계는 반복 라운딩 합계에서 제외됩니다.',
  },
  ageTitle: { en: 'Recognition by age group', ko: '연령대별 인식 정확도' },
  ageSubtitle: {
    en: 'Pass rate and mean CER across patient cohorts',
    ko: '환자 코호트별 통과율 및 평균 CER',
  },
  passRate: { en: 'Pass rate', ko: '통과율' },
  meanCer: { en: 'Mean CER', ko: '평균 CER' },
  ageGroup: { en: 'Age group', ko: '연령대' },
  thresholdNote: {
    en: 'An utterance passes when its character error rate stays below the 20% threshold; every cohort, including the 80s group, cleared it.',
    ko: '문자 오류율이 20% 임계값 미만이면 통과로 간주하며, 80대를 포함한 모든 코호트가 이를 충족했습니다.',
  },
  archTitle: { en: 'System architecture', ko: '시스템 구조' },
  archSubtitle: {
    en: 'AI-speaker nursing record pipeline and standardized care linkage',
    ko: 'AI 스피커 간호기록 파이프라인 및 표준 간호 연계',
  },
  flowReact: { en: 'React UI', ko: 'React UI' },
  flowReactSub: { en: 'Nurse selects question', ko: '간호사 질문 선택' },
  flowTts: { en: 'Google TTS', ko: 'Google TTS' },
  flowTtsSub: { en: 'Synthesize prompt', ko: '음성 합성' },
  flowSpeaker: { en: 'AI speaker', ko: 'AI 스피커' },
  flowSpeakerSub: { en: 'Asks the patient', ko: '환자에게 질문' },
  flowPatient: { en: 'Patient', ko: '환자' },
  flowPatientSub: { en: 'Speaks the answer', ko: '음성으로 응답' },
  flowStt: { en: 'Google STT', ko: 'Google STT' },
  flowSttSub: { en: 'Transcribe response', ko: '응답 전사' },
  flowRecord: { en: 'Nursing record', ko: '간호기록' },
  flowRecordSub: { en: 'Saved to database', ko: 'DB 저장' },
  linkageTitle: { en: 'Standardized care linkage', ko: '표준 간호 연계' },
  linkageNanda: { en: 'NANDA-I diagnosis', ko: 'NANDA-I 진단' },
  linkageNandaSub: { en: 'Identify the problem', ko: '문제 규명' },
  linkageNoc: { en: 'NOC outcome', ko: 'NOC 성과' },
  linkageNocSub: { en: 'Define target outcomes', ko: '목표 성과 정의' },
  linkageNic: { en: 'NIC intervention', ko: 'NIC 중재' },
  linkageNicSub: { en: 'Select interventions', ko: '중재 선택' },
  sec: { en: 's', ko: '초' },
  ms: { en: 'ms', ko: 'ms' },
} satisfies Dictionary;

interface FlowNode {
  label: string;
  sub: string;
  icon: ReactNode;
  color: string;
}

function FlowChain({ nodes, accent }: { nodes: FlowNode[]; accent: string }) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1}
      alignItems="stretch"
      useFlexGap
      flexWrap="wrap"
    >
      {nodes.map((node, idx) => (
        <Stack
          key={node.label}
          direction={{ xs: 'column', md: 'row' }}
          spacing={1}
          alignItems="center"
          sx={{ flex: { md: '1 1 0' }, minWidth: 0 }}
        >
          <Stack
            spacing={0.75}
            alignItems="center"
            sx={(theme) => ({
              flex: 1,
              width: '100%',
              textAlign: 'center',
              px: 1.5,
              py: 1.75,
              borderRadius: 2,
              border: `1px solid ${alpha(node.color, 0.35)}`,
              bgcolor: alpha(node.color, theme.palette.mode === 'dark' ? 0.16 : 0.08),
            })}
          >
            <Box
              sx={{
                display: 'grid',
                placeItems: 'center',
                width: 36,
                height: 36,
                borderRadius: '50%',
                color: node.color,
                bgcolor: alpha(node.color, 0.16),
              }}
            >
              {node.icon}
            </Box>
            <Typography variant="caption" fontWeight={700} lineHeight={1.2}>
              {node.label}
            </Typography>
            <Typography variant="caption" color="text.secondary" lineHeight={1.2}>
              {node.sub}
            </Typography>
          </Stack>
          {idx < nodes.length - 1 && (
            <ArrowForwardRoundedIcon
              sx={{
                color: alpha(accent, 0.7),
                fontSize: 20,
                transform: { xs: 'rotate(90deg)', md: 'none' },
                flexShrink: 0,
              }}
            />
          )}
        </Stack>
      ))}
    </Stack>
  );
}

export function ResearchPage() {
  const theme = useTheme();
  const { lang } = useLang();
  const t = useScopedT(dict);
  const tr = useBilingual();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const axisTick = { fill: theme.palette.text.secondary, fontSize: 12 };
  const tooltipStyle = {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    fontSize: 12,
  };
  const labelStyle = { color: theme.palette.text.secondary };

  // --- STT benchmark chart data ---
  const sttChartData = useMemo(
    () =>
      STT_BENCHMARKS.map((b) => ({
        engine: b.engine.replace('Microsoft ', '').replace('Naver ', ''),
        cer: b.cer,
        recommended: b.recommended,
      })),
    [],
  );

  // --- Efficiency chart + totals ---
  const effChartData = useMemo(
    () =>
      EFFICIENCY_STEPS.map((s) => ({
        step: tr(s.step),
        traditional: s.traditionalSec,
        assisted: s.assistedSec,
      })),
    [tr],
  );

  const repeated = useMemo(() => {
    const steps = EFFICIENCY_STEPS.filter((s) => !s.oncePerRound);
    const traditional = steps.reduce((sum, s) => sum + s.traditionalSec, 0);
    const assisted = steps.reduce((sum, s) => sum + s.assistedSec, 0);
    const reductionPct = traditional > 0 ? Math.round(((traditional - assisted) / traditional) * 100) : 0;
    return { traditional, assisted, reductionPct };
  }, []);

  // --- Age recognition chart ---
  const ageChartData = useMemo(
    () =>
      RECOGNITION_BY_AGE.map((r) => ({
        ageGroup: r.ageGroup,
        passRate: r.passRate,
        meanCer: r.meanCer,
      })),
    [],
  );

  const pipelineNodes: FlowNode[] = [
    { label: t('flowReact'), sub: t('flowReactSub'), icon: <ScienceRoundedIcon fontSize="small" />, color: chartCategorical[0] },
    { label: t('flowTts'), sub: t('flowTtsSub'), icon: <GraphicEqRoundedIcon fontSize="small" />, color: chartCategorical[1] },
    { label: t('flowSpeaker'), sub: t('flowSpeakerSub'), icon: <RecordVoiceOverRoundedIcon fontSize="small" />, color: chartCategorical[2] },
    { label: t('flowPatient'), sub: t('flowPatientSub'), icon: <ElderlyRoundedIcon fontSize="small" />, color: chartCategorical[6] },
    { label: t('flowStt'), sub: t('flowSttSub'), icon: <GraphicEqRoundedIcon fontSize="small" />, color: chartCategorical[1] },
    { label: t('flowRecord'), sub: t('flowRecordSub'), icon: <MenuBookRoundedIcon fontSize="small" />, color: chartCategorical[7] },
  ];

  const linkageNodes: FlowNode[] = [
    { label: t('linkageNanda'), sub: t('linkageNandaSub'), icon: <ScienceRoundedIcon fontSize="small" />, color: chartCategorical[0] },
    { label: t('linkageNoc'), sub: t('linkageNocSub'), icon: <CheckCircleRoundedIcon fontSize="small" />, color: chartCategorical[1] },
    { label: t('linkageNic'), sub: t('linkageNicSub'), icon: <AccountTreeRoundedIcon fontSize="small" />, color: chartCategorical[2] },
  ];

  const knowledgeValue = `${formatNumber(RESEARCH_HEADLINES.nandaDiagnoses, lang)} / ${formatNumber(
    RESEARCH_HEADLINES.assessmentItems,
    lang,
  )} / ${formatNumber(RESEARCH_HEADLINES.interventions, lang)}`;

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        icon={<ScienceRoundedIcon />}
      />

      {/* Citation line */}
      <Stack
        direction="row"
        spacing={1.25}
        alignItems="flex-start"
        sx={{
          mb: 3,
          px: 2,
          py: 1.5,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.05),
        }}
      >
        <FormatQuoteRoundedIcon sx={{ color: 'primary.main', mt: 0.25, flexShrink: 0 }} />
        <Typography variant="body2" color="text.secondary">
          <Box component="span" sx={{ fontStyle: 'italic', color: 'text.primary' }}>
            “{t('citation')}”
          </Box>{' '}
          — {RESEARCH_HEADLINES.studyAuthors}, Chungnam National University.
        </Typography>
      </Stack>

      {/* Headline KPIs */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label={t('kpiRepeat')}
            value={formatNumber(RESEARCH_HEADLINES.repeatUseReductionPct, lang)}
            unit="%"
            tone="normal"
            icon={<SpeedRoundedIcon />}
            delta={{ label: t('kpiRepeatDelta'), direction: 'up', good: true }}
            caption={t('kpiRepeatCaption')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label={t('kpiFirst')}
            value={formatNumber(RESEARCH_HEADLINES.firstUseReductionPct, lang)}
            unit="%"
            tone="info"
            icon={<TimerRoundedIcon />}
            caption={t('kpiFirstCaption')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label={t('kpiEngine')}
            value={RESEARCH_HEADLINES.bestEngine}
            tone="normal"
            icon={<VerifiedRoundedIcon />}
            caption={`${formatNumber(RESEARCH_HEADLINES.bestEngineCer, lang, 1)}% CER`}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label={t('kpiKnowledge')}
            value={knowledgeValue}
            tone="neutral"
            icon={<MenuBookRoundedIcon />}
            caption={t('kpiKnowledgeCaption')}
          />
        </Grid>
      </Grid>

      {/* STT engine comparison */}
      <Box sx={{ mt: 3 }}>
        <SectionCard
          title={t('sttTitle')}
          subtitle={t('sttSubtitle')}
          icon={<GraphicEqRoundedIcon fontSize="small" />}
        >
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="flex-start"
            sx={{
              mb: 2,
              px: 1.75,
              py: 1.25,
              borderRadius: 2,
              border: `1px dashed ${theme.palette.divider}`,
              bgcolor: 'action.hover',
            }}
          >
            <FormatQuoteRoundedIcon sx={{ color: 'text.secondary', fontSize: 18, mt: 0.25, flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="overline" color="text.secondary" lineHeight={1.4}>
                {t('reference')}
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'keep-all' }}>
                {STT_REFERENCE_UTTERANCE}
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2.5}>
            <Grid item xs={12} lg={7}>
              <TableContainer>
                <Table size="small" sx={{ '& td, & th': { borderColor: 'divider' } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>{t('colEngine')}</TableCell>
                      {!isMobile && (
                        <TableCell sx={{ fontWeight: 700 }}>{t('colRecognized')}</TableCell>
                      )}
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {t('colErrors')}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {t('colCer')}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {t('colLatency')}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {STT_BENCHMARKS.map((b) => (
                      <TableRow
                        key={b.engine}
                        sx={{
                          bgcolor: b.recommended
                            ? alpha(theme.palette.success.main, 0.08)
                            : 'transparent',
                          '&:last-of-type td': { border: 0 },
                        }}
                      >
                        <TableCell>
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            <Typography variant="body2" fontWeight={b.recommended ? 700 : 500} noWrap>
                              {b.engine}
                            </Typography>
                            {b.recommended && (
                              <Chip
                                size="small"
                                color="success"
                                icon={<CheckCircleRoundedIcon />}
                                label={t('recommended')}
                                sx={{ height: 20, fontWeight: 700, '& .MuiChip-label': { px: 0.75 } }}
                              />
                            )}
                          </Stack>
                        </TableCell>
                        {!isMobile && (
                          <TableCell sx={{ maxWidth: 260 }}>
                            <MuiTooltip title={b.recognized} placement="top">
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {b.recognized}
                              </Typography>
                            </MuiTooltip>
                          </TableCell>
                        )}
                        <TableCell align="right" className="tnum">
                          {formatNumber(b.characterErrors, lang)}
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            className="tnum"
                            sx={{
                              color:
                                b.cer === 0
                                  ? 'success.main'
                                  : b.cer >= RESEARCH_HEADLINES.cerPassThreshold
                                    ? 'error.main'
                                    : 'warning.main',
                            }}
                          >
                            {formatNumber(b.cer, lang, 1)}%
                          </Typography>
                        </TableCell>
                        <TableCell align="right" className="tnum" sx={{ color: 'text.secondary' }}>
                          {formatNumber(b.latencyMs, lang)} {t('ms')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} lg={5}>
              <Typography variant="overline" color="text.secondary">
                {t('cerByEngine')}
              </Typography>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sttChartData} margin={{ top: 16, right: 8, bottom: 0, left: -18 }}>
                    <CartesianGrid vertical={false} stroke={theme.palette.divider} strokeDasharray="3 3" />
                    <XAxis dataKey="engine" tick={axisTick} tickLine={false} axisLine={{ stroke: theme.palette.divider }} interval={0} />
                    <YAxis tick={axisTick} tickLine={false} axisLine={false} width={44} unit="%" />
                    <Tooltip
                      cursor={{ fill: alpha(theme.palette.primary.main, 0.06) }}
                      contentStyle={tooltipStyle}
                      labelStyle={labelStyle}
                      formatter={(value: number) => [`${formatNumber(value, lang, 1)}%`, t('colCer')]}
                    />
                    <Bar dataKey="cer" radius={[4, 4, 0, 0]} maxBarSize={48} isAnimationActive={false}>
                      <LabelList
                        dataKey="cer"
                        position="top"
                        formatter={(value: number) => `${formatNumber(value, lang, 1)}%`}
                        style={{ fill: theme.palette.text.secondary, fontSize: 11, fontWeight: 700 }}
                      />
                      {sttChartData.map((entry) => (
                        <Cell
                          key={entry.engine}
                          fill={entry.recommended ? theme.palette.success.main : chartCategorical[0]}
                          fillOpacity={entry.recommended ? 1 : 0.65}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>
        </SectionCard>
      </Box>

      {/* Time-and-motion efficiency */}
      <Box sx={{ mt: 3 }}>
        <SectionCard
          title={t('effTitle')}
          subtitle={t('effSubtitle')}
          icon={<SpeedRoundedIcon fontSize="small" />}
        >
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={8}>
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={effChartData}
                    layout="vertical"
                    margin={{ top: 4, right: 16, bottom: 0, left: 8 }}
                    barGap={2}
                  >
                    <CartesianGrid horizontal={false} stroke={theme.palette.divider} strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      tick={axisTick}
                      tickLine={false}
                      axisLine={{ stroke: theme.palette.divider }}
                      unit={lang === 'ko' ? '초' : 's'}
                    />
                    <YAxis
                      type="category"
                      dataKey="step"
                      tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={140}
                    />
                    <Tooltip
                      cursor={{ fill: alpha(theme.palette.primary.main, 0.06) }}
                      contentStyle={tooltipStyle}
                      labelStyle={labelStyle}
                      formatter={(value: number, name: string) => [`${formatNumber(value, lang)} ${t('sec')}`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar
                      dataKey="traditional"
                      name={t('traditional')}
                      fill={theme.palette.text.secondary}
                      fillOpacity={0.55}
                      radius={[0, 3, 3, 0]}
                      maxBarSize={14}
                      isAnimationActive={false}
                    />
                    <Bar
                      dataKey="assisted"
                      name={t('assisted')}
                      fill={theme.palette.primary.main}
                      radius={[0, 3, 3, 0]}
                      maxBarSize={14}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack
                spacing={1.5}
                sx={{
                  height: '100%',
                  justifyContent: 'center',
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: 'action.hover',
                }}
              >
                <Typography variant="overline" color="text.secondary" lineHeight={1.3}>
                  {t('repeatedRound')}
                </Typography>
                <Stack direction="row" alignItems="baseline" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    {t('totalTraditional')}
                  </Typography>
                  <Typography variant="h6" fontWeight={800} className="tnum">
                    {formatNumber(repeated.traditional, lang)} {t('sec')}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="baseline" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    {t('totalAssisted')}
                  </Typography>
                  <Typography variant="h6" fontWeight={800} className="tnum" color="primary.main">
                    {formatNumber(repeated.assisted, lang)} {t('sec')}
                  </Typography>
                </Stack>
                <Divider />
                <Stack alignItems="center" spacing={0.25}>
                  <Typography
                    variant="h3"
                    fontWeight={800}
                    className="tnum"
                    color="success.main"
                  >
                    −{formatNumber(repeated.reductionPct, lang)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('reduction')}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                {t('corridorNote')}
              </Typography>
            </Grid>
          </Grid>
        </SectionCard>
      </Box>

      {/* Recognition by age group */}
      <Box sx={{ mt: 3 }}>
        <SectionCard
          title={t('ageTitle')}
          subtitle={t('ageSubtitle')}
          icon={<ElderlyRoundedIcon fontSize="small" />}
        >
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ageChartData} margin={{ top: 12, right: 16, bottom: 0, left: -16 }}>
                <CartesianGrid vertical={false} stroke={theme.palette.divider} strokeDasharray="3 3" />
                <XAxis dataKey="ageGroup" tick={axisTick} tickLine={false} axisLine={{ stroke: theme.palette.divider }} />
                <YAxis
                  yAxisId="pass"
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  domain={[80, 100]}
                  unit="%"
                />
                <YAxis
                  yAxisId="cer"
                  orientation="right"
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  domain={[0, 'auto']}
                  unit="%"
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={labelStyle}
                  formatter={(value: number, name: string) => [`${formatNumber(value, lang, 1)}%`, name]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  yAxisId="pass"
                  type="monotone"
                  dataKey="passRate"
                  name={t('passRate')}
                  stroke={theme.palette.success.main}
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="cer"
                  type="monotone"
                  dataKey="meanCer"
                  name={t('meanCer')}
                  stroke={theme.palette.warning.main}
                  strokeWidth={2.5}
                  strokeDasharray="5 4"
                  dot={{ r: 4 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
            {t('thresholdNote')}
          </Typography>
        </SectionCard>
      </Box>

      {/* System architecture */}
      <Box sx={{ mt: 3 }}>
        <SectionCard
          title={t('archTitle')}
          subtitle={t('archSubtitle')}
          icon={<AccountTreeRoundedIcon fontSize="small" />}
        >
          <FlowChain nodes={pipelineNodes} accent={theme.palette.primary.main} />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              {t('linkageTitle')}
            </Typography>
            <FlowChain nodes={linkageNodes} accent={theme.palette.text.secondary} />
          </Box>
        </SectionCard>
      </Box>
    </>
  );
}
