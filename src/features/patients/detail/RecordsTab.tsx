import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { SectionCard } from '@/components/SectionCard';
import { EmptyState } from '@/components/EmptyState';
import { useAllRecords } from '@/store/useAppStore';
import { useBilingual, useLang, useScopedT } from '@/i18n/I18nProvider';
import { formatDateTime, secondsToClock, timeAgo } from '@/lib/format';
import type { NursingRecord, Patient } from '@/types/clinical';
import { detailDict } from './dict';

interface RecordsTabProps {
  patient: Patient;
}

function recordTypeLabel(
  type: NursingRecord['type'],
  t: (k: 'recRounding' | 'recSOAP' | 'recNarrative' | 'recAssessment') => string,
) {
  switch (type) {
    case 'rounding':
      return t('recRounding');
    case 'SOAP':
      return t('recSOAP');
    case 'narrative':
      return t('recNarrative');
    default:
      return t('recAssessment');
  }
}

function SoapField({ label, value }: { label: string; value: string }) {
  return (
    <Grid item xs={12} sm={6}>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Grid>
  );
}

function RecordCard({ record }: { record: NursingRecord }) {
  const t = useScopedT(detailDict);
  const bilingual = useBilingual();
  const { lang } = useLang();
  const isVoice = record.type === 'rounding';

  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={(theme) => ({
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        '&::before': { display: 'none' },
        overflow: 'hidden',
      })}
    >
      <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: '100%', pr: 1 }}
          flexWrap="wrap"
          useFlexGap
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <Box
              sx={(theme) => ({
                width: 36,
                height: 36,
                borderRadius: 1.5,
                display: 'grid',
                placeItems: 'center',
                color: isVoice ? theme.palette.primary.main : theme.palette.secondary.main,
                bgcolor: alpha(isVoice ? theme.palette.primary.main : theme.palette.secondary.main, 0.12),
              })}
            >
              {isVoice ? (
                <RecordVoiceOverOutlinedIcon fontSize="small" />
              ) : (
                <DescriptionOutlinedIcon fontSize="small" />
              )}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700}>
                {recordTypeLabel(record.type, t)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {record.author} · {formatDateTime(record.createdAt, lang)} · {timeAgo(record.createdAt, lang)}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip size="small" variant="outlined" label={record.shift} />
            {record.signed ? (
              <Chip
                size="small"
                color="success"
                icon={<VerifiedRoundedIcon />}
                label={t('signed')}
                sx={{ fontWeight: 700 }}
              />
            ) : (
              <Chip size="small" color="warning" variant="outlined" label={t('unsigned')} />
            )}
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>
        <Divider sx={{ mb: 2 }} />
        {record.soap && (
          <Grid container spacing={2}>
            <SoapField label={t('subjective')} value={record.soap.subjective} />
            <SoapField label={t('objective')} value={record.soap.objective} />
            <SoapField label={t('assessmentSoap')} value={record.soap.assessment} />
            <SoapField label={t('plan')} value={record.soap.plan} />
          </Grid>
        )}
        {record.narrative && <Typography variant="body2">{record.narrative}</Typography>}
        {record.session && (
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                variant="outlined"
                label={`${t('engine')}: ${record.session.sttEngine}`}
              />
              <Chip
                size="small"
                variant="outlined"
                label={`${t('duration')}: ${secondsToClock(record.session.durationSec)}`}
              />
              <Chip size="small" variant="outlined" label={record.session.locale} />
            </Stack>
            <Stack spacing={1.25}>
              {record.session.answers.map((a) => (
                <Box
                  key={a.questionId}
                  sx={(theme) => ({
                    p: 1.5,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: theme.palette.action.hover,
                  })}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={1}>
                    <Typography variant="caption" color="primary.main" fontWeight={700}>
                      {bilingual(a.prompt)}
                    </Typography>
                    <Chip
                      size="small"
                      variant="outlined"
                      color="success"
                      label={`${t('confidence')} ${Math.round(a.confidence * 100)}%`}
                      sx={{ height: 20 }}
                    />
                  </Stack>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    “{a.transcript}”
                  </Typography>
                  {a.structured && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {t('structuredEntry')}: {a.structured}
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          </Stack>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export function RecordsTab({ patient }: RecordsTabProps) {
  const t = useScopedT(detailDict);
  const allRecords = useAllRecords();

  const records = allRecords
    .filter((r) => r.patientId === patient.id)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return (
    <SectionCard title={t('recordsTitle')} subtitle={t('recordsSubtitle')} icon={<DescriptionOutlinedIcon fontSize="small" />}>
      {records.length === 0 ? (
        <EmptyState
          icon={<DescriptionOutlinedIcon />}
          title={t('noRecords')}
          description={t('noRecordsDesc')}
        />
      ) : (
        <Stack spacing={1.5}>
          {records.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))}
        </Stack>
      )}
    </SectionCard>
  );
}
