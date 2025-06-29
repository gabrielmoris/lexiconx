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
  const { storedValue: storedQuizzesData, isHydrated: isLocalStorageHydrated, deleteValue } = useLocalStorage("quizes", { quizzes: [] });
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
  const [startingTimer, setStartingTimer] = useState<number>();

  useEffect(() => {
    const start = Date.now();
    setStartingTimer(start);
  }, []);

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
        const actualTimeEnd = Date.now();
        try {
          const { data: wordsData } = await saveWordsData(session, usedWords);
          const updatedWords = calculateNextReviewData(wordsData, userData);
          setIsQuizFinished(true);
          // TODO:
          // 1. Update the user's learning progress based on the quiz results
          // 2. Update the user's words based on the quiz results
          // 3. Update the user's level, words mastered, current streak,last session, time spent...
          // 4. Save the user's data to the database
          // 5. save the updated words in the database
          // 6. Delete the quiz from localStorage

          // Here I must write and save all the logic tha tI will have to send to the Mongodb
          console.log("wordsData", wordsData);
          console.log("updatedWords", updatedWords);
          console.log("userData", userData);
          console.log("successPoints => ", score);
          // do logic here
          const learningProgress = userData?.learningProgress.find((lp) => lp.language === displayQuiz[0].language);
          if (!learningProgress) throw new Error("Learning progress not found");
          learningProgress.level =
            score.success / 2 > score.errors ? learningProgress.level + 1 : learningProgress.level > 0 ? learningProgress.level - 1 : 0;
          learningProgress.wordsMastered += updatedWords.filter((word) => word.repetitions > 0).length;
          learningProgress.currentStreak = score.success > 0 ? learningProgress.currentStreak + 1 : 0;
          learningProgress.lastSessionDate = new Date();
          if (!startingTimer) throw new Error("Starting timer not found");
          learningProgress.timeSpent += Math.round(actualTimeEnd - startingTimer); // Saved in miliseconds
          console.log(learningProgress); // Integrate it to the user and send to an API
          // deleteValue(); // at the end
        } catch (error) {
          console.error("Error finishing quiz:", error);
          // Optionally show a toast message to the user
        }
      }
    };
    finishQuiz();
  }, [quizStep, displayQuiz, userData, session, usedWords, score]);

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
