"use client";
import { Quiz } from "@/types/Quiz";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { useToastContext } from "./ToastContext";
import { useSession } from "next-auth/react";
import { useLanguage } from "./LanguageToLearnContext";
import { useTranslations } from "next-intl";

interface QuizContextType {
  quiz: Quiz;
  setQuiz: (question: Quiz) => void;
  isLoading: boolean;
  generateQuiz: () => void;
}

const QuizContext = createContext<QuizContextType>({
  quiz: { sentence: "", usedWords: [], answers: [] },
  setQuiz: () => {},
  isLoading: false,
  generateQuiz: () => {},
});

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [quiz, setQuiz] = useState<Quiz>({ sentence: "", usedWords: [], answers: [] });
  const [isLoading, setIsLoading] = useState(false);

  const { data: session, status } = useSession();
  const { selectedLanguage } = useLanguage();
  const { showToast } = useToastContext();
  const t = useTranslations("ai-quiz-generator");

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
          selectedLanguage: selectedLanguage.language,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setQuiz(data);
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

// NOTES
// First I will choose the 10 words that are due for review.
// Then I will generate several sentences with Gemini that includes those words.
// this sentences will have a number of questions and each question will have several answers.

// the backend will send this structuure:

// const quiz: Quiz[] = [
//   {
//     sentence: "This is a sentence",
//     usedWords: ["word1", "word2"], // whole Word object
//     questions: [
//       {
//         question: "What is the capital of France?",
//         answers: [ // amswers could be more than 4 or less. and everything will be also connected with the level of the language of the user.
//           { sentence: "The capital of France is Paris.", isCorrect: true },
//           { sentence: "The capital of France is London.", isCorrect: false },
//           { sentence: "The capital of France is Berlin.", isCorrect: false },
//           { sentence: "The capital of France is Madrid.", isCorrect: false },
//         ],
//       },
//       {
//         question: "What is the capital of Germany?",
//         answers: [
//           { sentence: "The capital of Germany is Paris.", isCorrect: false },
//           { sentence: "The capital of Germany is London.", isCorrect: false },
//           { sentence: "The capital of Germany is Berlin.", isCorrect: true },
//           { sentence: "The capital of Germany is Madrid.", isCorrect: false },
//         ],
//       },
//     ],
//   },
// ];
