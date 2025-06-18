"use client";
import { Quiz } from "@/types/Quiz";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { useToastContext } from "./ToastContext";
import { useSession } from "next-auth/react";
import { useLanguage } from "./LanguageToLearnContext";
import { useLocale, useTranslations } from "next-intl";
import useLocalStorage from "@/hooks/useLocalStorage";

interface QuizContextType {
  quiz: Quiz[];
  setQuiz: (quizes: Quiz[]) => void;
  isLoading: boolean;
  generateQuiz: () => void;
}

const QuizContext = createContext<QuizContextType>({
  quiz: [],
  setQuiz: () => {},
  isLoading: false,
  generateQuiz: () => {},
});

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [, setStoredQuizzes] = useLocalStorage<{ quizzes: Quiz[] }>("quizes", { quizzes: [] });

  const [quiz, setQuiz] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data: session, status } = useSession();
  const { selectedLanguage } = useLanguage();
  const { showToast } = useToastContext();
  const t = useTranslations("ai-quiz-generator");
  const currentLocale = useLocale();

  const generateQuiz = useCallback(() => {
    if (status === "authenticated") {
      setIsLoading(true);
      fetch("/api/ai-gen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session,
          languageToLearn: selectedLanguage.language,
          userLanguage: currentLocale,
        }),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Something went wrong and the quiz could not be generated.");
          }
          return res.json();
        })
        .then((data) => {
          setStoredQuizzes({ quizzes: data.quizzes });
          setQuiz(data.quizzes);
        })
        .catch(() => {
          showToast({
            message: t("error-generating quiz"),
            variant: "error",
            duration: 3000,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      showToast({
        message: t("error-generating quiz"),
        variant: "error",
        duration: 3000,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, selectedLanguage]);

  return <QuizContext.Provider value={{ quiz, setQuiz, isLoading, generateQuiz }}>{children}</QuizContext.Provider>;
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuiz must be used within a WordsProvider");
  }
  return context;
};
