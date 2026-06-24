/**
 * Design tokens for the MediVoice clinical interface.
 *
 * The palette is intentionally restrained — a calm clinical blue, generous
 * whitespace and a small set of semantic status colors — so that dense
 * clinical data stays legible during a bedside shift.
 */

export const brand = {
  50: '#EAF3FE',
  100: '#D2E6FD',
  200: '#A6CDFB',
  300: '#74AEF4',
  400: '#4A9BEE',
  500: '#1284FF',
  600: '#0B6BCB',
  700: '#084C92',
  800: '#063A70',
  900: '#04284E',
} as const;

export const teal = {
  400: '#26A69A',
  500: '#0E9384',
  600: '#0B7A6E',
} as const;

/** Semantic colors used for clinical flags, vitals and lab abnormality cues. */
export const clinical = {
  normal: '#1F9254',
  abnormalLow: '#0288D1',
  abnormalHigh: '#C77700',
  critical: '#D32F2F',
  criticalBg: '#FDECEA',
  warningBg: '#FFF6E5',
  successBg: '#E7F6EE',
  infoBg: '#E6F3FB',
} as const;

/** Vital-sign trace colors, used consistently across every chart in the app. */
export const vitalColors = {
  hr: '#E5484D',
  sbp: '#0B6BCB',
  dbp: '#74AEF4',
  rr: '#0E9384',
  temp: '#C77700',
  spo2: '#7C3AED',
  pain: '#DB2777',
} as const;

/** Ordered categorical palette for bar / pie / radar charts. */
export const chartCategorical = [
  '#0B6BCB',
  '#0E9384',
  '#7C3AED',
  '#C77700',
  '#E5484D',
  '#2563EB',
  '#DB2777',
  '#15803D',
] as const;

export const acuityColor: Record<string, string> = {
  stable: '#1F9254',
  guarded: '#0288D1',
  serious: '#C77700',
  critical: '#D32F2F',
};
