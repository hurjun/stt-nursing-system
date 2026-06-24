import { Box, Chip, LinearProgress, Stack, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import QuestionAnswerRoundedIcon from '@mui/icons-material/QuestionAnswerRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import type { Dictionary } from '@/i18n/I18nProvider';
import { useBilingual, useScopedT } from '@/i18n/I18nProvider';
import type { RoundingAnswer } from '@/types/clinical';

interface TranscriptEntryProps {
  index: number;
  answer: RoundingAnswer;
  /** Live transcript still being streamed in (simulation/live), if active. */
  streaming?: string;
  /** When true this row is the active capture and shows a pending state. */
  pending?: boolean;
}

const dict = {
  patientSays: { en: 'Patient', ko: '환자 응답' },
  chartedAs: { en: 'Charted as', ko: '기록 내용' },
  confidence: { en: 'STT confidence', ko: '인식 정확도' },
  capturing: { en: 'Capturing…', ko: '인식 중…' },
} satisfies Dictionary;

function confidenceColor(conf: number): 'success' | 'warning' | 'error' {
  if (conf >= 0.85) return 'success';
  if (conf >= 0.6) return 'warning';
  return 'error';
}

/** A single Q/A row in the live transcript log: prompt, raw transcript, confidence, chart line. */
export function TranscriptEntry({ index, answer, streaming, pending }: TranscriptEntryProps) {
  const theme = useTheme();
  const b = useBilingual();
  const t = useScopedT(dict);
  const confPct = Math.round(answer.confidence * 100);
  const confTone = confidenceColor(answer.confidence);
  const transcript = streaming ?? answer.transcript;

  return (
    <Box
      sx={{
        position: 'relative',
        pl: 2.5,
        py: 1.75,
        animation: 'mv-fade-in 0.35s ease-out',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          borderRadius: 3,
          bgcolor: pending ? 'info.main' : 'primary.main',
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
        <Box
          sx={{
            display: 'grid',
            placeItems: 'center',
            width: 22,
            height: 22,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: 'primary.main',
            fontSize: 12,
            fontWeight: 800,
          }}
          className="tnum"
        >
          {index + 1}
        </Box>
        <QuestionAnswerRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
        <Typography variant="subtitle2" fontWeight={700} sx={{ minWidth: 0 }}>
          {b(answer.prompt)}
        </Typography>
      </Stack>

      {/* Raw transcript */}
      <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1, pl: 0.25 }}>
        <FormatQuoteRoundedIcon sx={{ fontSize: 16, color: 'text.disabled', mt: 0.25 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1 }}>
            {t('patientSays')}
          </Typography>
          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
            {transcript || '—'}
            {pending && (
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  width: '0.5ch',
                  ml: 0.25,
                  bgcolor: 'info.main',
                  animation: 'mv-fade-in 0.6s ease-in-out infinite alternate',
                }}
              >
                &nbsp;
              </Box>
            )}
          </Typography>
        </Box>
      </Stack>

      {/* Confidence */}
      {!pending && (
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1, pl: 0.25 }}>
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 96 }}>
            {t('confidence')}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={confPct}
            color={confTone}
            sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
          />
          <Typography variant="caption" fontWeight={700} className="tnum" color={`${confTone}.main`}>
            {confPct}%
          </Typography>
        </Stack>
      )}

      {/* Charted normalization */}
      {!pending && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            mt: 0.5,
            px: 1.25,
            py: 0.85,
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.success.main, 0.1),
            border: `1px solid ${alpha(theme.palette.success.main, 0.28)}`,
          }}
        >
          <AssignmentTurnedInRoundedIcon sx={{ fontSize: 18, color: 'success.main' }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" color="success.main" sx={{ lineHeight: 1 }}>
              {t('chartedAs')}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {answer.structured}
            </Typography>
          </Box>
          <Chip
            size="small"
            label={answer.category}
            sx={{ ml: 'auto', textTransform: 'capitalize', flexShrink: 0 }}
          />
        </Stack>
      )}
    </Box>
  );
}
