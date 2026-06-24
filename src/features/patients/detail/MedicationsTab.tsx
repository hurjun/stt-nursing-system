import {
  Box,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  type ChipProps,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { SectionCard } from '@/components/SectionCard';
import { useLang, useScopedT } from '@/i18n/I18nProvider';
import { formatTime, dueIn } from '@/lib/format';
import type { MarEntry, Medication, Patient } from '@/types/clinical';
import { detailDict } from './dict';

interface MedicationsTabProps {
  patient: Patient;
}

const medStatusColor: Record<Medication['status'], ChipProps['color']> = {
  active: 'success',
  held: 'warning',
  discontinued: 'default',
};

const marMeta: Record<
  MarEntry['status'],
  { color: string; icon: React.ReactNode }
> = {
  given: { color: 'success.main', icon: <CheckCircleRoundedIcon sx={{ fontSize: 18 }} /> },
  due: { color: 'warning.main', icon: <ScheduleRoundedIcon sx={{ fontSize: 18 }} /> },
  scheduled: { color: 'info.main', icon: <EventAvailableOutlinedIcon sx={{ fontSize: 18 }} /> },
  held: { color: 'text.secondary', icon: <PauseCircleOutlineRoundedIcon sx={{ fontSize: 18 }} /> },
  missed: { color: 'error.main', icon: <ErrorOutlineRoundedIcon sx={{ fontSize: 18 }} /> },
};

export function MedicationsTab({ patient }: MedicationsTabProps) {
  const t = useScopedT(detailDict);
  const { lang } = useLang();

  const meds = [...patient.medications].sort(
    (a, b) => (a.status === 'active' ? 0 : 1) - (b.status === 'active' ? 0 : 1),
  );

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} lg={8}>
        <SectionCard
          title={t('activeMeds')}
          icon={<MedicationOutlinedIcon fontSize="small" />}
          subtitle={`${meds.length} ${t('medication').toLowerCase()}`}
          disableContentPadding
        >
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('medication')}</TableCell>
                  <TableCell>{t('dose')}</TableCell>
                  <TableCell>{t('route')}</TableCell>
                  <TableCell>{t('frequency')}</TableCell>
                  <TableCell>{t('indication')}</TableCell>
                  <TableCell align="center">{t('status')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {meds.map((m) => (
                  <TableRow key={m.id} hover sx={{ opacity: m.status === 'discontinued' ? 0.55 : 1 }}>
                    <TableCell>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        {m.highAlert && (
                          <Tooltip title={t('highAlert')}>
                            <WarningAmberRoundedIcon sx={{ fontSize: 16, color: 'error.main' }} />
                          </Tooltip>
                        )}
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            sx={{ textDecoration: m.status === 'discontinued' ? 'line-through' : 'none' }}
                          >
                            {m.genericName}
                          </Typography>
                          {m.brandName && (
                            <Typography variant="caption" color="text.secondary">
                              {m.brandName}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className="tnum">
                        {m.dose}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" variant="outlined" label={m.route} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{m.frequency}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {m.indication}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        color={medStatusColor[m.status]}
                        variant={m.status === 'active' ? 'filled' : 'outlined'}
                        label={m.status}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </SectionCard>
      </Grid>

      <Grid item xs={12} lg={4}>
        <SectionCard title={t('marTitle')} icon={<EventAvailableOutlinedIcon fontSize="small" />}>
          <Box sx={{ position: 'relative', pl: 1 }}>
            <Box
              sx={(theme) => ({
                position: 'absolute',
                left: 9,
                top: 6,
                bottom: 6,
                width: 2,
                bgcolor: theme.palette.divider,
              })}
            />
            <Stack spacing={2}>
              {patient.mar.map((entry) => {
                const meta = marMeta[entry.status];
                return (
                  <Stack key={entry.id} direction="row" spacing={1.5} alignItems="flex-start">
                    <Box
                      sx={(theme) => ({
                        zIndex: 1,
                        width: 20,
                        display: 'grid',
                        placeItems: 'center',
                        color: meta.color,
                        bgcolor: theme.palette.background.paper,
                      })}
                    >
                      {meta.icon}
                    </Box>
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={1}>
                        <Typography variant="body2" fontWeight={600} sx={{ minWidth: 0 }} noWrap>
                          {entry.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" className="tnum" sx={{ flexShrink: 0 }}>
                          {formatTime(entry.scheduledAt, lang)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
                        <Chip
                          size="small"
                          label={entry.status}
                          sx={(theme) => {
                            const c =
                              entry.status === 'given'
                                ? theme.palette.success.main
                                : entry.status === 'due'
                                  ? theme.palette.warning.main
                                  : entry.status === 'missed'
                                    ? theme.palette.error.main
                                    : entry.status === 'scheduled'
                                      ? theme.palette.info.main
                                      : theme.palette.text.secondary;
                            return {
                              height: 20,
                              fontWeight: 700,
                              textTransform: 'capitalize',
                              color: c,
                              bgcolor: alpha(c, 0.12),
                            };
                          }}
                        />
                        {entry.administeredBy ? (
                          <Typography variant="caption" color="text.secondary">
                            {t('by')} {entry.administeredBy}
                          </Typography>
                        ) : (
                          entry.status !== 'given' && (
                            <Typography variant="caption" color="text.secondary">
                              {dueIn(entry.scheduledAt, lang)}
                            </Typography>
                          )
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                );
              })}
            </Stack>
          </Box>
        </SectionCard>
      </Grid>
    </Grid>
  );
}
