import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from '@/src/i18n/navigation';
import { useQuiz } from '@/context/QuizContext';
import useLocalStorage from '@/hooks/useLocalStorage';
import { processAnswer } from '@/lib/correctionWords';
import { getWordsByIds, updateWordsData, updateUserData } from '@/lib/apis';
import { saveQuizSession } from '@/lib/apis';
import { Quiz, QuizAnswer } from '@/types/Quiz';
import { User, Word } from '@/types/Words';
import { shuffleArray } from '@/lib/helpers';
import { buildRequizQuestions, RequizOption, RequizQuestion } from '@/lib/requiz';

interface UseQuizManagerOptions {
  active?: boolean;
}

export const useQuizManager = (userData: User, options?: UseQuizManagerOptions) => {
  const {
    clientQuizzes: contextQuiz,
    setClientQuizzes,
    isLoading: isGeneratingQuiz,
    isGeneratingMore,
    isAllQuizzesReady,
    totalExpectedQuizzes,
    composition,
  } = useQuiz();
  const {
    storedValue: storedQuizzesData,
    isHydrated: isLocalStorageHydrated,
    deleteValue,
  } = useLocalStorage('quizes', { quizzes: [] });
  const { data: session } = useSession();
  const router = useRouter();

  const [displayQuiz, setDisplayQuiz] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [questionStep, setQuestionStep] = useState(0);
  const [feedback, setFeedback] = useState({ correct: '', wrong: '' });
  const [usedWords, setUsedWords] = useState<Word[]>([]);
  const [score, setScore] = useState({ errors: 0, success: 0 });
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [showingExplanation, setShowingExplanation] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [startingTimer, setStartingTimer] = useState<number>();

  // Requiz state
  const [missedWordIds, setMissedWordIds] = useState<string[]>([]);
  const [isRequizPhase, setIsRequizPhase] = useState(false);
  const [requizQuestions, setRequizQuestions] = useState<RequizQuestion[]>([]);
  const [requizStep, setRequizStep] = useState(0);
  const [requizScore, setRequizScore] = useState({ correct: 0, total: 0 });
  const [requizFeedback, setRequizFeedback] = useState<'correct' | 'wrong' | null>(null);

  const originalEaseFactors = useRef<Map<string, number>>(new Map());
  const quizStartTime = useRef(Date.now());
  const isFinishingRef = useRef(false);

  // True when user has finished all currently available quizzes but more are still being generated
  const isWaitingForNextQuiz =
    totalExpectedQuizzes > 0 && quizStep >= displayQuiz.length && displayQuiz.length > 0;

  useEffect(() => {
    const start = Date.now();
    setStartingTimer(start);
    quizStartTime.current = start;
  }, []);

  // Load quiz data and prefetch words used in the quiz
  // When new quizzes arrive progressively, we MERGE new words into usedWords
  // instead of replacing, to preserve in-memory SRS updates from answered questions.
  useEffect(() => {
    if (isQuizFinished) return;
    if (!isLocalStorageHydrated) return;

    const quizSource = contextQuiz?.length > 0 ? contextQuiz : storedQuizzesData.quizzes;

    quizSource.map(quiz =>
      quiz.questions.map(question => (question.options = shuffleArray(question.options)))
    );

    quizSource.map(quiz => (quiz.questions = shuffleArray(quiz.questions)));

    if (quizSource?.length > 0) {
      setDisplayQuiz(quizSource);
      setIsLoading(false);

      const allWordIds = [
        ...new Set(quizSource.flatMap(q => q.questions.flatMap(question => question.usedWords))),
      ];
      if (allWordIds.length > 0) {
        getWordsByIds(allWordIds)
          .then(({ data }) => {
            data.forEach((word: Word) => {
              if (!originalEaseFactors.current.has(word._id!)) {
                originalEaseFactors.current.set(word._id!, word.easeFactor || 2.5);
              }
            });

            setUsedWords(prev => {
              const existingMap = new Map(prev.map(w => [w._id!, w]));
              data.forEach((word: Word) => {
                if (!existingMap.has(word._id!)) {
                  existingMap.set(word._id!, word);
                }
              });
              return Array.from(existingMap.values());
            });
          })
          .catch(error => {
            console.error('Error prefetching quiz words:', error);
          })
          .finally(() => setIsLoading(false));
      }
    } else if (!isGeneratingQuiz && !isGeneratingMore && options?.active !== false) {
      router.push('/cards');
    }
  }, [
    contextQuiz,
    storedQuizzesData.quizzes,
    isLocalStorageHydrated,
    router,
    isGeneratingQuiz,
    isGeneratingMore,
  ]);

  // Effect to handle the end of the quiz
  // Quiz finishes after the main quiz AND any requiz phase is complete
  useEffect(() => {
    if (isQuizFinished || !session) return;
    if (isFinishingRef.current) return;
    // Don't finish while requiz is active
    if (isRequizPhase) return;
    // Only finish when user has answered all main quiz questions
    // AND either requiz is done or there were no errors
    const mainQuizDone = displayQuiz.length && quizStep >= displayQuiz.length && userData;
    const requizDone = !isRequizPhase;
    if (mainQuizDone && requizDone) {
      // If there are missed words and requiz hasn't started yet, start it
      if (missedWordIds.length > 0 && requizQuestions.length === 0) {
        const questions = buildRequizQuestions(missedWordIds, usedWords);
        if (questions.length > 0) {
          setRequizQuestions(questions);
          setIsRequizPhase(true);
          setRequizStep(0);
          setRequizScore({ correct: 0, total: 0 });
          setRequizFeedback(null);
          return; // Don't finish yet — requiz will run
        }
      }

      isFinishingRef.current = true;
      setIsFinishing(true);

      const actualTimeEnd = Date.now();
      const updatedUserData: User = JSON.parse(JSON.stringify(userData));
      const isSucceed = score.success / 2 > score.errors;
      const learningProgress = updatedUserData?.learningProgress.find(
        lp => lp.language === displayQuiz[0].language
      );

      updateWordsData(usedWords)
        .then(() => {
          if (!learningProgress) throw new Error('Learning progress not found');
          learningProgress.level = isSucceed
            ? learningProgress.level + 1
            : learningProgress.level > 0
              ? learningProgress.level - 1
              : 0;
          learningProgress.wordsMastered += usedWords.filter(word => word.repetitions > 0).length;
          learningProgress.currentStreak = isSucceed ? learningProgress.currentStreak + 1 : 0;
          learningProgress.lastSessionDate = new Date();
          if (!startingTimer) throw new Error('Starting timer not found');
          learningProgress.timeSpent += Math.round(actualTimeEnd - startingTimer);

          const wordsMasteredCount = usedWords.filter(word => word.repetitions > 0).length;
          saveQuizSession({
            language: displayQuiz[0].language,
            totalQuestions: score.success + score.errors,
            correctAnswers: score.success,
            wordsMastered: wordsMasteredCount,
            duration: actualTimeEnd - quizStartTime.current,
          }).catch(err => console.error('Error saving quiz session:', err));

          return updateUserData(updatedUserData);
        })
        .then(() => {
          setIsQuizFinished(true);
          if (isSucceed) {
            handleDeleteQuiz();
          }
        })
        .catch(error => {
          console.error('Error finishing quiz:', error);
          setIsQuizFinished(true);
        })
        .finally(() => {
          isFinishingRef.current = false;
          setIsFinishing(false);
        });
    }
  }, [
    quizStep,
    displayQuiz,
    userData,
    session,
    usedWords,
    score,
    startingTimer,
    deleteValue,
    isQuizFinished,
    isAllQuizzesReady,
    isRequizPhase,
    missedWordIds,
    requizQuestions,
  ]);

  const handleAnswerClick = useCallback(
    (option: QuizAnswer) => {
      if (!session) return;
      const currentQuiz = displayQuiz[quizStep];
      if (!currentQuiz) return;
      const currentQuestion = currentQuiz.questions[questionStep];
      if (!currentQuestion) return;

      if (option.isCorrect) {
        setScore(prev => ({ ...prev, success: prev.success + 1 }));
        setFeedback({ correct: option.answer, wrong: '' });
      } else {
        setScore(prev => ({ ...prev, errors: prev.errors + 1 }));
        setFeedback({ correct: '', wrong: option.answer });
        // Track missed words for requiz
        for (const wordId of currentQuestion.usedWords) {
          setMissedWordIds(prev => (prev.includes(wordId) ? prev : [...prev, wordId]));
        }
      }

      setUsedWords(prev => {
        const wordMap = new Map(prev.map(w => [w._id!, w]));

        for (const wordId of currentQuestion.usedWords) {
          const word = wordMap.get(wordId);
          if (!word) continue;

          const originalEase = originalEaseFactors.current.get(wordId);
          const updatedWord = processAnswer(word, option.isCorrect, originalEase);
          wordMap.set(wordId, updatedWord);
        }

        return Array.from(wordMap.values());
      });

      // Check if the question has an explanation to show
      const hasExplanation =
        (option.isCorrect && currentQuestion.elaboration) ||
        (!option.isCorrect && currentQuestion.errorExplanation);

      if (hasExplanation) {
        setShowingExplanation(true);
      } else {
        setTimeout(() => {
          setFeedback({ correct: '', wrong: '' });
          if (questionStep < currentQuiz.questions.length - 1) {
            setQuestionStep(prev => prev + 1);
          } else {
            setQuizStep(prev => prev + 1);
            setQuestionStep(0);
          }
        }, 500);
      }
    },
    [displayQuiz, quizStep, questionStep, session]
  );

  const handleContinue = useCallback(() => {
    const currentQuiz = displayQuiz[quizStep];
    if (!currentQuiz) return;

    setShowingExplanation(false);
    setFeedback({ correct: '', wrong: '' });

    if (questionStep < currentQuiz.questions.length - 1) {
      setQuestionStep(prev => prev + 1);
    } else {
      setQuizStep(prev => prev + 1);
      setQuestionStep(0);
    }
  }, [displayQuiz, quizStep, questionStep]);

  const handleRequizAnswerClick = useCallback(
    (option: RequizOption) => {
      const currentRequizQ = requizQuestions[requizStep];
      if (!currentRequizQ) return;

      if (option.isCorrect) {
        setRequizScore(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));
        setRequizFeedback('correct');
      } else {
        setRequizScore(prev => ({ ...prev, total: prev.total + 1 }));
        setRequizFeedback('wrong');
      }

      // Update SRS for the requiz word
      setUsedWords(prev => {
        const wordMap = new Map(prev.map(w => [w._id!, w]));
        for (const wordId of currentRequizQ.usedWords) {
          const word = wordMap.get(wordId);
          if (!word) continue;
          const originalEase = originalEaseFactors.current.get(wordId);
          const updatedWord = processAnswer(word, option.isCorrect, originalEase);
          wordMap.set(wordId, updatedWord);
        }
        return Array.from(wordMap.values());
      });
    },
    [requizQuestions, requizStep]
  );

  const handleRequizContinue = useCallback(() => {
    setRequizFeedback(null);

    if (requizStep < requizQuestions.length - 1) {
      setRequizStep(prev => prev + 1);
    } else {
      // Requiz complete — clear state so the finish effect fires
      setIsRequizPhase(false);
      setMissedWordIds([]);
      setRequizQuestions([]);
      setRequizStep(0);
    }
  }, [requizStep, requizQuestions.length]);

  const restartQuiz = () => {
    setQuizStep(0);
    setQuestionStep(0);
    setIsQuizFinished(false);
    setIsFinishing(false);
    isFinishingRef.current = false;
    setScore({ errors: 0, success: 0 });
    // Reset requiz state
    setMissedWordIds([]);
    setIsRequizPhase(false);
    setRequizQuestions([]);
    setRequizStep(0);
    setRequizScore({ correct: 0, total: 0 });
    setRequizFeedback(null);

    const allWordIds = [
      ...new Set(displayQuiz.flatMap(q => q.questions.flatMap(question => question.usedWords))),
    ];
    if (allWordIds.length > 0) {
      getWordsByIds(allWordIds)
        .then(({ data }) => {
          const easeMap = new Map<string, number>();
          data.forEach((word: Word) => {
            easeMap.set(word._id!, word.easeFactor || 2.5);
          });
          originalEaseFactors.current = easeMap;
          setUsedWords(data);
        })
        .catch(error => {
          console.error('Error re-fetching quiz words:', error);
        });
    }
  };

  const handleDeleteQuiz = () => {
    deleteValue();
    setDisplayQuiz([]);
    setClientQuizzes([]);
  };

  const currentQuizItem = displayQuiz[quizStep];
  const currentQuestion = currentQuizItem?.questions[questionStep];
  const currentRequizQuestion = isRequizPhase ? requizQuestions[requizStep] : null;

  return {
    isLoading: isLoading || isGeneratingQuiz,
    isQuizFinished,
    displayQuiz,
    isFinishing,
    isWaitingForNextQuiz,
    score,
    currentQuizItem,
    currentQuestion,
    feedback,
    showingExplanation,
    quizProgress: { current: quizStep + 1, total: displayQuiz.length },
    composition,
    questionProgress: { current: questionStep + 1, total: currentQuizItem?.questions.length || 0 },
    handleAnswerClick,
    handleContinue,
    restartQuiz,
    handleDeleteQuiz,
    // Requiz
    isRequizPhase,
    requizQuestions,
    currentRequizQuestion,
    requizStep,
    requizScore,
    requizFeedback,
    handleRequizAnswerClick,
    handleRequizContinue,
  };
};
