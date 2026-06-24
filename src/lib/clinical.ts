import type { LabFlag, VitalSample } from '@/types/clinical';

/** Derives age in whole years from an ISO date of birth. */
export function ageFromDob(dob: string): number {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

export function bmi(heightCm: number, weightKg: number): number {
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

export function bmiCategory(value: number): { label: string; tone: 'low' | 'normal' | 'high' | 'critical' } {
  if (value < 18.5) return { label: 'Underweight', tone: 'low' };
  if (value < 25) return { label: 'Normal', tone: 'normal' };
  if (value < 30) return { label: 'Overweight', tone: 'high' };
  return { label: 'Obese', tone: 'critical' };
}

/** Flags a lab value against its reference interval, with critical bands. */
export function computeLabFlag(value: number, refLow: number, refHigh: number): LabFlag {
  const span = refHigh - refLow || 1;
  if (value < refLow - span) return 'LL';
  if (value < refLow) return 'L';
  if (value > refHigh + span * 2) return 'HH';
  if (value > refHigh) return 'H';
  return 'N';
}

export const LAB_FLAG_META: Record<LabFlag, { label: string; tone: 'normal' | 'low' | 'high' | 'critical' }> = {
  N: { label: 'Normal', tone: 'normal' },
  L: { label: 'Low', tone: 'low' },
  H: { label: 'High', tone: 'high' },
  LL: { label: 'Critically low', tone: 'critical' },
  HH: { label: 'Critically high', tone: 'critical' },
};

export function bradenRisk(total: number): 'severe' | 'high' | 'moderate' | 'mild' | 'none' {
  if (total <= 9) return 'severe';
  if (total <= 12) return 'high';
  if (total <= 14) return 'moderate';
  if (total <= 18) return 'mild';
  return 'none';
}

export function morseRisk(total: number): 'high' | 'moderate' | 'low' {
  if (total >= 45) return 'high';
  if (total >= 25) return 'moderate';
  return 'low';
}

/** Normal adult reference ranges for vital signs, used for trend flagging. */
export const VITAL_RANGES = {
  hr: { low: 60, high: 100, unit: 'bpm', label: 'Heart Rate' },
  sbp: { low: 90, high: 140, unit: 'mmHg', label: 'Systolic BP' },
  dbp: { low: 60, high: 90, unit: 'mmHg', label: 'Diastolic BP' },
  rr: { low: 12, high: 20, unit: '/min', label: 'Respiratory Rate' },
  temp: { low: 36.1, high: 37.5, unit: '°C', label: 'Temperature' },
  spo2: { low: 94, high: 100, unit: '%', label: 'SpO₂' },
  pain: { low: 0, high: 3, unit: '/10', label: 'Pain' },
} as const;

export type VitalMetric = keyof typeof VITAL_RANGES;

export function vitalTone(metric: VitalMetric, value: number): 'normal' | 'low' | 'high' {
  const range = VITAL_RANGES[metric];
  if (value < range.low) return 'low';
  if (value > range.high) return 'high';
  return 'normal';
}

/** Mean arterial pressure from a vital sample. */
export function meanArterialPressure(v: VitalSample): number {
  return Math.round((v.sbp + 2 * v.dbp) / 3);
}

/** A compact early-warning style acuity score from the latest vitals. */
export function newsLikeScore(v: VitalSample): number {
  let score = 0;
  if (v.rr <= 8 || v.rr >= 25) score += 3;
  else if (v.rr >= 21) score += 2;
  if (v.spo2 <= 91) score += 3;
  else if (v.spo2 <= 93) score += 2;
  else if (v.spo2 <= 95) score += 1;
  if (v.sbp <= 90 || v.sbp >= 220) score += 3;
  else if (v.sbp <= 100) score += 2;
  else if (v.sbp <= 110) score += 1;
  if (v.hr <= 40 || v.hr >= 131) score += 3;
  else if (v.hr >= 111) score += 2;
  else if (v.hr >= 91 || v.hr <= 50) score += 1;
  if (v.temp <= 35 || v.temp >= 39.1) score += 2;
  else if (v.temp >= 38.1) score += 1;
  return score;
}
