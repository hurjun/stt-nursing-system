/* eslint-disable react-refresh/only-export-components -- shared chip + helpers co-located by design */
import { Chip, type ChipProps } from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';
import MicNoneRoundedIcon from '@mui/icons-material/MicNoneRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import type { NursingRecord } from '@/types/clinical';

export type RecordType = NursingRecord['type'];

/** Visual metadata for each record type — icon, palette key and i18n label keys. */
export const RECORD_TYPE_META: Record<
  RecordType,
  { palette: 'primary' | 'info' | 'secondary' | 'warning'; en: string; ko: string }
> = {
  rounding: { palette: 'primary', en: 'Voice Round', ko: '음성 라운딩' },
  SOAP: { palette: 'info', en: 'SOAP', ko: 'SOAP' },
  narrative: { palette: 'secondary', en: 'Narrative', ko: '서술 기록' },
  assessment: { palette: 'warning', en: 'Assessment', ko: '사정 기록' },
};

export function recordTypeIcon(type: RecordType, fontSize: 'inherit' | 'small' | 'medium' = 'small') {
  switch (type) {
    case 'rounding':
      return <MicNoneRoundedIcon fontSize={fontSize} />;
    case 'SOAP':
      return <DescriptionOutlinedIcon fontSize={fontSize} />;
    case 'narrative':
      return <NotesRoundedIcon fontSize={fontSize} />;
    case 'assessment':
      return <AssignmentTurnedInOutlinedIcon fontSize={fontSize} />;
  }
}

/** Solid-tinted chip identifying a record's documentation type. */
export function RecordTypeChip({
  type,
  label,
  size = 'small',
}: {
  type: RecordType;
  label: string;
  size?: ChipProps['size'];
}) {
  const meta = RECORD_TYPE_META[type];
  return (
    <Chip
      size={size}
      icon={recordTypeIcon(type, 'small')}
      label={label}
      sx={(theme: Theme) => ({
        fontWeight: 700,
        color: theme.palette[meta.palette].main,
        bgcolor: alpha(theme.palette[meta.palette].main, 0.12),
        '& .MuiChip-icon': { color: 'inherit', ml: 0.5 },
      })}
    />
  );
}

/** Confidence percentage shown with a tone derived from STT reliability. */
export function confidenceTone(confidence: number): 'success' | 'warning' | 'error' {
  if (confidence >= 0.9) return 'success';
  if (confidence >= 0.75) return 'warning';
  return 'error';
}
