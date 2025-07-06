import WordList from "@/components/Words/WordList";
import LanguageToLearn from "@/components/Layout/LanguageToLearn";
import WordForm from "@/components/Words/WordForm";
import AiQuizGenerator from "@/components/AI/AiQuizzGenerator";
import { requireAuthSSR } from "@/lib/auth/authGuardSSR";
import { getLocale } from 'next-intl/server';

export default async function CardsPage() {
  const locale = await getLocale();
  await requireAuthSSR(`/${locale}/onboarding`);

  return (
    <main
      className="min-h-screen w-screen md:w-xl px-5 md:px-0 flex flex-col items-center justify-start
     py-20"
    >
      <LanguageToLearn className="mb-5" />
      <div className="flex w-full gap-5 items-center justify-between md:justify-end mb-5">
        <AiQuizGenerator />
        <WordForm />
      </div>
      <WordList />
    </main>
  );
}
