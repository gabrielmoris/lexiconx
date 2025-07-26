import WordList from "@/components/Words/WordList";
import WordForm from "@/components/Words/WordForm";
import AiQuizGenerator from "@/components/AI/AiQuizzGenerator";
import { requireAuthSSR } from "@/lib/auth/authGuardSSR";
import { getLocale } from "next-intl/server";
import ShowLearningFlag from "@/components/Words/ShowLearningFlag";
import AiGenerateVocabulary from "@/components/AI/AiGenerateVocabulary";

export default async function CardsPage() {
  const locale = await getLocale();
  await requireAuthSSR(`/${locale}/onboarding`);

  return (
    <main
      className="min-h-screen w-full md:w-5/6 px-5 md:px-0 flex flex-col items-center justify-start
     py-10 md:py-15"
    >
      <div className="flex w-full flex-col md:flex-row gap-5 items-center justify-center md:justify-end mb-5">
        <ShowLearningFlag />
        <div className="flex w-full flex-col md:flex-row gap-5 items-ceenter justify-center md:justify-end">
          <AiQuizGenerator />
          <AiGenerateVocabulary />
          <WordForm />
        </div>
      </div>
      <WordList />
    </main>
  );
}
