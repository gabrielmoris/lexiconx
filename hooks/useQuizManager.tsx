import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from '@/src/i18n/navigation';
import { useQuiz } from '@/context/QuizContext';
import useLocalStorage from '@/hooks/useLocalStorage';
import { processAnswer } from '@/lib/correctionWords';
import { getWordsByIds, updateWordsData, updateUserData } from '@/lib/apis';
import { saveQuizSession } from '@/lib/apis';
import { buildRequizQuestions, RequizOption } from '@/lib/requiz';
import { Quiz, QuizAnswer } from '@/types/Quiz';
import { User, Word } from '@/types/Words';

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
  const [requizQuestions, setRequizQuestions] = useState<ReturnType<typeof buildRequizQuestions>>(
    []
  );
  const [requizStep, setRequizStep] = useState(0);
  const [requizScore, setRequizScore] = useState({ correct: 0, wrong: 0 });
  const [isRequizPhase, setIsRequizPhase] = useState(false);
  const [requizFeedback, setRequizFeedback] = useState<{ correct: string; wrong: string }>({
    correct: '',
    wrong: '',
  });

  const originalEaseFactors = useRef<Map<string, number>>(new Map());
  const quizStartTime = useRef(Date.now());
  const isFinishingRef = useRef(false);

  // True when user has finished all currently available quizzes but more are still being generated
  const isWaitingForNextQuiz =
    !isAllQuizzesReady &&
    totalExpectedQuizzes > 0 &&
    quizStep >= displayQuiz.length &&
    displayQuiz.length > 0;

  // True when main quiz is complete (all quizzes answered)
  const isMainQuizComplete =
    displayQuiz.length > 0 && quizStep >= displayQuiz.length && isAllQuizzesReady && !isRequizPhase;

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

  // Build requiz questions when main quiz completes with missed words
  useEffect(() => {
    if (isQuizFinished || isRequizPhase) return;
    if (!isMainQuizComplete) return;
    if (missedWordIds.length === 0) return;
    if (usedWords.length === 0) return;

    const questions = buildRequizQuestions(missedWordIds, usedWords);
    if (questions.length > 0) {
      setRequizQuestions(questions);
      setRequizStep(0);
      setRequizScore({ correct: 0, wrong: 0 });
      setRequizFeedback({ correct: '', wrong: '' });
      setIsRequizPhase(true);
    }
  }, [isMainQuizComplete, missedWordIds, usedWords, isQuizFinished, isRequizPhase]);

  // Effect to handle the end of the quiz (after requiz if applicable)
  // Quiz only truly finishes when ALL quizzes are ready AND the user has answered all of them
  useEffect(() => {
    if (isQuizFinished || !session) return;
    if (isFinishingRef.current) return;

    // Only finish when main quiz is complete AND (requiz is done OR no missed words)
    const requizDone = isRequizPhase ? requizStep >= requizQuestions.length : true;
    const mainDone = displayQuiz.length && quizStep >= displayQuiz.length && isAllQuizzesReady;
    if (!mainDone || !requizDone || !userData) return;

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
    requizStep,
    requizQuestions.length,
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

        // Track missed word IDs for requiz
        setMissedWordIds(prev => {
          const newIds = currentQuestion.usedWords.filter(id => !prev.includes(id));
          return [...prev, ...newIds];
        });
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

  // Requiz answer handler
  const handleRequizAnswerClick = useCallback(
    (option: RequizOption) => {
      if (requizStep >= requizQuestions.length) return;

      const currentRequiz = requizQuestions[requizStep];

      if (option.isCorrect) {
        setRequizScore(prev => ({ ...prev, correct: prev.correct + 1 }));
        setRequizFeedback({ correct: option.word, wrong: '' });
      } else {
        setRequizScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
        setRequizFeedback({ correct: '', wrong: option.word });
      }

      // Update SRS for the requiz word
      setUsedWords(prev => {
        const wordMap = new Map(prev.map(w => [w._id!, w]));
        for (const wordId of currentRequiz.usedWords) {
          const word = wordMap.get(wordId);
          if (!word) continue;
          const originalEase = originalEaseFactors.current.get(wordId);
          const updatedWord = processAnswer(word, option.isCorrect, originalEase);
          wordMap.set(wordId, updatedWord);
        }
        return Array.from(wordMap.values());
      });
    },
    [requizStep, requizQuestions]
  );

  // Requiz continue handler
  const handleRequizContinue = useCallback(() => {
    setRequizFeedback({ correct: '', wrong: '' });
    setRequizStep(prev => prev + 1);
  }, []);

  const restartQuiz = () => {
    setQuizStep(0);
    setQuestionStep(0);
    setIsQuizFinished(false);
    setIsFinishing(false);
    isFinishingRef.current = false;
    setScore({ errors: 0, success: 0 });
    setMissedWordIds([]);
    setRequizQuestions([]);
    setRequizStep(0);
    setRequizScore({ correct: 0, wrong: 0 });
    setIsRequizPhase(false);
    setRequizFeedback({ correct: '', wrong: '' });

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
    requizProgress: { current: requizStep + 1, total: requizQuestions.length },
    handleRequizAnswerClick,
    handleRequizContinue,
    missedWordIds,
  };
};
