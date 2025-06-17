"use client";
import { Quiz } from "@/types/Quiz";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { useToastContext } from "./ToastContext";
import { useSession } from "next-auth/react";
import { useLanguage } from "./LanguageToLearnContext";
import { useLocale, useTranslations } from "next-intl";

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

// NOTES
// First I will choose the 10 words that are due for review. (DONE)
// Then I will generate several sentences with Gemini that includes those words.
// this sentences will have a number of questions and each question will have several answers.

// the backend will send this structuure:

// const quiz: Quiz[] = [
//   {
//     sentence: "我哥哥打算周末坐火车去上海看朋友，但是票很难买。",
//     phoneticNotation: "wǒ gēge dǎsuàn zhōumiě zuò huǒchē qù shànghǎi kàn péngyǒu, dànshì piào hěn nán mǎi.",
//     translation: "My older brother plans to go to Shanghai by train over the weekend to see his friend, but tickets are hard to come by.",
//     usedWords: [
//       {
//         _id: "684447f1988969382e4ddc01",
//         userId: "68434b23a1aa8189a9c157e2",
//         word: "打算",
//         definition: "to plan; to intend",
//         phoneticNotation: "dǎsuàn",
//         language: "chinese",
//         tags: ["hsk3"],
//         lastReviewed: null,
//         interval: 0,
//         repetitions: 0,
//         easeFactor: 2.5,
//         nextReview: "2025-06-18T10:00:00.000Z",
//         createdAt: "2025-06-18T10:00:00.000Z",
//         updatedAt: "2025-06-18T10:00:00.000Z",
//         __v: 0,
//       },
//       {
//         _id: "68444801988969382e4ddc05",
//         userId: "68434b23a1aa8189a9c157e2",
//         word: "火车",
//         definition: "train",
//         phoneticNotation: "huǒchē",
//         language: "chinese",
//         tags: ["hsk3"],
//         lastReviewed: null,
//         interval: 0,
//         repetitions: 0,
//         easeFactor: 2.5,
//         nextReview: "2025-06-18T10:05:00.000Z",
//         createdAt: "2025-06-18T10:05:00.000Z",
//         updatedAt: "2025-06-18T10:05:00.000Z",
//         __v: 0,
//       },
//     ],
//     questions: [
//       {
//         question: "他哥哥周末要去哪里？",
//         answers: [
//           { sentence: "他哥哥要去上海。", isCorrect: true },
//           { sentence: "他哥哥要去北京。", isCorrect: false },
//           { sentence: "他哥哥要坐飞机。", isCorrect: false },
//           { sentence: "他哥哥要在家看书。", isCorrect: false },
//         ],
//       },
//       {
//         question: "他去上海可能会遇到什么问题？",
//         answers: [
//           { sentence: "他可能没有时间。", isCorrect: false },
//           { sentence: "他可能觉得太累了。", isCorrect: false },
//           { sentence: "火车票可能不容易买到。", isCorrect: true },
//           { sentence: "他的朋友不在上海。", isCorrect: false },
//         ],
//       },
//     ],
//   },
// ];
