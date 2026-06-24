import type { Lang } from '@/i18n/I18nProvider';
import { localeOf } from '@/i18n/I18nProvider';

function intlLocale(lang: Lang): string {
  return localeOf[lang];
}

export function formatDate(iso: string, lang: Lang = 'en'): string {
  return new Intl.DateTimeFormat(intlLocale(lang), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso));
}

export function formatTime(iso: string, lang: Lang = 'en'): string {
  return new Intl.DateTimeFormat(intlLocale(lang), {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatDateTime(iso: string, lang: Lang = 'en'): string {
  return new Intl.DateTimeFormat(intlLocale(lang), {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

/** Human-friendly relative time, e.g. "12 min ago" / "3시간 전". */
export function timeAgo(iso: string, lang: Lang = 'en'): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const rtf = new Intl.RelativeTimeFormat(intlLocale(lang), { numeric: 'auto' });
  const minutes = Math.round(diffMs / 60000);
  if (Math.abs(minutes) < 60) return rtf.format(-minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(-hours, 'hour');
  const days = Math.round(hours / 24);
  return rtf.format(-days, 'day');
}

/** Relative time for a future timestamp, e.g. "in 25 min" / "due now". */
export function dueIn(iso: string, lang: Lang = 'en'): string {
  const diffMin = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
  const rtf = new Intl.RelativeTimeFormat(intlLocale(lang), { numeric: 'auto' });
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
  return rtf.format(Math.round(diffMin / 60), 'hour');
}

export function formatNumber(value: number, lang: Lang = 'en', fractionDigits = 0): string {
  return new Intl.NumberFormat(intlLocale(lang), {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function secondsToClock(total: number): string {
  const m = Math.floor(total / 60);
  const s = Math.floor(total % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
