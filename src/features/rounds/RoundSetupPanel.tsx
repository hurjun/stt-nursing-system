import { useMemo, useState } from 'react';
import {
  Box,
  ListItemButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import { SectionCard, PatientAvatar, AcuityChip, EmptyState } from '@/components';
import type { Dictionary } from '@/i18n/I18nProvider';
import { useBilingual, useLang, useScopedT } from '@/i18n/I18nProvider';
import { QUESTION_SETS } from '@/data/clinical';
import type { Patient } from '@/types/clinical';

interface RoundSetupPanelProps {
  patients: Patient[];
  selectedPatient: Patient | undefined;
  onSelectPatient: (id: string) => void;
  questionSetId: string;
  onSelectQuestionSet: (id: string) => void;
  /** Disable selection while a round is running. */
  locked: boolean;
}

const dict = {
  patient: { en: 'Select patient', ko: '환자 선택' },
  patientHint: { en: 'Choose a patient to round on', ko: '회진할 환자를 선택하세요' },
  questionSet: { en: 'Question set', ko: '질문 세트' },
  search: { en: 'Search by name, room or MRN', ko: '이름·병실·등록번호 검색' },
  noResults: { en: 'No patients match', ko: '일치하는 환자가 없습니다' },
  noResultsHint: { en: 'Try a different name or room number.', ko: '다른 이름이나 병실 번호로 검색해 보세요.' },
  room: { en: 'Room', ko: '병실' },
  questions: { en: 'questions', ko: '문항' },
} satisfies Dictionary;

export function RoundSetupPanel({
  patients,
  selectedPatient,
  onSelectPatient,
  questionSetId,
  onSelectQuestionSet,
  locked,
}: RoundSetupPanelProps) {
  const theme = useTheme();
  const t = useScopedT(dict);
  const b = useBilingual();
  const { lang } = useLang();
  const set = QUESTION_SETS.find((s) => s.id === questionSetId);

  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) =>
      [p.name, p.nameKo, p.mrn, p.room, p.bed, p.ward.code].join(' ').toLowerCase().includes(q),
    );
  }, [patients, query]);

  const highlight = alpha(theme.palette.primary.main, 0.1);

  return (
    <Stack spacing={2}>
      <SectionCard title={t('questionSet')} icon={<LocalHospitalRoundedIcon fontSize="small" />}>
        <TextField
          select
          fullWidth
          size="small"
          value={questionSetId}
          onChange={(e) => onSelectQuestionSet(e.target.value)}
          disabled={locked}
        >
          {QUESTION_SETS.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {b(s.name)}
            </MenuItem>
          ))}
        </TextField>
        {set && (
          <Stack spacing={0.5} sx={{ mt: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              {b(set.description)}
            </Typography>
            <Typography variant="caption" color="primary.main" fontWeight={700} className="tnum">
              {set.questionIds.length} {t('questions')}
            </Typography>
          </Stack>
        )}
      </SectionCard>

      <SectionCard
        title={t('patient')}
        subtitle={t('patientHint')}
        disableContentPadding
        contentSx={{ display: 'flex', flexDirection: 'column' }}
      >
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('search')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={locked}
          />
        </Box>
        <Box sx={{ maxHeight: 440, overflowY: 'auto', px: 1, pb: 1 }}>
          {filtered.length === 0 ? (
            <EmptyState title={t('noResults')} description={t('noResultsHint')} />
          ) : (
            filtered.map((p) => {
              const selected = p.id === selectedPatient?.id;
              return (
                <ListItemButton
                  key={p.id}
                  selected={selected}
                  disabled={locked && !selected}
                  onClick={() => onSelectPatient(p.id)}
                  sx={{
                    borderRadius: 1.5,
                    mb: 0.5,
                    alignItems: 'center',
                    gap: 1.25,
                    '&.Mui-selected': { bgcolor: highlight },
                    '&.Mui-selected:hover': { bgcolor: highlight },
                  }}
                >
                  <PatientAvatar initials={p.initials} acuity={p.acuity} size={38} showStatusDot />
                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700} noWrap>
                      {lang === 'ko' ? p.nameKo : p.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap className="tnum">
                      {p.ward.code} · {t('room')} {p.room}-{p.bed} · {p.age}
                      {lang === 'ko' ? '세' : 'y'} {p.sex === 'male' ? 'M' : 'F'}
                    </Typography>
                  </Box>
                  <AcuityChip acuity={p.acuity} />
                </ListItemButton>
              );
            })
          )}
        </Box>
      </SectionCard>
    </Stack>
  );
}
