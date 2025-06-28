import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/src/i18n/navigation";
import { useQuiz } from "@/context/QuizContext";
import useLocalStorage from "@/hooks/useLocalStorage";
import { failWords, successWords } from "@/lib/correctionWords";
import { calculateNextReviewData } from "@/lib/mongodb/models/calculateNextReview";
import { saveWordsData } from "@/lib/apis";
import { Quiz, QuizAnswer } from "@/types/Quiz";
import { User, Word } from "@/types/Words";

export const useQuizManager = (userData: User) => {
  const { clientQuizzes: contextQuiz, isLoading: isGeneratingQuiz } = useQuiz();
  const { storedValue: storedQuizzesData, isHydrated: isLocalStorageHydrated } = useLocalStorage("quizes", { quizzes: [] });
  const { data: session } = useSession();
  const router = useRouter();

  const [displayQuiz, setDisplayQuiz] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quizStep, setQuizStep] = useState(0);
  const [questionStep, setQuestionStep] = useState(0);
  const [feedback, setFeedback] = useState({ correct: "", wrong: "" });
  const [usedWords, setUsedWords] = useState<Word[]>([]);
  const [score, setScore] = useState({ errors: 0, success: 0 });
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  // Effect to load the quiz from context or localStorage
  useEffect(() => {
    if (!isLocalStorageHydrated) return;

    const quizSource = contextQuiz?.length > 0 ? contextQuiz : storedQuizzesData.quizzes;
    if (quizSource?.length > 0) {
      setDisplayQuiz(quizSource);
      setIsLoading(false);
    } else {
      router.push("/cards");
    }
  }, [contextQuiz, storedQuizzesData.quizzes, isLocalStorageHydrated, router]);

  // Effect to handle the end of the quiz
  useEffect(() => {
    if (!session) return;
    const finishQuiz = async () => {
      if (displayQuiz.length && quizStep >= displayQuiz.length && userData) {
        try {
          const { data: wordsData } = await saveWordsData(session, usedWords);
          calculateNextReviewData(wordsData, userData);
          setIsQuizFinished(true);
        } catch (error) {
          console.error("Error finishing quiz:", error);
          // Optionally show a toast message to the user
        }
      }
    };
    finishQuiz();
  }, [quizStep, displayQuiz, userData, session, usedWords]);

  const handleAnswerClick = useCallback(
    async (option: QuizAnswer) => {
      if (!session) return;
      const currentQuiz = displayQuiz[quizStep];
      if (!currentQuiz) return;

      let newWordsToAdd: Word[] = [];
      try {
        if (option.isCorrect) {
          setScore((prev) => ({ ...prev, success: prev.success + 1 }));
          setFeedback({ correct: option.answer, wrong: "" });
          newWordsToAdd = await successWords(session, currentQuiz.usedWords);
        } else {
          setScore((prev) => ({ ...prev, errors: prev.errors + 1 }));
          setFeedback({ correct: "", wrong: option.answer });
          newWordsToAdd = await failWords(session, currentQuiz.usedWords);
        }
      } catch (error) {
        console.error("Error processing words:", error);
        // Show toast to user
      }

      // Efficiently merge new words, preventing duplicates
      setUsedWords((prev) => {
        const wordMap = new Map(prev.map((w) => [`${w.word}|${w.definition}`, w]));
        newWordsToAdd.forEach((w) => wordMap.set(`${w.word}|${w.definition}`, w));
        return Array.from(wordMap.values());
      });

      // Advance to the next question/step
      setTimeout(() => {
        setFeedback({ correct: "", wrong: "" });
        if (questionStep < currentQuiz.questions.length - 1) {
          setQuestionStep((prev) => prev + 1);
        } else {
          setQuizStep((prev) => prev + 1);
          setQuestionStep(0);
        }
      }, 500);
    },
    [displayQuiz, quizStep, questionStep, session]
  );

  const restartQuiz = () => {
    setQuizStep(0);
    setQuestionStep(0);
    setIsQuizFinished(false);
    setScore({ errors: 0, success: 0 });
    setUsedWords([]);
  };

  const currentQuizItem = displayQuiz[quizStep];
  const currentQuestion = currentQuizItem?.questions[questionStep];

  return {
    isLoading: isLoading || isGeneratingQuiz,
    isQuizFinished,
    score,
    currentQuizItem,
    currentQuestion,
    feedback,
    quizProgress: { current: quizStep + 1, total: displayQuiz.length },
    questionProgress: { current: questionStep + 1, total: currentQuizItem?.questions.length || 0 },
    handleAnswerClick,
    restartQuiz,
  };
};
