import { Box, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import AccessibilityNewOutlinedIcon from '@mui/icons-material/AccessibilityNewOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined';
import { SectionCard } from '@/components/SectionCard';
import { useScopedT } from '@/i18n/I18nProvider';
import type { AssessmentScales, Patient } from '@/types/clinical';
import { detailDict } from './dict';

interface AssessmentTabProps {
  patient: Patient;
}

type RiskTone = 'success' | 'info' | 'warning' | 'error';

const TONE_PALETTE: Record<RiskTone, (m: 'main') => string> = {
  success: () => 'success.main',
  info: () => 'info.main',
  warning: () => 'warning.main',
  error: () => 'error.main',
};

function ScoreCard({
  title,
  subtitle,
  icon,
  score,
  max,
  riskLabel,
  riskTone,
  detail,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  score: number;
  max: number;
  riskLabel: string;
  riskTone: RiskTone;
  detail: React.ReactNode;
}) {
  const t = useScopedT(detailDict);
  return (
    <SectionCard title={title} subtitle={subtitle} icon={icon}>
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="flex-end" justifyContent="space-between">
          <Stack direction="row" alignItems="baseline" spacing={0.5}>
            <Typography variant="h3" fontWeight={800} className="tnum">
              {score}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
              / {max}
            </Typography>
          </Stack>
          <Stack alignItems="flex-end">
            <Typography variant="overline" color="text.secondary" lineHeight={1}>
              {t('riskLabel')}
            </Typography>
            <Typography
              variant="subtitle1"
              fontWeight={800}
              sx={{ color: TONE_PALETTE[riskTone]('main'), textTransform: 'capitalize' }}
            >
              {riskLabel}
            </Typography>
          </Stack>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, (score / max) * 100)}
          color={riskTone}
          sx={{ height: 10 }}
        />
        <Box>{detail}</Box>
      </Stack>
    </SectionCard>
  );
}

function SubScores({ rows }: { rows: Array<{ label: string; value: number }> }) {
  return (
    <Stack spacing={0.5} sx={{ mt: 0.5 }}>
      {rows.map((r) => (
        <Stack key={r.label} direction="row" justifyContent="space-between">
          <Typography variant="caption" color="text.secondary">
            {r.label}
          </Typography>
          <Typography variant="caption" fontWeight={700} className="tnum">
            {r.value}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

function bradenTone(risk: AssessmentScales['braden']['risk']): RiskTone {
  if (risk === 'severe' || risk === 'high') return 'error';
  if (risk === 'moderate') return 'warning';
  if (risk === 'mild') return 'info';
  return 'success';
}

function morseTone(risk: AssessmentScales['morse']['risk']): RiskTone {
  if (risk === 'high') return 'error';
  if (risk === 'moderate') return 'warning';
  return 'success';
}

function gcsTone(total: number): RiskTone {
  if (total <= 8) return 'error';
  if (total <= 12) return 'warning';
  if (total <= 14) return 'info';
  return 'success';
}

function painTone(pain: number): RiskTone {
  if (pain >= 7) return 'error';
  if (pain >= 4) return 'warning';
  if (pain >= 1) return 'info';
  return 'success';
}

export function AssessmentTab({ patient }: AssessmentTabProps) {
  const t = useScopedT(detailDict);
  const { braden, morse, gcs, pain } = patient.scales;

  const gcsRiskLabel =
    gcs.total <= 8
      ? t('severePain')
      : gcs.total <= 12
        ? t('moderatePain')
        : gcs.total <= 14
          ? t('mildPain')
          : t('newsLow');

  const painLabel =
    pain >= 7 ? t('severePain') : pain >= 4 ? t('moderatePain') : pain >= 1 ? t('mildPain') : t('noPain');

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} sm={6} lg={3}>
        <ScoreCard
          title={t('braden')}
          subtitle={t('bradenSub')}
          icon={<ShieldOutlinedIcon fontSize="small" />}
          score={braden.total}
          max={23}
          riskLabel={braden.risk}
          riskTone={bradenTone(braden.risk)}
          detail={
            <SubScores
              rows={[
                { label: 'Sensory', value: braden.sensoryPerception },
                { label: 'Moisture', value: braden.moisture },
                { label: 'Activity', value: braden.activity },
                { label: 'Mobility', value: braden.mobility },
                { label: 'Nutrition', value: braden.nutrition },
                { label: 'Friction/Shear', value: braden.frictionShear },
              ]}
            />
          }
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={3}>
        <ScoreCard
          title={t('morse')}
          subtitle={t('morseSub')}
          icon={<AccessibilityNewOutlinedIcon fontSize="small" />}
          score={morse.total}
          max={125}
          riskLabel={morse.risk}
          riskTone={morseTone(morse.risk)}
          detail={
            <SubScores
              rows={[
                { label: 'History of falls', value: morse.history },
                { label: 'Secondary dx', value: morse.secondaryDiagnosis },
                { label: 'Ambulatory aid', value: morse.ambulatoryAid },
                { label: 'IV / heparin lock', value: morse.ivTherapy },
                { label: 'Gait', value: morse.gait },
                { label: 'Mental status', value: morse.mentalStatus },
              ]}
            />
          }
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={3}>
        <ScoreCard
          title={t('gcs')}
          subtitle={t('gcsSub')}
          icon={<RemoveRedEyeOutlinedIcon fontSize="small" />}
          score={gcs.total}
          max={15}
          riskLabel={gcsRiskLabel}
          riskTone={gcsTone(gcs.total)}
          detail={
            <SubScores
              rows={[
                { label: `${t('eye')} (E)`, value: gcs.eye },
                { label: `${t('verbal')} (V)`, value: gcs.verbal },
                { label: `${t('motor')} (M)`, value: gcs.motor },
              ]}
            />
          }
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={3}>
        <SectionCard title={t('painScale')} subtitle={t('painSub')} icon={<HealingOutlinedIcon fontSize="small" />}>
          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="flex-end" justifyContent="space-between">
              <Stack direction="row" alignItems="baseline" spacing={0.5}>
                <Typography variant="h3" fontWeight={800} className="tnum">
                  {pain}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
                  / 10
                </Typography>
              </Stack>
              <Typography
                variant="subtitle1"
                fontWeight={800}
                sx={{ color: TONE_PALETTE[painTone(pain)]('main') }}
              >
                {painLabel}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5}>
              {Array.from({ length: 11 }, (_, i) => i).map((i) => (
                <Box
                  key={i}
                  sx={(theme) => {
                    const active = i <= pain;
                    const color =
                      i >= 7 ? theme.palette.error.main : i >= 4 ? theme.palette.warning.main : theme.palette.success.main;
                    return {
                      flex: 1,
                      height: 24,
                      borderRadius: 0.75,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: active ? '#fff' : theme.palette.text.secondary,
                      bgcolor: active ? color : alpha(color, 0.12),
                    };
                  }}
                  className="tnum"
                >
                  {i}
                </Box>
              ))}
            </Stack>
          </Stack>
        </SectionCard>
      </Grid>
    </Grid>
  );
}
