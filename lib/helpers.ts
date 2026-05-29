import { Language } from '@/types/Words';
import { Locale } from 'next-intl';

export const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export const localeToLanguage = (locale: Locale): Language => {
  const map: Record<Locale, Language> = {
    en: 'English',
    de: 'Deutsch',
    zh: '中文',
    es: 'Español',
    ru: 'русский',
  };
  return map[locale];
};
