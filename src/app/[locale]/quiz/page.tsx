/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import SoundIcon from "@/components/Icons/SoundIcon";
import TextIcon from "@/components/Icons/TextIcon";
import LoadingComponent from "@/components/Layout/LoadingComponen";
import { useQuiz } from "@/context/QuizContext";
import { useToastContext } from "@/context/ToastContext";
import useLocalStorage from "@/hooks/useLocalStorage";
import useTextToSpeech from "@/hooks/useTextToSpeech";
import { Link, useRouter } from "@/src/i18n/navigation";
import type { QuizAnswer, Quiz } from "@/types/Quiz";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { failWords, successWords } from "@/lib/correctionWords";
import { Word, User } from "@/types/Words";
import QuyizFinished from "@/components/Quiz/QuyizFinished";
import { calculateNextReviewData } from "@/lib/models/calculateNextReview";

const QuizPage = () => {
  const { quiz: contextQuiz, isLoading: isGeneratingQuiz } = useQuiz();
  const {
    storedValue: storedQuizzesData,
    isHydrated: isLocalStorageHydrated,
    // deleteValue,
  } = useLocalStorage<{ quizzes: Quiz[] }>("quizes", { quizzes: [] });

  const [showText, setShowText] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [questionStep, setQuestionStep] = useState(0);
  const [isCorrect, setIsCorrect] = useState("");
  const [isWrong, setIsWrong] = useState("");
  const [usedWords, setUsedWords] = useState<Word[]>([]);
  const [successPoints, setSuccessPoints] = useState({ errors: 0, success: 0 });
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [displayQuiz, setDisplayQuiz] = useState<Quiz[]>([]);
  const [isLoadingComponent, setIsLoadingComponent] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);

  const t = useTranslations("quiz");
  const { showToast } = useToastContext();
  const router = useRouter();
  const { data: session, status } = useSession();

  const { speak, getVoicesForLanguage } = useTextToSpeech({
    onError: (error) => console.error("Speech error:", error),
    rate: 1,
    pitch: 1,
  });

  const getUserData = useCallback(
    async (session: Session | null) => {
      const apiCall = await fetch(`/api/users?email=${session?.user?.email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!apiCall.ok) {
        showToast({
          message: t("error-getting-user"),
          variant: "error",
          duration: 3000,
        });
      }

      return await apiCall.json();
    },
    [session]
  );

  const saveWordsData = useCallback(
    async (session: Session | null, words: Word[]) => {
      const apiCall = await fetch(`/api/words`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session, words }),
      });

      if (!apiCall.ok) {
        showToast({
          message: t("error-getting-user"),
          variant: "error",
          duration: 3000,
        });
      }

      return await apiCall.json();
    },
    [usedWords]
  );

  useEffect(() => {
    if (status === "authenticated") {
      getUserData(session).then(({ data }: { data: User }) => {
        setUserData(data);
      });
    }
  }, [getUserData, session, status]);

  useEffect(() => {
    if (!isLocalStorageHydrated) {
      return;
    }

    let quizToDisplay: Quiz[] = [];
    if (contextQuiz && contextQuiz.length > 0) {
      quizToDisplay = contextQuiz;
    } else if (storedQuizzesData.quizzes && storedQuizzesData.quizzes.length > 0) {
      quizToDisplay = storedQuizzesData.quizzes;
    }

    if (quizToDisplay.length > 0) {
      setDisplayQuiz(quizToDisplay);
      setIsLoadingComponent(false);
    } else {
      console.log("No quiz found in context or localStorage after hydration. Redirecting to /cards.");
      router.push("/cards");
    }
  }, [contextQuiz, storedQuizzesData.quizzes, isLocalStorageHydrated, router]);

  useEffect(() => {
    if (displayQuiz.length > 0) {
      getVoicesForLanguage(displayQuiz[quizStep]?.language as "chinese" | "english" | "german" | "spanish");
    }
  }, [displayQuiz, quizStep, getVoicesForLanguage]);

  const readQuiz = useCallback(() => {
    if (displayQuiz[quizStep]?.sentence) {
      speak(displayQuiz[quizStep].sentence, displayQuiz[quizStep].language as "chinese" | "english" | "german" | "spanish");
    }
  }, [displayQuiz, quizStep, speak]);

  const handleAnswerClick = (option: QuizAnswer) => {
    if (quizStep > displayQuiz.length - 1 && questionStep > displayQuiz[quizStep].questions.length - 1) {
      return;
    }

    if (option.isCorrect) {
      setSuccessPoints({ ...successPoints, success: successPoints.success + 1 });
      setIsCorrect(option.answer);
      const newWordsToAdd = successWords(displayQuiz[quizStep].usedWords);
      setUsedWords((prevUsedWords) => {
        const wordDefinitionMap = new Map();

        prevUsedWords.forEach((wordObj) => {
          const key = `${wordObj.word}|${wordObj.definition}`;
          wordDefinitionMap.set(key, wordObj);
        });

        newWordsToAdd.forEach((wordObj) => {
          const key = `${wordObj.word}|${wordObj.definition}`;
          wordDefinitionMap.set(key, wordObj); // It overwrites if key exists
        });

        return Array.from(wordDefinitionMap.values());
      });
    } else {
      setSuccessPoints({ ...successPoints, errors: successPoints.errors + 1 });
      setIsWrong(option.answer);
      const newWordsToAdd = failWords(displayQuiz[quizStep].usedWords);
      setUsedWords((prevUsedWords) => {
        const wordDefinitionMap = new Map();

        prevUsedWords.forEach((wordObj) => {
          const key = `${wordObj.word}|${wordObj.definition}`;
          wordDefinitionMap.set(key, wordObj);
        });

        newWordsToAdd.forEach((wordObj) => {
          const key = `${wordObj.word}|${wordObj.definition}`;
          wordDefinitionMap.set(key, wordObj); // It overwrites if key exists
        });

        return Array.from(wordDefinitionMap.values());
      });
    }

    if (questionStep < displayQuiz[quizStep].questions.length - 1) {
      setTimeout(() => {
        setIsCorrect("");
        setIsWrong("");
        setQuestionStep((prev) => prev + 1);
      }, 0); // change to 2000
    } else {
      setTimeout(() => {
        setQuizStep((prev) => prev + 1);
        setQuestionStep(0);
      }, 0); // change to 2000
    }
  };

  useEffect(() => {
    if (displayQuiz.length && quizStep > displayQuiz.length - 1 && userData) {
      // TODO:
      // 1. save words to DB
      // 2. calculate next review date
      // 3. update user data
      // 4. delete localstorage

      saveWordsData(session, usedWords).then(({ data: wordsData }: { data: Word[] }) => {
        const lastUpdatedWords = calculateNextReviewData(wordsData, userData);
        console.log("lastUpdatedWords => ", lastUpdatedWords);
        console.log("successPoints => ", successPoints);
        // deleteValue(); // delete localstorage enable for prod
        setIsQuizFinished(true); // quiz finished
      });
    }
  }, [displayQuiz, quizStep, session, usedWords, userData]);

  if (isLoadingComponent || isGeneratingQuiz) {
    return <LoadingComponent />;
  }

  if (isQuizFinished) {
    return (
      <QuyizFinished
        isSuccess={successPoints.success / 2 > successPoints.errors}
        successPoints={successPoints}
        onRestartQuiz={() => {
          setQuizStep(0);
          setQuestionStep(0);
          setIsQuizFinished(false);
          setSuccessPoints({ errors: 0, success: 0 });
        }}
      />
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-20">
      <div className="flex flex-col gap-5" aria-live="polite">
        {showText ? (
          <>
            <p className="text-2xl font-bold">{displayQuiz[quizStep]?.sentence}</p>
            <p className="text-md font-extralight italic">{displayQuiz[quizStep]?.phoneticNotation}</p>
          </>
        ) : (
          <TextIcon className="w-8 h-8 cursor-pointer" onClick={() => setShowText(true)} />
        )}
        <SoundIcon className="w-8 h-8 cursor-pointer" onClick={readQuiz} />

        <p className=" text-xl">{displayQuiz[quizStep]?.questions[questionStep].question}</p>
        <div className="flex w-full flex-col gap-5">
          {displayQuiz[quizStep]?.questions[questionStep]?.options.map((option, index) => (
            <li
              key={index}
              onClick={() => handleAnswerClick(option)}
              className={`cursor-pointer flex items-center list-none py-1 px-5 rounded-md dark:bg-theme-fg-dark bg-theme-fg-light hover:bg-secondary
                ${isCorrect === option.answer ? "blink-success" : ""}
                ${isWrong === option.answer && !option.isCorrect ? "blink-error" : ""}
              `}
            >
              {option.answer}
            </li>
          ))}
        </div>
        <section className="flex flex-col justify-start gap-0.5">
          <p className="text-[0.6rem] italic font-extralight opacity-60">{t("quiz", { current: quizStep + 1, total: displayQuiz.length })}</p>
          <p className="text-[0.6rem] italic font-extralight opacity-60">
            {t("question", { current: questionStep + 1, total: displayQuiz[quizStep]?.questions.length })}
          </p>
        </section>
        {displayQuiz.length === 0 && <Link href="/cards">No quiz available to display. Please generate one!</Link>}
      </div>
    </main>
  );
};

export default QuizPage;
