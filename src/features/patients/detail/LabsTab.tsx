import { useMemo } from 'react';
import {
  Box,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import { SectionCard } from '@/components/SectionCard';
import { LabFlagChip } from '@/components/chips';
import { EmptyState } from '@/components/EmptyState';
import { useLang, useScopedT } from '@/i18n/I18nProvider';
import { formatDateTime } from '@/lib/format';
import type { LabResult, Patient } from '@/types/clinical';
import { detailDict } from './dict';

interface LabsTabProps {
  patient: Patient;
}

function valueColor(flag: LabResult['flag']): string | undefined {
  switch (flag) {
    case 'L':
      return 'info.main';
    case 'H':
      return 'warning.main';
    case 'LL':
    case 'HH':
      return 'error.main';
    default:
      return undefined;
  }
}

export function LabsTab({ patient }: LabsTabProps) {
  const t = useScopedT(detailDict);
  const { lang } = useLang();

  const panels = useMemo(() => {
    const map = new Map<string, LabResult[]>();
    for (const lab of patient.labs) {
      const list = map.get(lab.panel) ?? [];
      list.push(lab);
      map.set(lab.panel, list);
    }
    return Array.from(map.entries());
  }, [patient.labs]);

  if (panels.length === 0) {
    return (
      <SectionCard title={t('labResults')} icon={<ScienceOutlinedIcon fontSize="small" />}>
        <EmptyState icon={<ScienceOutlinedIcon />} title={t('labResults')} />
      </SectionCard>
    );
  }

  return (
    <Grid container spacing={2.5}>
      {panels.map(([panel, labs]) => {
        const abnormal = labs.filter((l) => l.flag !== 'N').length;
        const collectedAt = labs[0]?.collectedAt;
        return (
          <Grid item xs={12} md={6} key={panel}>
            <SectionCard
              title={panel}
              icon={<ScienceOutlinedIcon fontSize="small" />}
              subtitle={collectedAt ? `${t('collected')} ${formatDateTime(collectedAt, lang)}` : undefined}
              action={
                abnormal > 0 ? (
                  <Chip size="small" color="warning" variant="outlined" label={`${abnormal} ${t('abnormalCount')}`} />
                ) : (
                  <Chip size="small" color="success" variant="outlined" label="WNL" />
                )
              }
              disableContentPadding
            >
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('analyte')}</TableCell>
                      <TableCell align="right">{t('result')}</TableCell>
                      <TableCell align="right">{t('reference')}</TableCell>
                      <TableCell align="center">{t('flag')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {labs.map((lab) => (
                      <TableRow key={lab.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {lab.analyte}
                          </Typography>
                          {lab.loinc && (
                            <Typography variant="caption" color="text.secondary" className="mono">
                              LOINC {lab.loinc}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            className="tnum"
                            sx={{ color: valueColor(lab.flag) }}
                          >
                            {lab.value} <Box component="span" sx={{ fontWeight: 400, color: 'text.secondary' }}>{lab.unit}</Box>
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="caption" color="text.secondary" className="tnum">
                            {lab.refLow}–{lab.refHigh}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <LabFlagChip flag={lab.flag} />
                          {lab.flag === 'N' && (
                            <Typography variant="caption" color="success.main" fontWeight={700}>
                              N
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </SectionCard>
          </Grid>
        );
      })}
    </Grid>
  );
}
