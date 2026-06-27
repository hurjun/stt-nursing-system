import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  ageFromDob,
  bmi,
  bmiCategory,
  bradenRisk,
  computeLabFlag,
  meanArterialPressure,
  morseRisk,
  newsLikeScore,
  vitalTone,
} from '@/lib/clinical';
import type { VitalSample } from '@/types/clinical';

/** Builds a vital-sign sample from a normal baseline plus overrides. */
function vital(overrides: Partial<VitalSample> = {}): VitalSample {
  return {
    timestamp: '2026-06-27T08:00:00.000Z',
    hr: 74,
    sbp: 122,
    dbp: 76,
    rr: 16,
    temp: 36.6,
    spo2: 98,
    pain: 1,
    ...overrides,
  };
}

describe('ageFromDob', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-27T12:00:00.000Z'));
  });
  afterAll(() => vi.useRealTimers());

  it('computes whole years when the birthday has already passed this year', () => {
    expect(ageFromDob('1990-06-15')).toBe(36);
  });

  it('subtracts a year when the birthday has not occurred yet', () => {
    expect(ageFromDob('1990-12-31')).toBe(35);
  });

  it('returns 0 for a birth date within the current year', () => {
    expect(ageFromDob('2026-01-10')).toBe(0);
  });
});

describe('bmi', () => {
  it('computes body mass index to one decimal place', () => {
    expect(bmi(170, 70)).toBe(24.2);
    expect(bmi(180, 100)).toBe(30.9);
    expect(bmi(160, 45)).toBe(17.6);
    expect(bmi(170, 80)).toBe(27.7);
  });
});

describe('bmiCategory', () => {
  it('classifies each WHO band with its display tone', () => {
    expect(bmiCategory(17.6)).toEqual({ label: 'Underweight', tone: 'low' });
    expect(bmiCategory(24.2)).toEqual({ label: 'Normal', tone: 'normal' });
    expect(bmiCategory(27.7)).toEqual({ label: 'Overweight', tone: 'high' });
    expect(bmiCategory(30.9)).toEqual({ label: 'Obese', tone: 'critical' });
  });

  it('treats band edges as the higher-numbered category boundary', () => {
    expect(bmiCategory(18.5).label).toBe('Normal');
    expect(bmiCategory(25).label).toBe('Overweight');
    expect(bmiCategory(30).label).toBe('Obese');
  });
});

describe('computeLabFlag', () => {
  // Sodium-style reference interval: 135–145 (span 10).
  it('flags values inside the reference interval as Normal', () => {
    expect(computeLabFlag(140, 135, 145)).toBe('N');
    expect(computeLabFlag(135, 135, 145)).toBe('N');
    expect(computeLabFlag(145, 135, 145)).toBe('N');
  });

  it('flags low and high values relative to the interval', () => {
    expect(computeLabFlag(134, 135, 145)).toBe('L');
    expect(computeLabFlag(146, 135, 145)).toBe('H');
  });

  it('flags critically low below one span under the low limit', () => {
    expect(computeLabFlag(125, 135, 145)).toBe('L'); // exactly at the LL threshold
    expect(computeLabFlag(124, 135, 145)).toBe('LL');
  });

  it('flags critically high above two spans over the high limit', () => {
    expect(computeLabFlag(165, 135, 145)).toBe('H'); // exactly at the HH threshold
    expect(computeLabFlag(166, 135, 145)).toBe('HH');
  });

  it('falls back to a span of 1 when the interval is degenerate', () => {
    expect(computeLabFlag(5, 5, 5)).toBe('N');
    expect(computeLabFlag(4, 5, 5)).toBe('L');
    expect(computeLabFlag(3, 5, 5)).toBe('LL');
    expect(computeLabFlag(6, 5, 5)).toBe('H');
    expect(computeLabFlag(8, 5, 5)).toBe('HH');
  });
});

describe('bradenRisk', () => {
  it('maps total scores to pressure-injury risk bands', () => {
    expect(bradenRisk(6)).toBe('severe');
    expect(bradenRisk(9)).toBe('severe');
    expect(bradenRisk(10)).toBe('high');
    expect(bradenRisk(12)).toBe('high');
    expect(bradenRisk(13)).toBe('moderate');
    expect(bradenRisk(14)).toBe('moderate');
    expect(bradenRisk(15)).toBe('mild');
    expect(bradenRisk(18)).toBe('mild');
    expect(bradenRisk(19)).toBe('none');
    expect(bradenRisk(23)).toBe('none');
  });
});

describe('morseRisk', () => {
  it('maps total scores to fall-risk bands', () => {
    expect(morseRisk(0)).toBe('low');
    expect(morseRisk(24)).toBe('low');
    expect(morseRisk(25)).toBe('moderate');
    expect(morseRisk(44)).toBe('moderate');
    expect(morseRisk(45)).toBe('high');
    expect(morseRisk(125)).toBe('high');
  });
});

describe('vitalTone', () => {
  it('classifies a value against its metric reference range', () => {
    expect(vitalTone('hr', 50)).toBe('low');
    expect(vitalTone('hr', 74)).toBe('normal');
    expect(vitalTone('hr', 120)).toBe('high');
    expect(vitalTone('spo2', 90)).toBe('low');
    expect(vitalTone('spo2', 98)).toBe('normal');
    expect(vitalTone('temp', 35)).toBe('low');
    expect(vitalTone('temp', 38)).toBe('high');
  });
});

describe('meanArterialPressure', () => {
  it('computes (SBP + 2·DBP)/3, rounded', () => {
    expect(meanArterialPressure(vital({ sbp: 120, dbp: 80 }))).toBe(93);
    expect(meanArterialPressure(vital({ sbp: 140, dbp: 90 }))).toBe(107);
  });
});

describe('newsLikeScore', () => {
  it('scores normal vitals as zero', () => {
    expect(newsLikeScore(vital())).toBe(0);
  });

  it('accumulates points across deranged parameters', () => {
    const deteriorating = vital({ hr: 95, sbp: 105, dbp: 70, rr: 21, temp: 38.5, spo2: 95 });
    expect(newsLikeScore(deteriorating)).toBe(6);
  });

  it('scores a critically unwell patient highly', () => {
    const critical = vital({ hr: 112, sbp: 98, dbp: 60, rr: 25, temp: 38.3, spo2: 90 });
    expect(newsLikeScore(critical)).toBe(11);
  });
});

describe('newsLikeScore — single-parameter derangements', () => {
  // Each case derangess exactly one vital sign from the normal baseline, so the
  // expected score isolates one threshold band of the early-warning calculation.
  const cases: Array<[string, Partial<VitalSample>, number]> = [
    ['bradypnoea (RR 8)', { rr: 8 }, 3],
    ['borderline tachypnoea (RR 21)', { rr: 21 }, 2],
    ['severe tachypnoea (RR 25)', { rr: 25 }, 3],
    ['mild hypoxia (SpO2 95)', { spo2: 95 }, 1],
    ['moderate hypoxia (SpO2 92)', { spo2: 92 }, 2],
    ['severe hypoxia (SpO2 91)', { spo2: 91 }, 3],
    ['mild hypotension (SBP 110)', { sbp: 110 }, 1],
    ['moderate hypotension (SBP 100)', { sbp: 100 }, 2],
    ['severe hypotension (SBP 90)', { sbp: 90 }, 3],
    ['hypertensive crisis (SBP 220)', { sbp: 220 }, 3],
    ['mild bradycardia (HR 50)', { hr: 50 }, 1],
    ['borderline tachycardia (HR 91)', { hr: 91 }, 1],
    ['tachycardia (HR 111)', { hr: 111 }, 2],
    ['severe bradycardia (HR 40)', { hr: 40 }, 3],
    ['severe tachycardia (HR 131)', { hr: 131 }, 3],
    ['low-grade fever (temp 38.1)', { temp: 38.1 }, 1],
    ['high fever (temp 39.1)', { temp: 39.1 }, 2],
    ['hypothermia (temp 35)', { temp: 35 }, 2],
  ];

  it.each(cases)('scores %s as %i points above baseline', (_label, overrides, expected) => {
    expect(newsLikeScore(vital(overrides))).toBe(expected);
  });

  it('treats one step inside each threshold as normal (zero points)', () => {
    expect(newsLikeScore(vital({ rr: 20 }))).toBe(0);
    expect(newsLikeScore(vital({ spo2: 96 }))).toBe(0);
    expect(newsLikeScore(vital({ sbp: 111 }))).toBe(0);
    expect(newsLikeScore(vital({ hr: 90 }))).toBe(0);
    expect(newsLikeScore(vital({ hr: 51 }))).toBe(0);
    expect(newsLikeScore(vital({ temp: 38.0 }))).toBe(0);
  });
});

describe('vitalTone — reference-range boundaries', () => {
  it('treats the inclusive low and high limits as normal', () => {
    expect(vitalTone('hr', 60)).toBe('normal'); // low limit
    expect(vitalTone('hr', 100)).toBe('normal'); // high limit
    expect(vitalTone('temp', 36.1)).toBe('normal');
    expect(vitalTone('temp', 37.5)).toBe('normal');
    expect(vitalTone('spo2', 94)).toBe('normal');
  });

  it('flags one step outside each limit', () => {
    expect(vitalTone('hr', 59)).toBe('low');
    expect(vitalTone('hr', 101)).toBe('high');
    expect(vitalTone('temp', 36.0)).toBe('low');
    expect(vitalTone('temp', 37.6)).toBe('high');
    expect(vitalTone('spo2', 93)).toBe('low');
  });
});

describe('ageFromDob — calendar edge cases', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-27T12:00:00.000Z'));
  });
  afterAll(() => vi.useRealTimers());

  it('counts a leap-day birthday whose month has already passed', () => {
    expect(ageFromDob('2000-02-29')).toBe(26);
  });

  it('counts the birthday itself as the new age', () => {
    expect(ageFromDob('1991-06-27')).toBe(35);
  });

  it('does not credit a birthday later this month or in a later month', () => {
    expect(ageFromDob('1991-06-28')).toBe(34);
    expect(ageFromDob('1991-07-01')).toBe(34);
  });
});
