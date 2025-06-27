"use client";
import { Quiz } from "@/types/Quiz";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { useToastContext } from "./ToastContext";
import { useSession } from "next-auth/react";
import { useLanguage } from "./LanguageToLearnContext";
import { useLocale, useTranslations } from "next-intl";
import useLocalStorage from "@/hooks/useLocalStorage";

interface QuizContextType {
  clientQuizzes: Quiz[];
  storedQuizzesData: { quizzes: Quiz[] };
  setClientQuizzes: (quizes: Quiz[]) => void;
  isLoading: boolean;
  generateQuiz: () => Promise<{ success: boolean } | undefined>;
}

const QuizContext = createContext<QuizContextType>({
  clientQuizzes: [],
  storedQuizzesData: { quizzes: [] },
  setClientQuizzes: () => {},
  isLoading: false,
  generateQuiz: async () => ({ success: false }),
});

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const { setValue: setStoredQuizzes, storedValue: storedQuizzesData } = useLocalStorage<{ quizzes: Quiz[] }>("quizes", { quizzes: [] });

  const [clientQuizzes, setClientQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data: session, status } = useSession();
  const { selectedLanguage } = useLanguage();
  const { showToast } = useToastContext();
  const t = useTranslations("ai-quiz-generator");
  const currentLocale = useLocale();

  const generateQuiz = useCallback(async () => {
    if (status === "authenticated") {
      setIsLoading(true);
      try {
        const res = await fetch("/api/ai-gen", {
          // Await the fetch
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session,
            languageToLearn: selectedLanguage.language,
            userLanguage: currentLocale,
          }),
        });

        if (!res.ok) {
          throw new Error("Something went wrong and the quiz could not be generated.");
        }

        const data = await res.json();
        setStoredQuizzes({ quizzes: data.quizzes });
        setClientQuizzes(data.quizzes);
        return { success: true };
      } catch (error) {
        console.error("Error generating quiz:", error);
        showToast({
          message: t("error-generating quiz"),
          variant: "error",
          duration: 3000,
        });
        return { success: false };
      } finally {
        setIsLoading(false);
      }
    } else {
      showToast({
        message: t("error-generating quiz"),
        variant: "error",
        duration: 3000,
      });
      return { success: false };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, selectedLanguage]);

  return (
    <QuizContext.Provider value={{ clientQuizzes, setClientQuizzes, isLoading, generateQuiz, storedQuizzesData }}>{children}</QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuiz must be used within a WordsProvider");
  }
  return context;
};
