import { Alert, Box, Card, Chip, Divider, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import { PatientAvatar } from '@/components/PatientAvatar';
import { AcuityChip, FlagChip } from '@/components/chips';
import { useBilingual, useLang, useScopedT } from '@/i18n/I18nProvider';
import { formatDate } from '@/lib/format';
import { bmiCategory } from '@/lib/clinical';
import type { Patient } from '@/types/clinical';
import { detailDict } from './dict';

interface PatientBannerProps {
  patient: Patient;
}

function MetaItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.4 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} noWrap>
        {value}
      </Typography>
    </Box>
  );
}

export function PatientBanner({ patient }: PatientBannerProps) {
  const t = useScopedT(detailDict);
  const bilingual = useBilingual();
  const { lang } = useLang();

  const bmiCat = bmiCategory(patient.bmi);
  const severeAllergy = patient.allergies.some((a) => a.severity === 'severe');

  return (
    <Card sx={{ overflow: 'hidden' }}>
      <Box
        sx={(theme) => ({
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 2.5 },
          pb: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
            theme.palette.primary.main,
            0,
          )} 60%)`,
        })}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 2, sm: 2.5 }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          <PatientAvatar initials={patient.initials} acuity={patient.acuity} size={64} showStatusDot />
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Stack direction="row" spacing={1.25} alignItems="baseline" flexWrap="wrap" useFlexGap>
              <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>
                {patient.name}
              </Typography>
              <Typography variant="h6" color="text.secondary" fontWeight={600}>
                {patient.nameKo}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
              sx={{ mt: 0.75 }}
            >
              <AcuityChip acuity={patient.acuity} />
              <Chip
                size="small"
                variant="outlined"
                icon={<LocalHospitalOutlinedIcon sx={{ fontSize: 16 }} />}
                label={`${bilingual(patient.ward.name)} · ${bilingual(patient.ward.specialty)}`}
              />
              <Chip
                size="small"
                variant="outlined"
                label={`${patient.codeStatus}`}
                color={patient.codeStatus === 'Full Code' ? 'default' : 'error'}
              />
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Divider />

      <Box sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              sm: 'repeat(3, minmax(0, 1fr))',
              md: 'repeat(6, minmax(0, 1fr))',
            },
            columnGap: 2,
            rowGap: 1.75,
          }}
        >
          <MetaItem label={t('mrn')} value={<span className="tnum mono">{patient.mrn}</span>} />
          <MetaItem
            label={t('ageSex')}
            value={
              <span className="tnum">
                {patient.age} · {patient.sex === 'male' ? t('male') : t('female')}
              </span>
            }
          />
          <MetaItem
            label={t('location')}
            value={`${patient.ward.code} · ${patient.room}-${patient.bed}`}
          />
          <MetaItem label={t('attending')} value={patient.attending} />
          <MetaItem
            label={t('los')}
            value={
              <span className="tnum">
                {patient.lengthOfStayDays} {t('losDays')}
              </span>
            }
          />
          <MetaItem label={t('admitted')} value={formatDate(patient.admittedAt, lang)} />
          <MetaItem label={t('isolation')} value={patient.isolation} />
          <MetaItem label={t('diet')} value={patient.diet} />
          <MetaItem label={t('mobility')} value={patient.mobility} />
          <MetaItem
            label={t('bloodType')}
            value={<span className="tnum">{patient.bloodType}</span>}
          />
          <MetaItem
            label={t('bmi')}
            value={
              <Stack direction="row" spacing={0.75} alignItems="baseline">
                <span className="tnum">{patient.bmi.toFixed(1)}</span>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={(theme) => ({
                    color:
                      bmiCat.tone === 'normal'
                        ? theme.palette.success.main
                        : bmiCat.tone === 'low'
                          ? theme.palette.info.main
                          : bmiCat.tone === 'high'
                            ? theme.palette.warning.main
                            : theme.palette.error.main,
                  })}
                >
                  {bmiCat.label}
                </Typography>
              </Stack>
            }
          />
          <MetaItem label={t('primaryNurse')} value={patient.primaryNurse} />
        </Box>

        <Box sx={{ mt: 2 }}>
          {patient.allergies.length > 0 ? (
            <Alert
              severity={severeAllergy ? 'error' : 'warning'}
              icon={<WarningAmberRoundedIcon />}
              sx={{ alignItems: 'center', py: 0.5 }}
            >
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                <Typography variant="body2" fontWeight={700} component="span">
                  {t('allergies')}:
                </Typography>
                {patient.allergies.map((a) => (
                  <Chip
                    key={a.allergen}
                    size="small"
                    color={a.severity === 'severe' ? 'error' : 'warning'}
                    label={`${a.allergen} · ${a.reaction}`}
                    sx={{ fontWeight: 700 }}
                  />
                ))}
              </Stack>
            </Alert>
          ) : (
            <Alert
              severity="success"
              icon={<HealthAndSafetyOutlinedIcon />}
              sx={{ py: 0.5, '& .MuiAlert-message': { fontWeight: 700 } }}
            >
              {t('nkda')}
            </Alert>
          )}
        </Box>

        {patient.flags.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
            {patient.flags.map((flag) => (
              <FlagChip key={flag} label={flag} />
            ))}
          </Stack>
        )}
      </Box>
    </Card>
  );
}
