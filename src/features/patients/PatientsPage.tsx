import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowParams,
} from '@mui/x-data-grid';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';

import { PageHeader, StatCard, SectionCard, PatientAvatar, AcuityChip, FlagChip, EmptyState } from '@/components';
import { usePatients } from '@/store/useAppStore';
import { useLang, useScopedT, useBilingual, type Dictionary } from '@/i18n/I18nProvider';
import { vitalTone, type VitalMetric } from '@/lib/clinical';
import { WARDS } from '@/data/clinical';
import type { Acuity, Patient } from '@/types/clinical';

/* ------------------------------------------------------------------ *
 * Local translation dictionary
 * ------------------------------------------------------------------ */
const dict = {
  title: { en: 'Patients', ko: '환자 목록' },
  subtitle: { en: 'Unit roster', ko: '병동 입원 환자' },
  acrossWards: { en: 'across', ko: '·' },
  wards: { en: 'wards', ko: '개 병동' },
  searchLabel: { en: 'Search', ko: '검색' },
  searchPlaceholder: {
    en: 'Search name, MRN or room…',
    ko: '이름, 등록번호, 병실 검색…',
  },
  allWards: { en: 'All', ko: '전체' },
  census: { en: 'Census', ko: '총 환자' },
  stable: { en: 'Stable', ko: '안정' },
  guarded: { en: 'Guarded', ko: '주의' },
  serious: { en: 'Serious', ko: '중증' },
  critical: { en: 'Critical', ko: '위중' },
  highAcuity: { en: 'High acuity', ko: '고중증도' },
  highAcuityCaption: { en: 'serious + critical', ko: '중증 + 위중' },
  patientsLowercase: { en: 'patients', ko: '명' },
  colPatient: { en: 'Patient', ko: '환자' },
  colLocation: { en: 'Location', ko: '병상' },
  colAgeSex: { en: 'Age / Sex', ko: '나이 / 성별' },
  colDx: { en: 'Primary Dx', ko: '주진단' },
  colAcuity: { en: 'Acuity', ko: '중증도' },
  colFlags: { en: 'Flags', ko: '주의사항' },
  colLos: { en: 'LOS', ko: '재원일' },
  colHr: { en: 'Latest HR', ko: '최근 심박수' },
  rosterTitle: { en: 'Inpatient roster', ko: '입원 환자 명단' },
  rosterSubtitle: { en: 'Tap a row to open the chart', ko: '행을 누르면 차트가 열립니다' },
  showing: { en: 'Showing', ko: '표시' },
  of: { en: 'of', ko: '/' },
  male: { en: 'M', ko: '남' },
  female: { en: 'F', ko: '여' },
  noMatch: { en: 'No matching patients', ko: '일치하는 환자가 없습니다' },
  noMatchDesc: {
    en: 'Try a different search term, ward or acuity filter.',
    ko: '다른 검색어, 병동 또는 중증도 필터를 시도해 보세요.',
  },
  noFlags: { en: '—', ko: '—' },
} satisfies Dictionary;

const ACUITY_ORDER: Acuity[] = ['stable', 'guarded', 'serious', 'critical'];
const ACUITY_RANK: Record<Acuity, number> = { stable: 0, guarded: 1, serious: 2, critical: 3 };

/** A single denormalized row for the DataGrid, derived from a Patient. */
interface RosterRow {
  id: string;
  patient: Patient;
  name: string;
  nameKo: string;
  initials: string;
  mrn: string;
  acuity: Acuity;
  acuityRank: number;
  wardCode: string;
  room: string;
  bed: string;
  age: number;
  sex: Patient['sex'];
  primaryDx: string;
  flags: string[];
  los: number;
  hr: number | null;
}

function latestHr(patient: Patient): number | null {
  const last = patient.vitals[patient.vitals.length - 1];
  return last ? last.hr : null;
}

function primaryDiagnosis(patient: Patient): string {
  const primary = patient.diagnoses.find((d) => d.category === 'primary') ?? patient.diagnoses[0];
  return primary?.description ?? '—';
}

export function PatientsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { lang } = useLang();
  const t = useScopedT(dict);
  const bi = useBilingual();
  const patients = usePatients();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [query, setQuery] = useState('');
  const [wardCode, setWardCode] = useState<string>('all');
  const [acuityFilter, setAcuityFilter] = useState<Acuity[]>([]);

  /* ------------------------------- census ------------------------------- */
  const census = useMemo(() => {
    const byAcuity: Record<Acuity, number> = { stable: 0, guarded: 0, serious: 0, critical: 0 };
    const wardSet = new Set<string>();
    for (const p of patients) {
      byAcuity[p.acuity] += 1;
      wardSet.add(p.ward.code);
    }
    return {
      total: patients.length,
      byAcuity,
      wardCount: wardSet.size,
      highAcuity: byAcuity.serious + byAcuity.critical,
    };
  }, [patients]);

  /* ----------------------------- build rows ----------------------------- */
  const allRows = useMemo<RosterRow[]>(
    () =>
      patients.map((p) => ({
        id: p.id,
        patient: p,
        name: p.name,
        nameKo: p.nameKo,
        initials: p.initials,
        mrn: p.mrn,
        acuity: p.acuity,
        acuityRank: ACUITY_RANK[p.acuity],
        wardCode: p.ward.code,
        room: p.room,
        bed: p.bed,
        age: p.age,
        sex: p.sex,
        primaryDx: primaryDiagnosis(p),
        flags: p.flags,
        los: p.lengthOfStayDays,
        hr: latestHr(p),
      })),
    [patients],
  );

  /* ------------------------------ filtering ----------------------------- */
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allRows
      .filter((r) => {
        if (wardCode !== 'all' && r.wardCode !== wardCode) return false;
        if (acuityFilter.length > 0 && !acuityFilter.includes(r.acuity)) return false;
        if (q) {
          const haystack = `${r.name} ${r.nameKo} ${r.mrn} ${r.room} ${r.bed} ${r.wardCode}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.acuityRank - a.acuityRank || a.name.localeCompare(b.name));
  }, [allRows, query, wardCode, acuityFilter]);

  const toggleAcuity = (value: Acuity) => {
    setAcuityFilter((prev) => (prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]));
  };

  /* ---------------------------- grid columns ---------------------------- */
  const columns = useMemo<GridColDef<RosterRow>[]>(
    () => [
      {
        field: 'name',
        headerName: t('colPatient'),
        flex: 1.6,
        minWidth: 220,
        sortable: true,
        renderCell: (params: GridRenderCellParams<RosterRow>) => {
          const r = params.row;
          return (
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 1, minWidth: 0 }}>
              <PatientAvatar initials={r.initials} acuity={r.acuity} size={38} showStatusDot />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={700} noWrap lineHeight={1.3}>
                  {lang === 'ko' ? r.nameKo : r.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap className="tnum">
                  {r.mrn}
                </Typography>
              </Box>
            </Stack>
          );
        },
      },
      {
        field: 'wardCode',
        headerName: t('colLocation'),
        flex: 1,
        minWidth: 130,
        sortable: true,
        renderCell: (params: GridRenderCellParams<RosterRow>) => {
          const r = params.row;
          return (
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700}>
                {r.wardCode}
              </Typography>
              <Typography variant="caption" color="text.secondary" className="tnum" noWrap>
                {`${r.room}-${r.bed}`}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: 'age',
        headerName: t('colAgeSex'),
        flex: 0.8,
        minWidth: 100,
        sortable: true,
        renderCell: (params: GridRenderCellParams<RosterRow>) => {
          const r = params.row;
          return (
            <Typography variant="body2" className="tnum">
              {r.age}
              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.75 }}>
                {r.sex === 'male' ? t('male') : t('female')}
              </Typography>
            </Typography>
          );
        },
      },
      {
        field: 'primaryDx',
        headerName: t('colDx'),
        flex: 1.7,
        minWidth: 200,
        sortable: true,
        renderCell: (params: GridRenderCellParams<RosterRow>) => (
          <Tooltip title={params.row.primaryDx} placement="top-start">
            <Typography variant="body2" color="text.secondary" noWrap>
              {params.row.primaryDx}
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: 'acuity',
        headerName: t('colAcuity'),
        flex: 0.9,
        minWidth: 110,
        sortable: true,
        sortComparator: (_v1, _v2, p1, p2) =>
          ACUITY_RANK[p1.value as Acuity] - ACUITY_RANK[p2.value as Acuity],
        renderCell: (params: GridRenderCellParams<RosterRow>) => <AcuityChip acuity={params.row.acuity} />,
      },
      {
        field: 'flags',
        headerName: t('colFlags'),
        flex: 1.4,
        minWidth: 170,
        sortable: false,
        renderCell: (params: GridRenderCellParams<RosterRow>) => {
          const flags = params.row.flags;
          if (flags.length === 0) {
            return (
              <Typography variant="body2" color="text.disabled">
                {t('noFlags')}
              </Typography>
            );
          }
          const shown = flags.slice(0, 2);
          const extra = flags.length - shown.length;
          return (
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexWrap: 'nowrap', overflow: 'hidden' }}>
              {shown.map((f) => (
                <FlagChip key={f} label={f} />
              ))}
              {extra > 0 && (
                <Tooltip title={flags.slice(2).join(', ')}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ whiteSpace: 'nowrap' }}>
                    {`+${extra}`}
                  </Typography>
                </Tooltip>
              )}
            </Stack>
          );
        },
      },
      {
        field: 'los',
        headerName: t('colLos'),
        flex: 0.6,
        minWidth: 80,
        sortable: true,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params: GridRenderCellParams<RosterRow>) => (
          <Typography variant="body2" className="tnum">
            {params.row.los}
            <Typography component="span" variant="caption" color="text.secondary">
              {' d'}
            </Typography>
          </Typography>
        ),
      },
      {
        field: 'hr',
        headerName: t('colHr'),
        flex: 0.8,
        minWidth: 110,
        sortable: true,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params: GridRenderCellParams<RosterRow>) => {
          const hr = params.row.hr;
          if (hr == null) {
            return (
              <Typography variant="body2" color="text.disabled">
                —
              </Typography>
            );
          }
          const tone = vitalTone('hr' as VitalMetric, hr);
          const color =
            tone === 'high'
              ? theme.palette.error.main
              : tone === 'low'
                ? theme.palette.info.main
                : theme.palette.text.primary;
          return (
            <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end" sx={{ width: '100%' }}>
              <FavoriteBorderRoundedIcon sx={{ fontSize: 15, color: tone === 'normal' ? 'text.disabled' : color }} />
              <Typography variant="body2" fontWeight={tone === 'normal' ? 500 : 700} className="tnum" sx={{ color }}>
                {hr}
              </Typography>
            </Stack>
          );
        },
      },
    ],
    [t, lang, theme],
  );

  /* ------------------------------- render ------------------------------- */
  const subtitle =
    lang === 'ko'
      ? `${census.total}${t('patientsLowercase')} ${t('acrossWards')} ${census.wardCount}${t('wards')}`
      : `${census.total} patients ${t('acrossWards')} ${census.wardCount} ${t('wards')}`;

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={subtitle}
        icon={<PeopleAltOutlinedIcon />}
      />

      {/* KPI / census strip */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 3, '& > *': { flex: 1, minWidth: 0 } }}
      >
        <StatCard
          label={t('census')}
          value={census.total}
          unit={lang === 'ko' ? '명' : ''}
          tone="info"
          icon={<HotelOutlinedIcon fontSize="small" />}
          caption={`${census.wardCount} ${lang === 'ko' ? t('wards') : t('wards')}`}
        />
        <StatCard
          label={t('stable')}
          value={census.byAcuity.stable}
          tone="normal"
          icon={<MonitorHeartOutlinedIcon fontSize="small" />}
          caption={t('patientsLowercase')}
        />
        <StatCard
          label={t('guarded')}
          value={census.byAcuity.guarded}
          tone="low"
          icon={<MonitorHeartOutlinedIcon fontSize="small" />}
          caption={t('patientsLowercase')}
        />
        <StatCard
          label={t('highAcuity')}
          value={census.highAcuity}
          tone="critical"
          icon={<LocalHospitalOutlinedIcon fontSize="small" />}
          caption={t('highAcuityCaption')}
        />
      </Stack>

      {/* Filters + roster */}
      <SectionCard
        title={t('rosterTitle')}
        subtitle={t('rosterSubtitle')}
        icon={<PersonSearchOutlinedIcon fontSize="small" />}
        action={
          <Typography variant="caption" color="text.secondary" className="tnum" sx={{ whiteSpace: 'nowrap' }}>
            {`${t('showing')} ${rows.length} ${t('of')} ${census.total}`}
          </Typography>
        }
        contentSx={{ p: { xs: 1.5, sm: 2 } }}
      >
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', lg: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            size="small"
            aria-label={t('searchLabel')}
            sx={{ width: { xs: '100%', lg: 320 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            useFlexGap
            flexWrap="wrap"
          >
            {/* Ward filter */}
            <ToggleButtonGroup
              value={wardCode}
              exclusive
              size="small"
              onChange={(_e, value: string | null) => {
                if (value !== null) setWardCode(value);
              }}
              sx={{
                flexWrap: 'wrap',
                '& .MuiToggleButton-root': { px: 1.25, textTransform: 'none', fontWeight: 600, border: 0 },
              }}
            >
              <ToggleButton value="all">{t('allWards')}</ToggleButton>
              {WARDS.map((w) => (
                <Tooltip key={w.code} title={bi(w.name)} placement="top">
                  <ToggleButton value={w.code}>{w.code}</ToggleButton>
                </Tooltip>
              ))}
            </ToggleButtonGroup>

            {/* Acuity filter chips */}
            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center">
              {ACUITY_ORDER.map((a) => {
                const active = acuityFilter.includes(a);
                const color = theme.palette[
                  a === 'stable' ? 'success' : a === 'guarded' ? 'info' : a === 'serious' ? 'warning' : 'error'
                ].main;
                return (
                  <Box
                    key={a}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleAcuity(a)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleAcuity(a);
                      }
                    }}
                    sx={{
                      cursor: 'pointer',
                      userSelect: 'none',
                      px: 1.25,
                      py: 0.5,
                      borderRadius: 999,
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      textTransform: 'capitalize',
                      lineHeight: 1.6,
                      transition: 'all .15s ease',
                      color: active ? color : 'text.secondary',
                      bgcolor: active ? alpha(color, 0.16) : 'transparent',
                      border: `1px solid ${active ? alpha(color, 0.5) : theme.palette.divider}`,
                      '&:hover': { bgcolor: alpha(color, active ? 0.22 : 0.08) },
                    }}
                  >
                    {t(a)}
                    <Box component="span" className="tnum" sx={{ ml: 0.75, opacity: 0.85 }}>
                      {census.byAcuity[a]}
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Stack>
        </Stack>

        {rows.length === 0 ? (
          <EmptyState
            icon={<PersonSearchOutlinedIcon />}
            title={t('noMatch')}
            description={t('noMatchDesc')}
          />
        ) : (
          <Box sx={{ width: '100%' }}>
            <DataGrid<RosterRow>
              rows={rows}
              columns={columns}
              autoHeight
              disableColumnMenu
              disableRowSelectionOnClick
              rowHeight={64}
              columnHeaderHeight={48}
              onRowClick={(params: GridRowParams<RosterRow>) => navigate(`/patients/${params.row.id}`)}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: isMobile ? 10 : 25, page: 0 } },
                sorting: { sortModel: [{ field: 'acuity', sort: 'desc' }] },
              }}
              localeText={{ noRowsLabel: t('noMatch') }}
              sx={{
                border: 0,
                '--DataGrid-rowBorderColor': theme.palette.divider,
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === 'light' ? 0.03 : 0.06),
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 700,
                  color: 'text.secondary',
                  fontSize: '0.72rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                },
                '& .MuiDataGrid-columnSeparator': { display: 'none' },
                '& .MuiDataGrid-cell': {
                  borderColor: theme.palette.divider,
                  '&:focus, &:focus-within': { outline: 'none' },
                },
                '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
                  outline: 'none',
                },
                '& .MuiDataGrid-row': {
                  cursor: 'pointer',
                  transition: 'background-color .12s ease',
                  '&:hover': { bgcolor: 'action.hover' },
                },
                '& .MuiDataGrid-footerContainer': { borderColor: theme.palette.divider },
                '& .MuiDataGrid-virtualScroller': { overflowX: 'auto' },
              }}
            />
          </Box>
        )}
      </SectionCard>
    </>
  );
}
