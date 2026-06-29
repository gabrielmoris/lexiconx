import { requireAuthSSR } from '@/lib/auth/authGuardSSR';
import { getLocale, getTranslations } from 'next-intl/server';
import DecksManager from '@/components/Decks/DecksManager';

export default async function DecksPage() {
  const locale = await getLocale();
  await requireAuthSSR(`/${locale}/onboarding`);
  const t = await getTranslations('decks');

  return (
    <main className="min-h-screen w-full md:w-5/6 px-5 md:px-0 flex flex-col items-center justify-start pt-10 pb-20 md:py-15">
      <div className="w-full mb-6 text-center md:text-left">
        <h1 className="text-2xl font-bold text-theme-text-light dark:text-theme-text-dark">
          {t('title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('subtitle')}</p>
      </div>
      <DecksManager />
    </main>
  );
}
