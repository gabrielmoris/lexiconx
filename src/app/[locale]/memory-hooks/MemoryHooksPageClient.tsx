'use client';

import { useLocale, useTranslations } from 'next-intl';
import MemoryHooksDeck from '@/components/MemoryHooks/MemoryHooksDeck';
import { Locale } from '@/types/Words';

const MemoryHooksPageClient = () => {
  const locale = useLocale() as Locale;
  const t = useTranslations('memory-hooks');

  return (
    <main className="min-h-screen w-full md:w-5/6 px-5 md:px-0 flex flex-col items-center justify-start pt-10 pb-20 md:py-15">
      <h1 className="text-2xl font-bold text-theme-text-light dark:text-theme-text-dark mb-4">
        {t('title')}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-md text-center">
        {t('subtitle')}
      </p>
      <MemoryHooksDeck userLocale={locale} />
    </main>
  );
};

export default MemoryHooksPageClient;
