"use client";
import WordList from "@/components/Words/WordList";
import LanguageToLearn from "@/components/LanguageToLearn";
import WordForm from "@/components/Words/WordForm";
import AiQuizzGenerator from "@/components/AiQuizzGenerator";
import { useWords } from "@/context/wordsContext";
import LoadingComponent from "@/components/Layout/LoadingComponen";

export default function CardsPage() {
  const { loading, words } = useWords();

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <main
      className="min-h-screen w-screen md:w-xl px-5 md:px-0 flex flex-col items-center justify-start
     py-20"
    >
      <LanguageToLearn className="mb-5" />
      <div className="flex w-full gap-5 items-center justify-between md:justify-end mb-5">
        <AiQuizzGenerator words={words} />
        <WordForm />
      </div>
      <WordList />
    </main>
  );
}
