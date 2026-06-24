import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  type SelectChangeEvent,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { PageHeader, SectionCard, PatientAvatar, AcuityChip, EmptyState } from '@/components';
import { usePatients, useAllRecords, useCurrentNurse, useAppStore } from '@/store/useAppStore';
import { useLang, useScopedT, useBilingual, type Dictionary } from '@/i18n/I18nProvider';
import { meanArterialPressure } from '@/lib/clinical';
import { formatDateTime, timeAgo, formatNumber } from '@/lib/format';
import {
  buildPatientReport,
  buildRoundingReport,
  downloadPatientReport,
  downloadRoundingReport,
} from '@/lib/pdf';
import type { NursingRecord, Patient, RoundingSession } from '@/types/clinical';

/* ------------------------------------------------------------------ *
 * Local translation dictionary
 * ------------------------------------------------------------------ */
const dict = {
  title: { en: 'Reports', ko: '보고서' },
  subtitle: {
    en: 'Generate and export clinical PDF documentation',
    ko: '임상 PDF 문서 생성 및 내보내기',
  },
  reportTypes: { en: 'Report type', ko: '보고서 유형' },
  assessmentName: { en: 'Nursing Assessment Report', ko: '간호 사정 보고서' },
  assessmentDesc: {
    en: 'A complete EMR summary: demographics, latest vitals, active problems, NANDA nursing diagnoses and medications.',
    ko: '인구학적 정보, 최근 활력징후, 활성 문제, NANDA 간호진단 및 투약을 포함한 전체 EMR 요약입니다.',
  },
  roundingName: { en: 'Voice Rounding Record', ko: '음성 라운딩 기록' },
  roundingDesc: {
    en: 'A focused record of one AI-speaker bedside round — each prompt, transcript and charted entry with recognition confidence.',
    ko: 'AI 스피커 침상 라운딩 한 건의 기록 — 각 질문, 전사 및 차팅 항목과 인식 신뢰도를 포함합니다.',
  },
  patient: { en: 'Patient', ko: '환자' },
  selectPatient: { en: 'Select a patient', ko: '환자 선택' },
  preview: { en: 'Preview', ko: '미리보기' },
  documentPreview: { en: 'Document preview', ko: '문서 미리보기' },
  whatsIncluded: { en: 'What this report includes', ko: '보고서 포함 내용' },
  demographics: { en: 'Demographics', ko: '인구학적 정보' },
  latestVitals: { en: 'Latest vitals', ko: '최근 활력징후' },
  activeProblems: { en: 'Active problems', ko: '활성 문제' },
  nandaDx: { en: 'NANDA diagnoses', ko: 'NANDA 진단' },
  medications: { en: 'Active medications', ko: '활성 투약' },
  problemsCount: { en: 'problems', ko: '개 문제' },
  nandaCount: { en: 'diagnoses', ko: '개 진단' },
  medsCount: { en: 'medications', ko: '개 투약' },
  download: { en: 'Download PDF', ko: 'PDF 다운로드' },
  export: { en: 'Export', ko: '내보내기' },
  roundingLog: { en: 'Voice rounding records', ko: '음성 라운딩 기록' },
  roundingLogSub: {
    en: 'Signed AI-speaker rounds available for export',
    ko: '내보내기 가능한 서명된 AI 스피커 라운딩',
  },
  selected: { en: 'Selected round', ko: '선택된 라운딩' },
  questions: { en: 'questions', ko: '개 질문' },
  avgConfidence: { en: 'avg. confidence', ko: '평균 신뢰도' },
  noRounds: { en: 'No rounding records yet', ko: '라운딩 기록이 없습니다' },
  noRoundsDesc: {
    en: 'Completed voice rounds will appear here, ready to export as a signed PDF.',
    ko: '완료된 음성 라운딩이 이곳에 표시되며 서명된 PDF로 내보낼 수 있습니다.',
  },
  vitalsHr: { en: 'HR', ko: '맥박' },
  vitalsBp: { en: 'BP', ko: '혈압' },
  vitalsMap: { en: 'MAP', ko: '평균동맥압' },
  vitalsTemp: { en: 'Temp', ko: '체온' },
  vitalsSpo2: { en: 'SpO₂', ko: '산소포화도' },
  signed: { en: 'Signed', ko: '서명됨' },
  bedside: { en: 'AI-speaker bedside round', ko: 'AI 스피커 침상 라운딩' },
  fineprint: {
    en: 'Reports use synthetic data for demonstration only. All exported documents are English-language clinical records.',
    ko: '본 보고서는 데모용 합성 데이터를 사용합니다. 내보낸 모든 문서는 영문 임상 기록입니다.',
  },
  recordedBy: { en: 'Recorded by', ko: '기록자' },
  noSelection: { en: 'Choose a patient to preview the report.', ko: '환자를 선택하면 보고서를 미리볼 수 있습니다.' },
} satisfies Dictionary;

/* ------------------------------------------------------------------ */

type ReportKind = 'assessment' | 'rounding';

export function ReportsPage() {
  const theme = useTheme();
  const { lang } = useLang();
  const t = useScopedT(dict);
  const bi = useBilingual();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const patients = usePatients();
  const records = useAllRecords();
  const nurse = useCurrentNurse();
  const currentNurse = useAppStore((s) => s.currentNurse);

  const [kind, setKind] = useState<ReportKind>('assessment');

  /* --- assessment report state --- */
  const [patientId, setPatientId] = useState<string>(patients[0]?.id ?? '');
  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === patientId),
    [patients, patientId],
  );

  /* --- rounding report state --- */
  const roundingRecords = useMemo(
    () =>
      records
        .filter((r) => r.type === 'rounding' && r.session)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [records],
  );
  const patientById = useMemo(() => {
    const map = new Map<string, Patient>();
    patients.forEach((p) => map.set(p.id, p));
    return map;
  }, [patients]);

  const [recordId, setRecordId] = useState<string>(roundingRecords[0]?.id ?? '');
  const selectedRecord = useMemo(
    () => roundingRecords.find((r) => r.id === recordId) ?? roundingRecords[0],
    [roundingRecords, recordId],
  );

  /* --- live PDF previews (rebuilt only when the subject changes) --- */
  const assessmentPreviewUrl = useMemo(() => {
    if (!selectedPatient) return '';
    return buildPatientReport(selectedPatient).output('dataurlstring');
  }, [selectedPatient]);

  const roundingPatient = selectedRecord ? patientById.get(selectedRecord.patientId) : undefined;
  const roundingPreviewUrl = useMemo(() => {
    if (!selectedRecord?.session || !roundingPatient) return '';
    return buildRoundingReport(roundingPatient, selectedRecord.session, nurse.name).output(
      'dataurlstring',
    );
  }, [selectedRecord, roundingPatient, nurse.name]);

  const previewUrl = kind === 'assessment' ? assessmentPreviewUrl : roundingPreviewUrl;

  const handlePatientChange = (e: SelectChangeEvent) => setPatientId(e.target.value);

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        icon={<DescriptionOutlinedIcon />}
        actions={
          kind === 'assessment' ? (
            <Button
              variant="contained"
              startIcon={<DownloadRoundedIcon />}
              disabled={!selectedPatient}
              onClick={() => selectedPatient && downloadPatientReport(selectedPatient)}
            >
              {t('download')}
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<DownloadRoundedIcon />}
              disabled={!selectedRecord || !roundingPatient}
              onClick={() =>
                selectedRecord &&
                roundingPatient &&
                downloadRoundingReport(roundingPatient, selectedRecord, currentNurse.name)
              }
            >
              {t('download')}
            </Button>
          )
        }
      />

      {/* Report-type gallery ------------------------------------------------ */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          mb: 3,
        }}
      >
        <ReportTypeCard
          active={kind === 'assessment'}
          onClick={() => setKind('assessment')}
          icon={<AssignmentOutlinedIcon />}
          title={t('assessmentName')}
          description={t('assessmentDesc')}
          tags={[t('demographics'), t('latestVitals'), t('nandaDx'), t('medications')]}
        />
        <ReportTypeCard
          active={kind === 'rounding'}
          onClick={() => setKind('rounding')}
          icon={<GraphicEqRoundedIcon />}
          title={t('roundingName')}
          description={t('roundingDesc')}
          tags={[t('bedside'), 'STT', t('signed')]}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '5fr 7fr' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        {/* Left: source picker + structured summary --------------------- */}
        <Stack spacing={2} sx={{ minWidth: 0 }}>
          {kind === 'assessment' ? (
            <SectionCard
              title={t('whatsIncluded')}
              subtitle={t('assessmentName')}
              icon={<ListAltOutlinedIcon fontSize="small" />}
            >
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel id="report-patient-label">{t('patient')}</InputLabel>
                <Select
                  labelId="report-patient-label"
                  label={t('patient')}
                  value={selectedPatient ? patientId : ''}
                  onChange={handlePatientChange}
                  displayEmpty
                  renderValue={(value) => {
                    const p = patients.find((x) => x.id === value);
                    if (!p) return t('selectPatient');
                    return (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PatientAvatar initials={p.initials} acuity={p.acuity} size={26} />
                        <Typography variant="body2" noWrap>
                          {lang === 'ko' ? p.nameKo : p.name}
                          <Box component="span" className="tnum" sx={{ color: 'text.secondary', ml: 0.75 }}>
                            · {p.mrn}
                          </Box>
                        </Typography>
                      </Stack>
                    );
                  }}
                >
                  {patients.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ width: '100%' }}>
                        <PatientAvatar initials={p.initials} acuity={p.acuity} size={30} />
                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {lang === 'ko' ? p.nameKo : p.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap className="tnum">
                            {p.mrn} · {p.ward.code} {p.room}-{p.bed}
                          </Typography>
                        </Box>
                        <AcuityChip acuity={p.acuity} />
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedPatient ? (
                <AssessmentSummary patient={selectedPatient} t={t} bi={bi} lang={lang} />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('noSelection')}
                </Typography>
              )}
            </SectionCard>
          ) : (
            <SectionCard
              title={t('roundingLog')}
              subtitle={t('roundingLogSub')}
              icon={<GraphicEqRoundedIcon fontSize="small" />}
              action={
                roundingRecords.length ? (
                  <Chip
                    size="small"
                    label={roundingRecords.length}
                    className="tnum"
                    sx={{ fontWeight: 700 }}
                  />
                ) : undefined
              }
              disableContentPadding
            >
              {roundingRecords.length ? (
                <Stack divider={<Divider flexItem />}>
                  {roundingRecords.map((record) => {
                    const p = patientById.get(record.patientId);
                    if (!p) return null;
                    const active = record.id === selectedRecord?.id;
                    return (
                      <RoundingRow
                        key={record.id}
                        record={record}
                        patient={p}
                        active={active}
                        lang={lang}
                        exportLabel={t('export')}
                        onSelect={() => setRecordId(record.id)}
                        onExport={() => downloadRoundingReport(p, record, currentNurse.name)}
                      />
                    );
                  })}
                </Stack>
              ) : (
                <EmptyState
                  icon={<GraphicEqRoundedIcon />}
                  title={t('noRounds')}
                  description={t('noRoundsDesc')}
                />
              )}
            </SectionCard>
          )}
        </Stack>

        {/* Right: live PDF preview -------------------------------------- */}
        <SectionCard
          title={t('documentPreview')}
          subtitle={
            kind === 'assessment'
              ? selectedPatient
                ? `${selectedPatient.name} · ${selectedPatient.mrn}`
                : t('assessmentName')
              : roundingPatient && selectedRecord
                ? `${roundingPatient.name} · ${formatDateTime(selectedRecord.createdAt, lang)}`
                : t('roundingName')
          }
          icon={<PictureAsPdfOutlinedIcon fontSize="small" />}
          action={
            <Chip
              size="small"
              variant="outlined"
              color="primary"
              icon={<PictureAsPdfOutlinedIcon />}
              label="PDF · A4"
              sx={{ fontWeight: 600 }}
            />
          }
          contentSx={{ p: 0 }}
          disableContentPadding
        >
          {previewUrl ? (
            <Box
              sx={{
                p: { xs: 1, sm: 2 },
                bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.04 : 0.03),
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box
                component="iframe"
                key={previewUrl.slice(0, 64)}
                src={previewUrl}
                title={t('documentPreview')}
                sx={{
                  width: '100%',
                  height: { xs: 420, sm: 520 },
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  bgcolor: '#fff',
                  display: 'block',
                }}
              />
            </Box>
          ) : (
            <Box sx={{ p: 3 }}>
              <EmptyState
                icon={<PictureAsPdfOutlinedIcon />}
                title={kind === 'assessment' ? t('selectPatient') : t('noRounds')}
                description={kind === 'assessment' ? t('noSelection') : t('noRoundsDesc')}
              />
            </Box>
          )}

          <Divider />
          <Stack
            direction={isMobile ? 'column' : 'row'}
            spacing={1.5}
            alignItems={isMobile ? 'stretch' : 'center'}
            justifyContent="space-between"
            sx={{ px: 2.5, py: 1.75 }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
              <BadgeOutlinedIcon fontSize="small" />
              <Typography variant="caption">
                {t('recordedBy')}: {lang === 'ko' ? currentNurse.nameKo : currentNurse.name} ·{' '}
                {bi(currentNurse.role)} · {currentNurse.licenseNo}
              </Typography>
            </Stack>
            {kind === 'assessment' ? (
              <Button
                variant="contained"
                startIcon={<DownloadRoundedIcon />}
                disabled={!selectedPatient}
                onClick={() => selectedPatient && downloadPatientReport(selectedPatient)}
                fullWidth={isMobile}
              >
                {t('download')}
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<DownloadRoundedIcon />}
                disabled={!selectedRecord || !roundingPatient}
                onClick={() =>
                  selectedRecord &&
                  roundingPatient &&
                  downloadRoundingReport(roundingPatient, selectedRecord, currentNurse.name)
                }
                fullWidth={isMobile}
              >
                {t('download')}
              </Button>
            )}
          </Stack>
        </SectionCard>
      </Box>

      {/* fine print -------------------------------------------------------- */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ mt: 2.5, color: 'text.secondary' }}
      >
        <InfoOutlinedIcon sx={{ fontSize: 16 }} />
        <Typography variant="caption">{t('fineprint')}</Typography>
      </Stack>
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Report-type selectable card
 * ------------------------------------------------------------------ */
interface ReportTypeCardProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  tags: string[];
}

function ReportTypeCard({ active, onClick, icon, title, description, tags }: ReportTypeCardProps) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      sx={(theme) => ({
        cursor: 'pointer',
        position: 'relative',
        p: 2.5,
        borderRadius: 2,
        border: `1.5px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
        bgcolor: active ? alpha(theme.palette.primary.main, 0.06) : 'background.paper',
        transition: 'border-color .15s ease, background-color .15s ease, box-shadow .15s ease',
        boxShadow: active ? `0 0 0 1px ${theme.palette.primary.main}` : 'none',
        outline: 'none',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          bgcolor: alpha(theme.palette.primary.main, active ? 0.08 : 0.04),
        },
        '&:focus-visible': {
          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.5)}`,
        },
      })}
    >
      {active && (
        <CheckCircleRoundedIcon
          color="primary"
          sx={{ position: 'absolute', top: 14, right: 14, fontSize: 22 }}
        />
      )}
      <Stack direction="row" spacing={1.75} alignItems="flex-start">
        <Box
          sx={(theme) => ({
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            width: 46,
            height: 46,
            borderRadius: 2,
            color: 'primary.main',
            bgcolor: alpha(theme.palette.primary.main, 0.12),
          })}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0, pr: active ? 3 : 0 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                size="small"
                label={tag}
                variant="outlined"
                sx={{ fontWeight: 600, height: 22 }}
              />
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

/* ------------------------------------------------------------------ *
 * Assessment structured summary (mirrors what the PDF will contain)
 * ------------------------------------------------------------------ */
interface AssessmentSummaryProps {
  patient: Patient;
  t: (key: keyof typeof dict) => string;
  bi: (value: { en: string; ko: string } | undefined | null) => string;
  lang: 'en' | 'ko';
}

function AssessmentSummary({ patient, t, bi, lang }: AssessmentSummaryProps) {
  const v = patient.vitals[patient.vitals.length - 1];
  const activeMeds = patient.medications.filter((m) => m.status === 'active');

  return (
    <Stack spacing={2.25}>
      {/* identity row */}
      <Stack direction="row" spacing={1.5} alignItems="center">
        <PatientAvatar initials={patient.initials} acuity={patient.acuity} size={48} showStatusDot />
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {lang === 'ko' ? patient.nameKo : patient.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" className="tnum">
            {patient.mrn} · {patient.age}
            {lang === 'ko' ? '세' : 'y'} {patient.sex === 'male' ? 'M' : 'F'} ·{' '}
            {bi(patient.ward.name)} {patient.room}-{patient.bed}
          </Typography>
        </Box>
        <AcuityChip acuity={patient.acuity} />
      </Stack>

      {/* latest vitals strip */}
      <Box>
        <SubLabel icon={<MonitorHeartOutlinedIcon fontSize="inherit" />} label={t('latestVitals')} />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 1,
            mt: 1,
          }}
        >
          <VitalCell label={t('vitalsHr')} value={`${v.hr}`} unit="bpm" />
          <VitalCell label={t('vitalsBp')} value={`${v.sbp}/${v.dbp}`} unit="mmHg" />
          <VitalCell label={t('vitalsMap')} value={`${meanArterialPressure(v)}`} unit="mmHg" />
          <VitalCell label={t('vitalsTemp')} value={v.temp.toFixed(1)} unit="°C" />
          <VitalCell label={t('vitalsSpo2')} value={`${v.spo2}`} unit="%" />
        </Box>
      </Box>

      <Divider />

      {/* counts row */}
      <Stack direction="row" spacing={1.5}>
        <CountTile
          icon={<MedicationOutlinedIcon fontSize="small" />}
          value={patient.diagnoses.length}
          label={t('problemsCount')}
          sublabel={t('activeProblems')}
        />
        <CountTile
          icon={<PsychologyOutlinedIcon fontSize="small" />}
          value={patient.nanda.length}
          label={t('nandaCount')}
          sublabel={t('nandaDx')}
        />
        <CountTile
          icon={<MedicationOutlinedIcon fontSize="small" />}
          value={activeMeds.length}
          label={t('medsCount')}
          sublabel={t('medications')}
        />
      </Stack>

      {/* problems list */}
      <Box>
        <SubLabel icon={<ListAltOutlinedIcon fontSize="inherit" />} label={t('activeProblems')} />
        <Stack spacing={0.5} sx={{ mt: 0.75 }}>
          {patient.diagnoses.slice(0, 4).map((d) => (
            <Typography key={d.icd10} variant="body2" noWrap>
              <Box component="span" className="tnum" sx={{ color: 'text.secondary', mr: 1 }}>
                {d.icd10}
              </Box>
              {d.description}
            </Typography>
          ))}
        </Stack>
      </Box>

      {/* NANDA list */}
      {patient.nanda.length > 0 && (
        <Box>
          <SubLabel icon={<PsychologyOutlinedIcon fontSize="inherit" />} label={t('nandaDx')} />
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
            {patient.nanda.slice(0, 4).map((n) => (
              <Tooltip key={n.id} title={bi(n.domain)} arrow>
                <Chip
                  size="small"
                  variant="outlined"
                  label={
                    <Box component="span">
                      <Box component="span" className="tnum" sx={{ fontWeight: 700, mr: 0.5 }}>
                        {n.code}
                      </Box>
                      {bi(n.label)}
                    </Box>
                  }
                  sx={{ maxWidth: '100%' }}
                />
              </Tooltip>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}

function SubLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary' }}>
      <Box sx={{ display: 'flex', fontSize: 16 }}>{icon}</Box>
      <Typography variant="overline" sx={{ lineHeight: 1.4 }}>
        {label}
      </Typography>
    </Stack>
  );
}

function VitalCell({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <Box
      sx={(theme) => ({
        textAlign: 'center',
        py: 1,
        px: 0.5,
        borderRadius: 1.5,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
      })}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Typography variant="subtitle2" fontWeight={800} className="tnum" sx={{ lineHeight: 1.3 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem' }}>
        {unit}
      </Typography>
    </Box>
  );
}

function CountTile({
  icon,
  value,
  label,
  sublabel,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  sublabel: string;
}) {
  return (
    <Box
      sx={(theme) => ({
        flex: 1,
        p: 1.25,
        borderRadius: 1.5,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.primary.main, 0.03),
      })}
    >
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: 'primary.main' }}>
        {icon}
        <Typography variant="h5" fontWeight={800} className="tnum" sx={{ color: 'text.primary' }}>
          {value}
        </Typography>
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
        {sublabel}
      </Typography>
    </Box>
  );
}

/* ------------------------------------------------------------------ *
 * Rounding record list row
 * ------------------------------------------------------------------ */
interface RoundingRowProps {
  record: NursingRecord;
  patient: Patient;
  active: boolean;
  lang: 'en' | 'ko';
  exportLabel: string;
  onSelect: () => void;
  onExport: () => void;
}

function RoundingRow({
  record,
  patient,
  active,
  lang,
  exportLabel,
  onSelect,
  onExport,
}: RoundingRowProps) {
  const session = record.session as RoundingSession;
  const avgConfidence =
    session.answers.length > 0
      ? session.answers.reduce((sum, a) => sum + a.confidence, 0) / session.answers.length
      : 0;

  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      onClick={onSelect}
      sx={(theme) => ({
        px: 2.5,
        py: 1.5,
        cursor: 'pointer',
        bgcolor: active ? alpha(theme.palette.primary.main, 0.07) : 'transparent',
        borderLeft: `3px solid ${active ? theme.palette.primary.main : 'transparent'}`,
        transition: 'background-color .12s ease',
        '&:hover': { bgcolor: active ? alpha(theme.palette.primary.main, 0.09) : 'action.hover' },
      })}
    >
      <PatientAvatar initials={patient.initials} acuity={patient.acuity} size={36} />
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} noWrap>
            {lang === 'ko' ? patient.nameKo : patient.name}
          </Typography>
          {record.signed && (
            <VerifiedOutlinedIcon color="primary" sx={{ fontSize: 15, flexShrink: 0 }} />
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary" noWrap className="tnum">
          {timeAgo(record.createdAt, lang)} · {session.answers.length}
          {lang === 'ko' ? '문항' : 'q'} · {session.sttEngine} ·{' '}
          {formatNumber(avgConfidence * 100, lang, 0)}%
        </Typography>
      </Box>
      <Tooltip title={exportLabel} arrow>
        <Button
          size="small"
          variant={active ? 'contained' : 'outlined'}
          startIcon={<DownloadRoundedIcon />}
          onClick={(e) => {
            e.stopPropagation();
            onExport();
          }}
          sx={{ flexShrink: 0 }}
        >
          {exportLabel}
        </Button>
      </Tooltip>
    </Stack>
  );
}
