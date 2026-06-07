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

export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]; // don’t mutate original
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
