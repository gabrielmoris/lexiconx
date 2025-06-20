"use client";
import SoundIcon from "@/components/Icons/SoundIcon";
import TextIcon from "@/components/Icons/TextIcon";
import LoadingComponent from "@/components/Layout/LoadingComponen";
import { useQuiz } from "@/context/QuizContext";
import useLocalStorage from "@/hooks/useLocalStorage";
import useTextToSpeech from "@/hooks/useTextToSpeech";
import { Link, useRouter } from "@/src/i18n/navigation";
import type { Quiz as QuizType } from "@/types/Quiz"; // Renamed to avoid conflict with component name
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

const Quiz = () => {
  const { quiz: contextQuiz, isLoading: isGeneratingQuiz } = useQuiz();
  const [storedQuizzesData, , isLocalStorageHydrated] = useLocalStorage<{ quizzes: QuizType[] }>("quizes", { quizzes: [] });
  const [showText, setShowText] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [questionStep, setQuestionStep] = useState(0);

  const t = useTranslations("quiz");

  const router = useRouter();

  const [displayQuiz, setDisplayQuiz] = useState<QuizType[]>([]);
  const [isLoadingComponent, setIsLoadingComponent] = useState(true);

  const { speak, getVoicesForLanguage } = useTextToSpeech({
    onError: (error) => console.error("Speech error:", error),
    rate: 1,
    pitch: 1,
  });

  useEffect(() => {
    if (!isLocalStorageHydrated) {
      return;
    }

    let quizToDisplay: QuizType[] = [];
    if (contextQuiz && contextQuiz.length > 0) {
      quizToDisplay = contextQuiz;
    } else if (storedQuizzesData.quizzes && storedQuizzesData.quizzes.length > 0) {
      quizToDisplay = storedQuizzesData.quizzes;
    }

    if (quizToDisplay.length > 0) {
      setDisplayQuiz(quizToDisplay);
      console.log(quizToDisplay);
      setIsLoadingComponent(false);
    } else {
      console.log("No quiz found in context or localStorage after hydration. Redirecting to /cards.");
      router.push("/cards");
    }
  }, [contextQuiz, storedQuizzesData.quizzes, isLocalStorageHydrated, router]);

  useEffect(() => {
    if (displayQuiz.length > 0) {
      getVoicesForLanguage(displayQuiz[quizStep].language as "chinese" | "english" | "german" | "spanish");
    }
  }, [displayQuiz, quizStep, getVoicesForLanguage]);

  const readQuiz = useCallback(() => {
    if (displayQuiz[quizStep]?.sentence) {
      speak(displayQuiz[quizStep].sentence, displayQuiz[quizStep].language as "chinese" | "english" | "german" | "spanish");
    }
  }, [displayQuiz, quizStep, speak]);

  if (isLoadingComponent || isGeneratingQuiz) {
    return <LoadingComponent />;
  }

  const handleAnswerClick = (isCorrect: boolean) => {
    if (isCorrect && questionStep < displayQuiz[quizStep].questions.length - 1) {
      setQuestionStep((prev) => prev + 1);
    } else {
      setQuizStep((prev) => prev + 1);
      setQuestionStep(0);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-20">
      <div className="flex flex-col gap-5" aria-live="polite">
        {showText ? (
          <>
            <p className="text-2xl font-bold">{displayQuiz[quizStep].sentence}</p>
            <p className="text-md font-extralight italic">{displayQuiz[quizStep].phoneticNotation}</p>
          </>
        ) : (
          <TextIcon className="w-8 h-8 cursor-pointer" onClick={() => setShowText(true)} />
        )}
        <SoundIcon className="w-8 h-8 cursor-pointer" onClick={readQuiz} />

        <p className=" text-xl">{displayQuiz[quizStep].questions[questionStep].question}</p>
        <div className="flex w-full flex-col gap-5">
          {displayQuiz[quizStep].questions[questionStep].answers.map((answer, index) => (
            <li
              key={index}
              onClick={() => handleAnswerClick(answer.isCorrect)}
              className="cursor-pointer flx items-center list-none py-1 px-5 rounded-md dark:bg-theme-fg-dark bg-theme-fg-light hover:bg-secondary"
            >
              {answer.sentence}
            </li>
          ))}
        </div>
        <section className="flex flex-col justify-start gap-0.5">
          <p className="text-[0.6rem] italic font-extralight opacity-60">{t("quiz", { current: quizStep + 1, total: displayQuiz.length })}</p>
          <p className="text-[0.6rem] italic font-extralight opacity-60">
            {t("question", { current: questionStep + 1, total: displayQuiz[quizStep].questions.length })}
          </p>
        </section>
        {displayQuiz.length === 0 && <Link href="/cards">No quiz available to display. Please generate one!</Link>}
      </div>
    </main>
  );
};

export default Quiz;
