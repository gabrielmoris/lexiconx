"use client";
import { Quiz } from "@/types/Quiz";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useToastContext } from "./ToastContext";
import { useSession } from "next-auth/react";
import { useLanguage } from "./LanguageToLearnContext";
import { useLocale, useTranslations } from "next-intl";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getUserData, quizGeneration } from "@/lib/apis";
import { Language, User } from "@/types/Words";

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
  const [userData, setUserData] = useState<User>();

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (status === "authenticated") {
        try {
          const { data } = await getUserData(session);
          setUserData(data);
        } catch (e) {
          console.error(e);
          showToast({ message: t("error-getting-user"), variant: "error", duration: 3000 });
        }
      }
    };
    fetchUser();
  }, [session, status, showToast, t]);

  const generateQuiz = useCallback(async () => {
    if (status === "authenticated") {
      setIsLoading(true);
      const learningProgress = userData?.learningProgress.find((lp) => lp.language === selectedLanguage.language);
      try {
        if (!learningProgress) {
          throw new Error("Learning progress not found");
        }
        const data = await quizGeneration(session, selectedLanguage.language, currentLocale as Language, learningProgress!.level);

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
  }, [status, selectedLanguage, userData]);

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
