import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import { PatientAvatar } from '@/components';
import { useBilingual, useLang, useScopedT, type Dictionary } from '@/i18n/I18nProvider';
import { formatDateTime, secondsToClock } from '@/lib/format';
import type { NursingRecord, Patient } from '@/types/clinical';
import { RECORD_TYPE_META, RecordTypeChip, confidenceTone } from './recordsShared';

const dict = {
  patientRecord: { en: 'Patient', ko: '환자' },
  viewChart: { en: 'View chart', ko: '차트 보기' },
  charted: { en: 'Charted', ko: '기록 시각' },
  exportPdf: { en: 'Export PDF', ko: 'PDF 내보내기' },
  sign: { en: 'Sign record', ko: '서명' },
  signed: { en: 'Signed', ko: '서명 완료' },
  unsigned: { en: 'Awaiting signature', ko: '서명 대기' },
  signedBy: { en: 'Electronically signed', ko: '전자 서명됨' },
  sessionMeta: { en: 'Session', ko: '세션 정보' },
  engine: { en: 'STT engine', ko: '음성 인식 엔진' },
  locale: { en: 'Locale', ko: '로케일' },
  duration: { en: 'Duration', ko: '소요 시간' },
  questions: { en: 'Questions', ko: '질문 수' },
  qa: { en: 'Voice round transcript', ko: '음성 라운딩 기록' },
  prompt: { en: 'Prompt', ko: '질문' },
  transcript: { en: 'Transcript', ko: '음성 전사' },
  chartedAs: { en: 'Charted as', ko: '차트 반영' },
  conf: { en: 'Conf.', ko: '신뢰도' },
  subjective: { en: 'Subjective', ko: '주관적 자료 (S)' },
  objective: { en: 'Objective', ko: '객관적 자료 (O)' },
  assessment: { en: 'Assessment', ko: '사정 (A)' },
  plan: { en: 'Plan', ko: '계획 (P)' },
  narrativeNote: { en: 'Narrative note', ko: '서술 기록' },
  noBody: { en: 'No detailed content recorded for this entry.', ko: '이 기록에 상세 내용이 없습니다.' },
  by: { en: 'by', ko: '작성자' },
} satisfies Dictionary;

interface RecordDetailProps {
  record: NursingRecord;
  patient: Patient | undefined;
  nurseName: string;
  onSign: (id: string) => void;
  onExport: (record: NursingRecord) => void;
}

/** Read-only detail view for a single nursing record. */
export function RecordDetail({ record, patient, nurseName, onSign, onExport }: RecordDetailProps) {
  const theme = useTheme();
  const t = useScopedT(dict);
  const bi = useBilingual();
  const { lang } = useLang();
  const meta = RECORD_TYPE_META[record.type];

  return (
    <Stack spacing={2.5}>
      {/* Patient mini-header */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.75}
        sx={{
          p: 1.75,
          borderRadius: 2,
          bgcolor: 'action.hover',
          border: 1,
          borderColor: 'divider',
        }}
      >
        {patient && <PatientAvatar initials={patient.initials} acuity={patient.acuity} size={46} />}
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="subtitle1" fontWeight={800} noWrap>
            {patient ? (lang === 'ko' ? patient.nameKo : patient.name) : record.patientId}
          </Typography>
          {patient && (
            <Typography variant="caption" color="text.secondary" noWrap component="div">
              {bi(patient.ward.name)} · {patient.ward.code} · {t('patientRecord')} {patient.mrn} ·{' '}
              {lang === 'ko' ? `${patient.room}호 ${patient.bed}` : `Room ${patient.room} · Bed ${patient.bed}`}
            </Typography>
          )}
        </Box>
        {patient && (
          <Button
            component={RouterLink}
            to={`/patients/${patient.id}`}
            size="small"
            variant="outlined"
            sx={{ flexShrink: 0 }}
          >
            {t('viewChart')}
          </Button>
        )}
      </Stack>

      {/* Meta + actions row */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <RecordTypeChip type={record.type} label={lang === 'ko' ? meta.ko : meta.en} />
          <Chip size="small" variant="outlined" label={record.shift} />
          <Chip
            size="small"
            icon={
              record.signed ? (
                <VerifiedRoundedIcon fontSize="small" />
              ) : (
                <EditNoteRoundedIcon fontSize="small" />
              )
            }
            label={record.signed ? t('signed') : t('unsigned')}
            sx={{
              fontWeight: 700,
              color: record.signed ? theme.palette.success.main : theme.palette.warning.main,
              bgcolor: alpha(
                record.signed ? theme.palette.success.main : theme.palette.warning.main,
                0.12,
              ),
              '& .MuiChip-icon': { color: 'inherit' },
            }}
          />
        </Stack>
        <Stack direction="row" spacing={1}>
          {record.type === 'rounding' && record.session && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<PictureAsPdfOutlinedIcon />}
              onClick={() => onExport(record)}
            >
              {t('exportPdf')}
            </Button>
          )}
          {!record.signed && (
            <Button
              size="small"
              variant="contained"
              startIcon={<VerifiedRoundedIcon />}
              onClick={() => onSign(record.id)}
            >
              {t('sign')}
            </Button>
          )}
        </Stack>
      </Stack>

      <Typography variant="caption" color="text.secondary">
        {t('charted')}: {formatDateTime(record.createdAt, lang)} · {t('by')} {record.author}
      </Typography>

      <Divider />

      {/* Body */}
      {record.type === 'rounding' && record.session ? (
        <RoundingDetail record={record} />
      ) : record.type === 'SOAP' && record.soap ? (
        <SoapDetail soap={record.soap} />
      ) : record.narrative ? (
        <NarrativeDetail text={record.narrative} title={t('narrativeNote')} />
      ) : (
        <Typography variant="body2" color="text.secondary">
          {t('noBody')}
        </Typography>
      )}

      {record.signed && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ color: 'success.main', mt: 1 }}
        >
          <VerifiedRoundedIcon fontSize="small" />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {t('signedBy')} · {nurseName}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}

/* ----------------------------- rounding ----------------------------- */

function RoundingDetail({ record }: { record: NursingRecord }) {
  const theme = useTheme();
  const t = useScopedT(dict);
  const bi = useBilingual();
  const session = record.session!;

  const metaItems: Array<{ icon: JSX.Element; label: string; value: string }> = [
    { icon: <GraphicEqRoundedIcon fontSize="small" />, label: t('engine'), value: session.sttEngine },
    { icon: <LanguageRoundedIcon fontSize="small" />, label: t('locale'), value: session.locale },
    {
      icon: <TimerOutlinedIcon fontSize="small" />,
      label: t('duration'),
      value: secondsToClock(session.durationSec),
    },
    {
      icon: <HelpOutlineRoundedIcon fontSize="small" />,
      label: t('questions'),
      value: String(session.answers.length),
    },
  ];

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: 1.25,
        }}
      >
        {metaItems.map((m) => (
          <Box
            key={m.label}
            sx={{
              p: 1.25,
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: 'primary.main' }}>
              {m.icon}
              <Typography variant="caption" color="text.secondary" noWrap>
                {m.label}
              </Typography>
            </Stack>
            <Typography variant="body2" fontWeight={700} className="tnum" sx={{ mt: 0.5 }} noWrap>
              {m.value}
            </Typography>
          </Box>
        ))}
      </Box>

      <Typography variant="subtitle2" fontWeight={700}>
        {t('qa')}
      </Typography>

      <TableContainer
        sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflowX: 'auto' }}
      >
        <Table size="small" sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow sx={{ '& th': { bgcolor: 'action.hover', fontWeight: 700 } }}>
              <TableCell>{t('prompt')}</TableCell>
              <TableCell>{t('transcript')}</TableCell>
              <TableCell>{t('chartedAs')}</TableCell>
              <TableCell align="center">{t('conf')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {session.answers.map((a) => {
              const tone = confidenceTone(a.confidence);
              return (
                <TableRow key={a.questionId} sx={{ verticalAlign: 'top' }}>
                  <TableCell sx={{ width: '22%' }}>
                    <Typography variant="body2" fontWeight={600}>
                      {bi(a.prompt)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                      {a.category}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: '34%' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      “{a.transcript}”
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: '30%' }}>
                    <Typography variant="body2">{a.structured}</Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ width: '14%' }}>
                    <Chip
                      size="small"
                      label={`${Math.round(a.confidence * 100)}%`}
                      className="tnum"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette[tone].main,
                        bgcolor: alpha(theme.palette[tone].main, 0.12),
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

/* ------------------------------- SOAP ------------------------------- */

function SoapDetail({ soap }: { soap: NonNullable<NursingRecord['soap']> }) {
  const t = useScopedT(dict);
  const blocks: Array<{ key: string; label: string; value: string; letter: string }> = [
    { key: 's', label: t('subjective'), value: soap.subjective, letter: 'S' },
    { key: 'o', label: t('objective'), value: soap.objective, letter: 'O' },
    { key: 'a', label: t('assessment'), value: soap.assessment, letter: 'A' },
    { key: 'p', label: t('plan'), value: soap.plan, letter: 'P' },
  ];
  return (
    <Stack spacing={1.5}>
      {blocks.map((b) => (
        <Stack
          key={b.key}
          direction="row"
          spacing={1.5}
          sx={{
            p: 1.75,
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Box
            sx={(theme) => ({
              flexShrink: 0,
              width: 30,
              height: 30,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              color: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
            })}
          >
            {b.letter}
          </Box>
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.4 }}>
              {b.label}
            </Typography>
            <Typography variant="body2">{b.value}</Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

/* ----------------------------- narrative ---------------------------- */

function NarrativeDetail({ text, title }: { text: string; title: string }) {
  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
        {text}
      </Typography>
    </Box>
  );
}
