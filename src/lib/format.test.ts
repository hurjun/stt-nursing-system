import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  dueIn,
  formatDate,
  formatDateTime,
  formatNumber,
  formatTime,
  initialsOf,
  secondsToClock,
  timeAgo,
} from '@/lib/format';

describe('secondsToClock', () => {
  it('formats seconds as m:ss with a zero-padded seconds field', () => {
    expect(secondsToClock(0)).toBe('0:00');
    expect(secondsToClock(5)).toBe('0:05');
    expect(secondsToClock(65)).toBe('1:05');
    expect(secondsToClock(125)).toBe('2:05');
    expect(secondsToClock(600)).toBe('10:00');
  });
});

describe('initialsOf', () => {
  it('takes the first letter of up to the first two name parts, uppercased', () => {
    expect(initialsOf('Hur Jun')).toBe('HJ');
    expect(initialsOf('Park Min Soo')).toBe('PM');
    expect(initialsOf('Madonna')).toBe('M');
    expect(initialsOf('kim')).toBe('K');
  });
});

describe('formatNumber', () => {
  it('groups thousands using the active locale', () => {
    expect(formatNumber(1234, 'en')).toBe('1,234');
    expect(formatNumber(1_000_000, 'en')).toBe('1,000,000');
  });

  it('honours the requested fraction-digit count', () => {
    expect(formatNumber(1234.5, 'en', 1)).toBe('1,234.5');
    expect(formatNumber(2, 'en', 2)).toBe('2.00');
  });
});

describe('locale-aware date/time formatting', () => {
  // A mid-day UTC instant so the calendar date is stable across time zones.
  const iso = '2026-06-27T12:00:00.000Z';

  it('formats a date with a short month in the active locale', () => {
    const en = formatDate(iso, 'en');
    expect(en).toMatch(/Jun/);
    expect(en).toMatch(/2026/);
  });

  it('produces a different rendering for Korean', () => {
    const en = formatDate(iso, 'en');
    const ko = formatDate(iso, 'ko');
    expect(ko).toMatch(/2026/);
    expect(ko).not.toBe(en);
  });

  it('defaults to English when no language is given', () => {
    expect(formatDate(iso)).toBe(formatDate(iso, 'en'));
  });

  it('renders an hour:minute clock for the time helpers', () => {
    expect(formatTime(iso, 'en')).toMatch(/\d{1,2}:\d{2}/);
    expect(formatDateTime(iso, 'en')).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe('relative time helpers', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-27T12:00:00.000Z'));
  });
  afterAll(() => vi.useRealTimers());

  const minutesAgo = (n: number) => new Date(Date.now() - n * 60_000).toISOString();
  const minutesAhead = (n: number) => new Date(Date.now() + n * 60_000).toISOString();

  it('renders past timestamps with timeAgo', () => {
    expect(timeAgo(minutesAgo(5), 'en')).toBe('5 minutes ago');
    expect(timeAgo(minutesAgo(120), 'en')).toBe('2 hours ago');
    expect(timeAgo(minutesAgo(3 * 24 * 60), 'en')).toBe('3 days ago');
  });

  it('renders future timestamps with dueIn', () => {
    expect(dueIn(minutesAhead(25), 'en')).toBe('in 25 minutes');
    expect(dueIn(minutesAhead(120), 'en')).toBe('in 2 hours');
  });
});
