import { Box, Stack, Typography, useTheme } from '@mui/material';
import { alpha, keyframes, type Theme } from '@mui/material/styles';
import RecordVoiceOverRoundedIcon from '@mui/icons-material/RecordVoiceOverRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SpeakerRoundedIcon from '@mui/icons-material/SpeakerRounded';
import type { Dictionary } from '@/i18n/I18nProvider';
import { useScopedT } from '@/i18n/I18nProvider';

export type StagePhase = 'idle' | 'speaking' | 'listening' | 'captured' | 'complete';

interface AISpeakerStageProps {
  phase: StagePhase;
  /** Index of the active question (0-based) and total count, for the caption. */
  current: number;
  total: number;
}

const dict = {
  ready: { en: 'AI speaker on standby', ko: 'AI 스피커 대기 중' },
  readyHint: { en: 'Press Start to begin the bedside interview', ko: '회진을 시작하려면 시작을 누르세요' },
  asking: { en: 'AI speaker is asking…', ko: 'AI 스피커가 질문 중…' },
  listening: { en: 'Listening to the patient…', ko: '환자 응답을 듣는 중…' },
  captured: { en: 'Response captured', ko: '응답 기록 완료' },
  complete: { en: 'Round complete', ko: '회진 완료' },
  completeHint: { en: 'All responses transcribed and charted', ko: '모든 응답이 전사·기록되었습니다' },
  question: { en: 'Question', ko: '질문' },
  of: { en: 'of', ko: '/' },
} satisfies Dictionary;

/** Soft, slow breathing animation applied to the speaker disc while idle/active. */
const breathe = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
`;

/** Equalizer-style bars used during the listening phase. */
const bar = keyframes`
  0%, 100% { transform: scaleY(0.35); }
  50% { transform: scaleY(1); }
`;

function phaseColor(theme: Theme, phase: StagePhase): string {
  switch (phase) {
    case 'speaking':
      return theme.palette.primary.main;
    case 'listening':
      return theme.palette.info.main;
    case 'captured':
    case 'complete':
      return theme.palette.success.main;
    default:
      return theme.palette.text.secondary;
  }
}

/**
 * The animated "AI speaker" centerpiece. The disc renders concentric CSS pulse
 * rings (via the shared @keyframes mv-pulse-ring) whose color and motion follow
 * the rounding state machine, with an equalizer overlay while listening.
 */
export function AISpeakerStage({ phase, current, total }: AISpeakerStageProps) {
  const theme = useTheme();
  const t = useScopedT(dict);
  const color = phaseColor(theme, phase);
  const active = phase === 'speaking' || phase === 'listening';

  const Icon =
    phase === 'listening'
      ? MicRoundedIcon
      : phase === 'captured'
        ? CheckCircleRoundedIcon
        : phase === 'complete'
          ? CheckCircleRoundedIcon
          : phase === 'idle'
            ? SpeakerRoundedIcon
            : RecordVoiceOverRoundedIcon;

  const headline =
    phase === 'speaking'
      ? t('asking')
      : phase === 'listening'
        ? t('listening')
        : phase === 'captured'
          ? t('captured')
          : phase === 'complete'
            ? t('complete')
            : t('ready');

  const hint =
    phase === 'complete' ? t('completeHint') : phase === 'idle' ? t('readyHint') : null;

  return (
    <Stack alignItems="center" spacing={2.5} sx={{ py: { xs: 2, md: 1 } }}>
      <Box
        sx={{
          position: 'relative',
          width: { xs: 156, md: 184 },
          height: { xs: 156, md: 184 },
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {/* Pulse rings — three staggered concentric rings while active. */}
        {active &&
          [0, 0.6, 1.2].map((delay) => (
            <Box
              key={delay}
              aria-hidden
              sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: `2px solid ${color}`,
                animation: 'mv-pulse-ring 2.1s ease-out infinite',
                animationDelay: `${delay}s`,
              }}
            />
          ))}

        {/* Static halo glow. */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 8,
            borderRadius: '50%',
            background: `radial-gradient(circle at 50% 35%, ${alpha(color, 0.28)}, ${alpha(
              color,
              0,
            )} 70%)`,
          }}
        />

        {/* The speaker disc. */}
        <Box
          sx={{
            position: 'relative',
            width: { xs: 110, md: 128 },
            height: { xs: 110, md: 128 },
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            color: theme.palette.getContrastText(color),
            background: `linear-gradient(150deg, ${color}, ${alpha(color, 0.78)})`,
            boxShadow: `0 12px 30px ${alpha(color, 0.4)}, inset 0 1px 2px ${alpha('#ffffff', 0.4)}`,
            animation: active ? `${breathe} 2.6s ease-in-out infinite` : 'none',
          }}
        >
          {phase === 'listening' ? (
            <Stack direction="row" spacing={0.6} alignItems="center" sx={{ height: 40 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Box
                  key={i}
                  sx={{
                    width: 5,
                    height: 36,
                    borderRadius: 3,
                    bgcolor: 'currentColor',
                    transformOrigin: 'center',
                    animation: `${bar} 0.9s ease-in-out infinite`,
                    animationDelay: `${i * 0.12}s`,
                  }}
                />
              ))}
            </Stack>
          ) : (
            <Icon sx={{ fontSize: { xs: 44, md: 52 } }} />
          )}
        </Box>
      </Box>

      <Stack alignItems="center" spacing={0.5} sx={{ textAlign: 'center' }}>
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color }}>
          {phase === 'speaking' && <GraphicEqRoundedIcon sx={{ fontSize: 18 }} />}
          <Typography variant="h6" fontWeight={800}>
            {headline}
          </Typography>
        </Stack>
        {hint ? (
          <Typography variant="body2" color="text.secondary">
            {hint}
          </Typography>
        ) : (
          total > 0 &&
          phase !== 'complete' && (
            <Typography variant="caption" color="text.secondary" className="tnum">
              {t('question')} {Math.min(current + 1, total)} {t('of')} {total}
            </Typography>
          )
        )}
      </Stack>
    </Stack>
  );
}
