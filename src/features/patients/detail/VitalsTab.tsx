import { useMemo } from 'react';
import { Box, Grid, Stack, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { SectionCard } from '@/components/SectionCard';
import { useLang, useScopedT } from '@/i18n/I18nProvider';
import { formatTime } from '@/lib/format';
import { VITAL_RANGES } from '@/lib/clinical';
import { vitalColors } from '@/theme/tokens';
import type { Patient, VitalSample } from '@/types/clinical';
import { detailDict } from './dict';

interface VitalsTabProps {
  patient: Patient;
}

interface SeriesPoint {
  t: string;
  hr: number;
  sbp: number;
  dbp: number;
  rr: number;
  temp: number;
  spo2: number;
  pain: number;
}

function trend(values: number[]): 'up' | 'down' | 'flat' {
  if (values.length < 2) return 'flat';
  const delta = values[values.length - 1] - values[values.length - 2];
  if (delta > 0) return 'up';
  if (delta < 0) return 'down';
  return 'flat';
}

function TrendBadge({ values, unit }: { values: number[]; unit: string }) {
  const dir = trend(values);
  const Icon = dir === 'up' ? TrendingUpIcon : dir === 'down' ? TrendingDownIcon : TrendingFlatIcon;
  const latest = values[values.length - 1];
  return (
    <Stack direction="row" spacing={0.5} alignItems="baseline">
      <Typography variant="h5" fontWeight={800} className="tnum">
        {Number.isInteger(latest) ? latest : latest.toFixed(1)}
      </Typography>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {unit}
      </Typography>
      <Icon sx={{ fontSize: 18, color: 'text.secondary', ml: 0.25 }} />
    </Stack>
  );
}

interface VitalChartProps {
  title: string;
  data: SeriesPoint[];
  metric: keyof typeof VITAL_RANGES;
  lines: Array<{ key: keyof SeriesPoint; color: string; name: string }>;
  band?: { low: number; high: number };
  latestValues: number[];
  unit: string;
}

function VitalChart({ title, data, lines, band, latestValues, unit }: VitalChartProps) {
  const theme = useTheme();
  const t = useScopedT(detailDict);

  return (
    <SectionCard
      title={title}
      action={
        <Stack alignItems="flex-end">
          <Typography variant="overline" color="text.secondary" lineHeight={1.2}>
            {t('latest')}
          </Typography>
          <TrendBadge values={latestValues} unit={unit} />
        </Stack>
      }
    >
      <Box sx={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
            {band && (
              <ReferenceArea
                y1={band.low}
                y2={band.high}
                fill={alpha(theme.palette.success.main, 0.08)}
                stroke="none"
              />
            )}
            <XAxis
              dataKey="t"
              tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: theme.palette.divider }}
              minTickGap={24}
            />
            <YAxis
              tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={44}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: theme.palette.text.secondary }}
            />
            {lines.length > 1 && (
              <Legend wrapperStyle={{ fontSize: 12, color: theme.palette.text.secondary }} />
            )}
            {lines.map((l) => (
              <Line
                key={l.key as string}
                type="monotone"
                dataKey={l.key as string}
                name={l.name}
                stroke={l.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </SectionCard>
  );
}

export function VitalsTab({ patient }: VitalsTabProps) {
  const t = useScopedT(detailDict);
  const { lang } = useLang();

  const data: SeriesPoint[] = useMemo(
    () =>
      patient.vitals.map((v: VitalSample) => ({
        t: formatTime(v.timestamp, lang),
        hr: v.hr,
        sbp: v.sbp,
        dbp: v.dbp,
        rr: v.rr,
        temp: v.temp,
        spo2: v.spo2,
        pain: v.pain,
      })),
    [patient.vitals, lang],
  );

  const col = (key: keyof SeriesPoint) => patient.vitals.map((v) => v[key as keyof VitalSample] as number);

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12}>
        <Typography variant="subtitle2" color="text.secondary">
          {t('vitalsSubtitle')}
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <VitalChart
          title={VITAL_RANGES.hr.label}
          data={data}
          metric="hr"
          lines={[{ key: 'hr', color: vitalColors.hr, name: VITAL_RANGES.hr.label }]}
          band={{ low: VITAL_RANGES.hr.low, high: VITAL_RANGES.hr.high }}
          latestValues={col('hr')}
          unit="bpm"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <VitalChart
          title={t('bloodPressure')}
          data={data}
          metric="sbp"
          lines={[
            { key: 'sbp', color: vitalColors.sbp, name: t('systolic') },
            { key: 'dbp', color: vitalColors.dbp, name: t('diastolic') },
          ]}
          latestValues={col('sbp')}
          unit="mmHg"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <VitalChart
          title={VITAL_RANGES.spo2.label}
          data={data}
          metric="spo2"
          lines={[{ key: 'spo2', color: vitalColors.spo2, name: VITAL_RANGES.spo2.label }]}
          band={{ low: VITAL_RANGES.spo2.low, high: VITAL_RANGES.spo2.high }}
          latestValues={col('spo2')}
          unit="%"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <VitalChart
          title={VITAL_RANGES.temp.label}
          data={data}
          metric="temp"
          lines={[{ key: 'temp', color: vitalColors.temp, name: VITAL_RANGES.temp.label }]}
          band={{ low: VITAL_RANGES.temp.low, high: VITAL_RANGES.temp.high }}
          latestValues={col('temp')}
          unit="°C"
        />
      </Grid>
    </Grid>
  );
}
