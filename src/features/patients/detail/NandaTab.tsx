import { Box, Card, Chip, Divider, Grid, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { PriorityChip } from '@/components/chips';
import { useBilingual, useLang, useScopedT } from '@/i18n/I18nProvider';
import { formatDate } from '@/lib/format';
import type { NandaDiagnosis, Patient } from '@/types/clinical';
import { detailDict } from './dict';

interface NandaTabProps {
  patient: Patient;
}

function ChipList({ items, color }: { items: string[]; color: 'primary' | 'secondary' }) {
  return (
    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
      {items.map((item) => (
        <Chip
          key={item}
          size="small"
          label={item}
          variant="outlined"
          color={color}
          sx={{ fontWeight: 600 }}
        />
      ))}
    </Stack>
  );
}

function LinkageNode({
  icon,
  label,
  code,
  text,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  code: string;
  text: string;
  tone: 'primary' | 'secondary' | 'success';
}) {
  return (
    <Box
      sx={(theme) => ({
        flex: 1,
        minWidth: 0,
        p: 1.5,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette[tone].main, 0.3)}`,
        bgcolor: alpha(theme.palette[tone].main, 0.06),
      })}
    >
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: `${tone}.main`, mb: 0.5 }}>
        {icon}
        <Typography variant="overline" fontWeight={700} lineHeight={1}>
          {label}
        </Typography>
      </Stack>
      <Typography variant="caption" color="text.secondary" className="mono" display="block">
        {code}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {text}
      </Typography>
    </Box>
  );
}

function NandaCard({ nanda }: { nanda: NandaDiagnosis }) {
  const t = useScopedT(detailDict);
  const bilingual = useBilingual();
  const { lang } = useLang();

  return (
    <Card sx={{ p: { xs: 2, sm: 2.5 }, opacity: nanda.status === 'resolved' ? 0.7 : 1 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1.5}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
          <Box
            sx={(theme) => ({
              px: 1,
              py: 0.5,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
              fontWeight: 800,
              fontSize: '0.85rem',
            })}
            className="mono"
          >
            {nanda.code}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              {bilingual(nanda.label)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('domain')}: {bilingual(nanda.domain)} · {t('identified')} {formatDate(nanda.identifiedAt, lang)}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
          <PriorityChip priority={nanda.priority} />
          <Chip
            size="small"
            icon={nanda.status === 'resolved' ? <CheckCircleOutlineRoundedIcon /> : undefined}
            color={nanda.status === 'active' ? 'info' : 'success'}
            variant="outlined"
            label={nanda.status}
            sx={{ textTransform: 'capitalize' }}
          />
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="overline" color="text.secondary">
            {t('definingChars')}
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <ChipList items={nanda.definingCharacteristics} color="primary" />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="overline" color="text.secondary">
            {t('relatedFactors')}
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <ChipList items={nanda.relatedFactors} color="secondary" />
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1}
        alignItems={{ xs: 'stretch', md: 'center' }}
      >
        <LinkageNode
          tone="primary"
          icon={<FlagOutlinedIcon sx={{ fontSize: 16 }} />}
          label="NANDA-I"
          code={nanda.code}
          text={bilingual(nanda.label)}
        />
        <Box sx={{ display: { xs: 'none', md: 'flex' }, color: 'text.secondary' }}>
          <ArrowForwardRoundedIcon />
        </Box>
        <LinkageNode
          tone="success"
          icon={<TrackChangesOutlinedIcon sx={{ fontSize: 16 }} />}
          label={t('nocOutcome')}
          code={nanda.noc.code}
          text={bilingual(nanda.noc.label)}
        />
        <Box sx={{ display: { xs: 'none', md: 'flex' }, color: 'text.secondary' }}>
          <ArrowForwardRoundedIcon />
        </Box>
        <Box
          sx={(theme) => ({
            flex: 1,
            minWidth: 0,
            p: 1.5,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
            bgcolor: alpha(theme.palette.secondary.main, 0.06),
          })}
        >
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: 'secondary.main', mb: 0.5 }}>
            <HealingOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography variant="overline" fontWeight={700} lineHeight={1}>
              {t('nicInterventions')}
            </Typography>
          </Stack>
          <Stack spacing={0.5}>
            {nanda.nic.map((n) => (
              <Stack key={n.code} direction="row" spacing={0.75} alignItems="baseline">
                <Typography variant="caption" className="mono" color="text.secondary" sx={{ flexShrink: 0 }}>
                  {n.code}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {bilingual(n.label)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}

export function NandaTab({ patient }: NandaTabProps) {
  const t = useScopedT(detailDict);

  const sorted = [...patient.nanda].sort(
    (a, b) => (a.status === 'active' ? 0 : 1) - (b.status === 'active' ? 0 : 1),
  );

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" spacing={1} alignItems="center">
        <PsychologyOutlinedIcon color="primary" fontSize="small" />
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {t('nandaTitle')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('nandaSubtitle')}
          </Typography>
        </Box>
      </Stack>
      {sorted.map((n) => (
        <NandaCard key={n.id} nanda={n} />
      ))}
    </Stack>
  );
}
