import { useMemo, useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import TouchAppRoundedIcon from '@mui/icons-material/TouchAppRounded';
import { EmptyState, PageHeader, SectionCard, StatCard } from '@/components';
import { useAllRecords, useAppStore, useCurrentNurse, usePatients } from '@/store/useAppStore';
import { useLang, useScopedT, type Dictionary } from '@/i18n/I18nProvider';
import { formatDateTime, timeAgo } from '@/lib/format';
import { downloadRoundingReport } from '@/lib/pdf';
import type { NursingRecord, Patient, Shift } from '@/types/clinical';
import { RECORD_TYPE_META, RecordTypeChip, recordTypeIcon, type RecordType } from './recordsShared';
import { RecordDetail } from './RecordDetail';

const dict = {
  title: { en: 'Nursing Records', ko: '간호 기록' },
  subtitle: {
    en: 'Voice rounds and clinical documentation captured this shift',
    ko: '이번 근무 동안 수집된 음성 라운딩 및 간호 기록',
  },
  total: { en: 'Total records', ko: '전체 기록' },
  signed: { en: 'Signed', ko: '서명 완료' },
  unsigned: { en: 'Unsigned', ko: '서명 대기' },
  voiceRounds: { en: 'Voice rounds', ko: '음성 라운딩' },
  thisShift: { en: 'documented', ko: '문서화됨' },
  awaiting: { en: 'awaiting signature', ko: '서명 대기 중' },
  ofTotal: { en: 'of all records', ko: '전체 기록 중' },
  filters: { en: 'Filters', ko: '필터' },
  allTypes: { en: 'All types', ko: '모든 유형' },
  type: { en: 'Type', ko: '유형' },
  shift: { en: 'Shift', ko: '근무' },
  allShifts: { en: 'All shifts', ko: '모든 근무' },
  statusAll: { en: 'All', ko: '전체' },
  statusSigned: { en: 'Signed', ko: '서명됨' },
  statusUnsigned: { en: 'Unsigned', ko: '미서명' },
  search: { en: 'Search patient or author', ko: '환자 또는 작성자 검색' },
  records: { en: 'Records', ko: '기록 목록' },
  detail: { en: 'Record detail', ko: '기록 상세' },
  showing: { en: 'showing', ko: '표시' },
  emptyListTitle: { en: 'No records match', ko: '일치하는 기록 없음' },
  emptyListDesc: {
    en: 'Adjust the filters or clear the search to see more documentation.',
    ko: '더 많은 기록을 보려면 필터를 조정하거나 검색을 지우세요.',
  },
  emptyDetailTitle: { en: 'Select a record', ko: '기록을 선택하세요' },
  emptyDetailDesc: {
    en: 'Choose an entry from the list to review its full documentation, transcript and signature status.',
    ko: '목록에서 항목을 선택하면 전체 기록, 전사 내용 및 서명 상태를 확인할 수 있습니다.',
  },
  unknownPatient: { en: 'Unknown patient', ko: '미상 환자' },
} satisfies Dictionary;

const SHIFTS: Shift[] = ['Day', 'Evening', 'Night'];
type SignedFilter = 'all' | 'signed' | 'unsigned';

export function RecordsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const t = useScopedT(dict);
  const { lang } = useLang();

  const records = useAllRecords();
  const patients = usePatients();
  const nurse = useCurrentNurse();
  const signRecord = useAppStore((s) => s.signRecord);

  const nurseName = lang === 'ko' ? nurse.nameKo : nurse.name;

  const patientById = useMemo(() => {
    const map = new Map<string, Patient>();
    patients.forEach((p) => map.set(p.id, p));
    return map;
  }, [patients]);

  /* ----------------------------- filters ----------------------------- */
  const [typeFilter, setTypeFilter] = useState<RecordType | 'all'>('all');
  const [shiftFilter, setShiftFilter] = useState<Shift | 'all'>('all');
  const [signedFilter, setSignedFilter] = useState<SignedFilter>('all');
  const [query, setQuery] = useState('');

  const sorted = useMemo(
    () => [...records].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [records],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((r) => {
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (shiftFilter !== 'all' && r.shift !== shiftFilter) return false;
      if (signedFilter === 'signed' && !r.signed) return false;
      if (signedFilter === 'unsigned' && r.signed) return false;
      if (q) {
        const p = patientById.get(r.patientId);
        const haystack = [p?.name, p?.nameKo, p?.mrn, p?.room, r.author]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [sorted, typeFilter, shiftFilter, signedFilter, query, patientById]);

  /* --------------------------- selection ----------------------------- */
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const selected = useMemo(
    () => filtered.find((r) => r.id === selectedId) ?? records.find((r) => r.id === selectedId),
    [filtered, records, selectedId],
  );

  const signedCount = records.filter((r) => r.signed).length;
  const unsignedCount = records.length - signedCount;
  const roundingCount = records.filter((r) => r.type === 'rounding').length;
  const signedPct = records.length ? Math.round((signedCount / records.length) * 100) : 0;

  const handleSelect = (id: string) => setSelectedId(id);
  const handleSign = (id: string) => signRecord(id);
  const handleExport = (record: NursingRecord) => {
    const p = patientById.get(record.patientId);
    if (p) downloadRoundingReport(p, record, nurseName);
  };

  const detailOpen = isMobile && Boolean(selected);

  const detailNode = selected ? (
    <RecordDetail
      record={selected}
      patient={patientById.get(selected.patientId)}
      nurseName={nurseName}
      onSign={handleSign}
      onExport={handleExport}
    />
  ) : (
    <EmptyState
      icon={<TouchAppRoundedIcon />}
      title={t('emptyDetailTitle')}
      description={t('emptyDetailDesc')}
    />
  );

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} icon={<DescriptionRoundedIcon />} />

      {/* KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard
            label={t('total')}
            value={records.length}
            tone="info"
            icon={<DescriptionRoundedIcon fontSize="small" />}
            caption={t('thisShift')}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            label={t('signed')}
            value={signedCount}
            tone="normal"
            icon={<VerifiedRoundedIcon fontSize="small" />}
            caption={`${signedPct}% ${t('ofTotal')}`}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            label={t('unsigned')}
            value={unsignedCount}
            tone={unsignedCount > 0 ? 'high' : 'normal'}
            icon={<EditNoteRoundedIcon fontSize="small" />}
            caption={t('awaiting')}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            label={t('voiceRounds')}
            value={roundingCount}
            tone="info"
            icon={<FactCheckOutlinedIcon fontSize="small" />}
            caption={t('thisShift')}
          />
        </Grid>
      </Grid>

      {/* Filters */}
      <SectionCard title={t('filters')} sx={{ mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label={t('type')}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as RecordType | 'all')}
            >
              <MenuItem value="all">{t('allTypes')}</MenuItem>
              {(Object.keys(RECORD_TYPE_META) as RecordType[]).map((rt) => (
                <MenuItem key={rt} value={rt}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {recordTypeIcon(rt, 'small')}
                    <span>{lang === 'ko' ? RECORD_TYPE_META[rt].ko : RECORD_TYPE_META[rt].en}</span>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label={t('shift')}
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value as Shift | 'all')}
            >
              <MenuItem value="all">{t('allShifts')}</MenuItem>
              {SHIFTS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ToggleButtonGroup
              size="small"
              exclusive
              fullWidth
              value={signedFilter}
              onChange={(_e, v: SignedFilter | null) => v && setSignedFilter(v)}
            >
              <ToggleButton value="all">{t('statusAll')}</ToggleButton>
              <ToggleButton value="signed">{t('statusSigned')}</ToggleButton>
              <ToggleButton value="unsigned">{t('statusUnsigned')}</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('search')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </SectionCard>

      {/* Master / detail */}
      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12} md={5}>
          <SectionCard
            title={t('records')}
            subtitle={`${filtered.length} ${t('showing')}`}
            disableContentPadding
            contentSx={{ display: 'flex', flexDirection: 'column' }}
          >
            {filtered.length === 0 ? (
              <EmptyState
                icon={<SearchRoundedIcon />}
                title={t('emptyListTitle')}
                description={t('emptyListDesc')}
              />
            ) : (
              <Box sx={{ maxHeight: { md: 640 }, overflowY: 'auto' }}>
                {filtered.map((r) => (
                  <RecordRow
                    key={r.id}
                    record={r}
                    patient={patientById.get(r.patientId)}
                    selected={r.id === selected?.id}
                    onClick={() => handleSelect(r.id)}
                  />
                ))}
              </Box>
            )}
          </SectionCard>
        </Grid>

        {/* Desktop detail pane */}
        {!isMobile && (
          <Grid item xs={12} md={7}>
            <SectionCard title={t('detail')}>{detailNode}</SectionCard>
          </Grid>
        )}
      </Grid>

      {/* Mobile detail dialog */}
      <Dialog
        open={detailOpen}
        onClose={() => setSelectedId(undefined)}
        fullWidth
        maxWidth="sm"
        scroll="body"
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, py: 1.5 }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            {t('detail')}
          </Typography>
          <IconButton size="small" onClick={() => setSelectedId(undefined)} aria-label="close">
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
        <DialogContent dividers>{detailNode}</DialogContent>
      </Dialog>
    </>
  );
}

/* ------------------------------ list row ------------------------------ */

interface RecordRowProps {
  record: NursingRecord;
  patient: Patient | undefined;
  selected: boolean;
  onClick: () => void;
}

function RecordRow({ record, patient, selected, onClick }: RecordRowProps) {
  const t = useScopedT(dict);
  const { lang } = useLang();
  const meta = RECORD_TYPE_META[record.type];
  const patientName = patient
    ? lang === 'ko'
      ? patient.nameKo
      : patient.name
    : t('unknownPatient');

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        px: 2,
        py: 1.5,
        cursor: 'pointer',
        borderBottom: 1,
        borderColor: 'divider',
        borderLeft: 3,
        borderLeftColor: selected ? 'primary.main' : 'transparent',
        bgcolor: selected ? (th) => alpha(th.palette.primary.main, 0.08) : 'transparent',
        transition: 'background-color 120ms ease',
        '&:hover': { bgcolor: selected ? undefined : 'action.hover' },
        '&:last-of-type': { borderBottom: 0 },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          <RecordTypeChip type={record.type} label={lang === 'ko' ? meta.ko : meta.en} />
        </Stack>
        <SignedBadge signed={record.signed} />
      </Stack>

      <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }} noWrap>
        {patientName}
        {patient && (
          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.75 }}>
            {patient.ward.code} · {patient.room}
          </Typography>
        )}
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
        sx={{ mt: 0.5 }}
      >
        <Typography variant="caption" color="text.secondary" noWrap>
          {record.author}
        </Typography>
        <Dot />
        <Typography variant="caption" color="text.secondary" noWrap>
          {record.shift}
        </Typography>
        <Dot />
        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          title={formatDateTime(record.createdAt, lang)}
        >
          {timeAgo(record.createdAt, lang)}
        </Typography>
      </Stack>
    </Box>
  );
}

function SignedBadge({ signed }: { signed: boolean }) {
  const t = useScopedT(dict);
  return (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      sx={(theme) => ({
        flexShrink: 0,
        px: 0.75,
        py: 0.25,
        borderRadius: 1,
        fontSize: '0.7rem',
        fontWeight: 700,
        color: signed ? theme.palette.success.main : theme.palette.warning.main,
        bgcolor: alpha(signed ? theme.palette.success.main : theme.palette.warning.main, 0.12),
      })}
    >
      {signed ? (
        <VerifiedRoundedIcon sx={{ fontSize: 14 }} />
      ) : (
        <EditNoteRoundedIcon sx={{ fontSize: 14 }} />
      )}
      <span>{signed ? t('statusSigned') : t('statusUnsigned')}</span>
    </Stack>
  );
}

function Dot() {
  return (
    <Box
      component="span"
      sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled', flexShrink: 0 }}
    />
  );
}
