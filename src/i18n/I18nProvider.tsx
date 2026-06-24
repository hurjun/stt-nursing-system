import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'ko';

/** Locale codes used by Intl formatters and the Web Speech API. */
export const localeOf: Record<Lang, string> = {
  en: 'en-US',
  ko: 'ko-KR',
};

/**
 * A translation dictionary co-located with the feature that uses it. Each entry
 * maps a stable key to the strings for every supported language, which keeps
 * features independent — no single shared catalog that every screen must edit.
 */
export type Dictionary = Record<string, Record<Lang, string>>;

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const STORAGE_KEY = 'medivoice.lang';

function readInitialLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'ko' || stored === 'en' ? stored : 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(readInitialLang);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      toggle: () => setLang((prev) => (prev === 'en' ? 'ko' : 'en')),
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLang(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useLang must be used within an I18nProvider');
  return ctx;
}

/**
 * Returns a translator bound to a local dictionary:
 *   const t = useScopedT(dict);
 *   t('save'); // -> 'Save' | '저장'
 */
export function useScopedT<D extends Dictionary>(dict: D): (key: keyof D) => string {
  const { lang } = useLang();
  return useCallback((key: keyof D) => dict[key]?.[lang] ?? String(key), [dict, lang]);
}

/** Picks the active-language string from a `{ en, ko }` value. */
export function useBilingual(): (value: { en: string; ko: string } | undefined | null) => string {
  const { lang } = useLang();
  return useCallback((value) => (value ? value[lang] : ''), [lang]);
}
