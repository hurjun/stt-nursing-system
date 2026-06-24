import type { Ward } from '@/types/clinical';

/** Inpatient nursing units. Codes follow a floor-wing convention (e.g. 7E = 7th floor, East wing). */
export const WARDS: Ward[] = [
  {
    id: 'icu-5w',
    code: '5W',
    name: { en: 'Medical ICU', ko: '내과계 중환자실' },
    specialty: { en: 'Critical Care', ko: '중환자 의학' },
    floor: '5F',
    beds: 16,
  },
  {
    id: 'imu-7e',
    code: '7E',
    name: { en: 'Internal Medicine Unit', ko: '내과 병동' },
    specialty: { en: 'Internal Medicine', ko: '내과' },
    floor: '7F',
    beds: 34,
  },
  {
    id: 'sur-8e',
    code: '8E',
    name: { en: 'General Surgery Unit', ko: '외과 병동' },
    specialty: { en: 'General Surgery', ko: '일반외과' },
    floor: '8F',
    beds: 30,
  },
  {
    id: 'card-6w',
    code: '6W',
    name: { en: 'Cardiology Unit', ko: '심장내과 병동' },
    specialty: { en: 'Cardiology', ko: '순환기내과' },
    floor: '6F',
    beds: 28,
  },
  {
    id: 'neu-9e',
    code: '9E',
    name: { en: 'Neurology Unit', ko: '신경과 병동' },
    specialty: { en: 'Neurology', ko: '신경과' },
    floor: '9F',
    beds: 26,
  },
];
