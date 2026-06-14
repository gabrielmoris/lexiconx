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

type SessionPhase = 'loading' | 'answering' | 'waiting-next' | 'finishing' | 'done';

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
    markAllReady,
  } = useQuiz();

  const {
    storedValue: storedQuizzesData,
    isHydrated: isLocalStorageHydrated,
    deleteValue,
  } = useLocalStorage('quizes', { quizzes: [] });

  const { data: session } = useSession();
  const router = useRouter();

  const [phase, setPhase] = useState<SessionPhase>('loading');
  const [displayQuiz, setDisplayQuiz] = useState<Quiz[]>([]);
  const [quizStep, setQuizStep] = useState(0);
  const [questionStep, setQuestionStep] = useState(0);
  const [feedback, setFeedback] = useState({ correct: '', wrong: '' });
  const [usedWords, setUsedWords] = useState<Word[]>([]);
  const [score, setScore] = useState({ errors: 0, success: 0 });
  const [showingExplanation, setShowingExplanation] = useState(false);
  const [startingTimer, setStartingTimer] = useState<number>();

  const originalEaseFactors = useRef<Map<string, number>>(new Map());
  const quizStartTime = useRef(Date.now());
  const isFinishingRef = useRef(false);
  const shuffledIndexes = useRef<Set<number>>(new Set());
  const phaseRef = useRef<SessionPhase>('loading');
  phaseRef.current = phase;

  useEffect(() => {
    const start = Date.now();
    setStartingTimer(start);
    quizStartTime.current = start;
  }, []);

  useEffect(() => {
    if (phaseRef.current === 'finishing' || phaseRef.current === 'done') return;
    if (!isLocalStorageHydrated) return;

    const isFromLocalStorage = contextQuiz.length === 0;
    const quizSource = isFromLocalStorage ? storedQuizzesData.quizzes : contextQuiz;

    if (quizSource.length === 0) {
      if (!isGeneratingQuiz && !isGeneratingMore && options?.active !== false) {
        router.push('/cards');
      }
      return;
    }

    // Track which indexes are newly shuffled in this specific effect run.
    const newIndexes = new Set<number>();
    const shuffled = quizSource.map((quiz, i) => {
      if (shuffledIndexes.current.has(i)) return quiz;
      shuffledIndexes.current.add(i);
      newIndexes.add(i);
      const shuffledQuestions = shuffleArray(quiz.questions).map(q => ({
        ...q,
        options: shuffleArray(q.options),
      }));
      return { ...quiz, questions: shuffledQuestions };
    });

    // No new quizzes arrived — nothing to update. Bail out to avoid creating a
    // new array reference on every render and triggering an infinite re-render loop.
    if (newIndexes.size === 0) return;

    setDisplayQuiz(shuffled);

    if (isFromLocalStorage && !isGeneratingQuiz && !isGeneratingMore) {
      markAllReady();
    }

    if (phaseRef.current === 'loading') {
      setPhase('answering');
    }

    // Only fetch words for the newly arrived quizzes to avoid redundant API calls.
    const allWordIds = [
      ...new Set(
        shuffled
          .filter((_, i) => newIndexes.has(i))
          .flatMap(q => q.questions.flatMap(q => q.usedWords))
      ),
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
              if (!existingMap.has(word._id!)) existingMap.set(word._id!, word);
            });
            return Array.from(existingMap.values());
          });
        })
        .catch(error => {
          console.error('Error prefetching quiz words:', error);
        });
    }
  }, [
    contextQuiz,
    storedQuizzesData.quizzes,
    isLocalStorageHydrated,
    isGeneratingQuiz,
    isGeneratingMore,
    markAllReady,
    router,
  ]);

  // Drives the answering ↔ waiting-next phase transition as the user advances through quizzes and new ones arrive from background generation.
  useEffect(() => {
    if (phase === 'finishing' || phase === 'done' || phase === 'loading') return;
    if (quizStep < displayQuiz.length) {
      if (phase === 'waiting-next') setPhase('answering');
    } else if (displayQuiz.length > 0 && !isAllQuizzesReady) {
      setPhase('waiting-next');
    }
  }, [quizStep, displayQuiz.length, isAllQuizzesReady, phase]);

  // Triggers the finish sequence once all quizzes are generated AND answered.
  useEffect(() => {
    if (phase === 'finishing' || phase === 'done') return;
    if (!session || !userData) return;
    if (isFinishingRef.current) return;
    if (!isAllQuizzesReady || displayQuiz.length === 0) return;

    const expectedTotal = totalExpectedQuizzes > 0 ? totalExpectedQuizzes : displayQuiz.length;
    if (quizStep < expectedTotal) return;

    isFinishingRef.current = true;
    setPhase('finishing');

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
        if (isSucceed) handleDeleteQuiz();
        setPhase('done');
      })
      .catch(error => {
        console.error('Error finishing quiz:', error);
        setPhase('done');
      })
      .finally(() => {
        isFinishingRef.current = false;
      });
  }, [
    phase,
    quizStep,
    displayQuiz,
    totalExpectedQuizzes,
    isAllQuizzesReady,
    userData,
    session,
    usedWords,
    score,
    startingTimer,
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

  const handleDeleteQuiz = () => {
    deleteValue();
    setDisplayQuiz([]);
    setClientQuizzes([]);
  };

  const restartQuiz = () => {
    shuffledIndexes.current = new Set();
    isFinishingRef.current = false;
    setQuizStep(0);
    setQuestionStep(0);
    setScore({ errors: 0, success: 0 });
    setPhase('answering');

    const reshuffled = displayQuiz.map((quiz, i) => {
      shuffledIndexes.current.add(i);
      const shuffledQuestions = shuffleArray(quiz.questions).map(q => ({
        ...q,
        options: shuffleArray(q.options),
      }));
      return { ...quiz, questions: shuffledQuestions };
    });
    setDisplayQuiz(reshuffled);

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

  const currentQuizItem = displayQuiz[quizStep];
  const currentQuestion = currentQuizItem?.questions[questionStep];

  return {
    isLoading: phase === 'loading' || isGeneratingQuiz,
    isQuizFinished: phase === 'done',
    displayQuiz,
    isFinishing: phase === 'finishing',
    isWaitingForNextQuiz: phase === 'waiting-next',
    score,
    currentQuizItem,
    currentQuestion,
    feedback,
    showingExplanation,
    quizProgress: { current: quizStep + 1, total: totalExpectedQuizzes || displayQuiz.length },
    composition,
    questionProgress: { current: questionStep + 1, total: currentQuizItem?.questions.length || 0 },
    handleAnswerClick,
    handleContinue,
    restartQuiz,
    handleDeleteQuiz,
  };
};
