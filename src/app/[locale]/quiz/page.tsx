'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useToastContext } from '@/context/ToastContext';
import { useQuiz } from '@/context/QuizContext';
import { useLanguage } from '@/context/LanguageToLearnContext';
import useTextToSpeech from '@/hooks/useTextToSpeech';
import { useQuizManager } from '@/hooks/useQuizManager';
import LoadingComponent from '@/components/Layout/LoadingComponent';
import QuizFinished from '@/components/Quiz/QuizFinished';
import QuizStartCard from '@/components/Quiz/QuizStartCard';
import QuizView from '@/components/Quiz/QuizView';
import type { User, Word, Language } from '@/types/Words';
import { QuizComposition } from '@/types/Quiz';
import { getUserData, getWordsForQuiz } from '@/lib/apis';
import { redirect } from 'next/navigation';

type QuizMode = 'idle' | 'generating' | 'active';

const QuizPage = () => {
  const { data: session, status } = useSession();
  const { showToast } = useToastContext();
  const t = useTranslations('quiz');
  const [userData, setUserData] = useState<User>();
  const { selectedLanguage, isSelectedLanguageLoading } = useLanguage();
  const { generateQuiz } = useQuiz();

  const [mode, setMode] = useState<QuizMode>('idle');
  const [selectedWords, setSelectedWords] = useState<Word[]>([]);
  const [composition, setComposition] = useState<QuizComposition>({
    new: 0,
    learning: 0,
    mastered: 0,
  });
  const [isFetchingWords, setIsFetchingWords] = useState(true);

  const {
    isLoading: isQuizLoading,
    isQuizFinished,
    isFinishing,
    isWaitingForNextQuiz,
    score,
    currentQuizItem,
    currentQuestion,
    feedback,
    showingExplanation,
    quizProgress,
    questionProgress,
    handleAnswerClick,
    handleContinue,
    restartQuiz,
    displayQuiz,
    composition: quizComposition,
    handleDeleteQuiz,
  } = useQuizManager(userData!, { active: mode === 'active' });

  useEffect(() => {
    if (isSelectedLanguageLoading) return;

    const fetchWordPool = async () => {
      if (status !== 'authenticated' || !selectedLanguage.language) return;

      try {
        const { wordsForQuiz, composition: fetchedComposition } = await getWordsForQuiz(
          selectedLanguage.language,
          selectedLanguage.language as Language
        );

        if (wordsForQuiz.length === 0) return;

        setSelectedWords(wordsForQuiz);
        if (fetchedComposition) {
          setComposition(fetchedComposition);
        }
      } catch (error) {
        console.error('Error fetching word pool:', error);
        if (displayQuiz.length === 0 && !isQuizLoading) {
          showToast({
            message: t('error-fetching-words'),
            variant: 'error',
            duration: 3000,
          });

          setTimeout(() => {
            redirect('/cards');
          }, 3500);
        }
      } finally {
        setIsFetchingWords(false);
      }
    };

    fetchWordPool();
  }, [status, selectedLanguage.language, isSelectedLanguageLoading, isQuizLoading]);

  useEffect(() => {
    const fetchUser = async () => {
      if (status === 'authenticated') {
        try {
          const { data } = await getUserData();
          setUserData(data);
        } catch (e) {
          console.error(e);
          showToast({ message: t('error-getting-user'), variant: 'error', duration: 3000 });
          redirect('/');
        }
      } else if (status === 'unauthenticated') {
        redirect('/');
      }
    };
    fetchUser();
  }, [session, status]);

  const handleStartQuiz = useCallback(async () => {
    setMode('generating');
    const result = await generateQuiz(selectedWords);
    if (result?.success) {
      setMode('active');
    } else {
      setMode('idle');
    }
  }, [generateQuiz, selectedWords]);

  useEffect(() => {
    if (mode === 'idle' && selectedWords.length > 0) {
      setComposition({
        new: selectedWords.filter(w => w.repetitions === 0).length,
        learning: selectedWords.filter(w => w.repetitions > 0 && w.interval <= 21).length,
        mastered: selectedWords.filter(w => w.interval > 21).length,
      });
    }
  }, [selectedWords, mode]);

  useEffect(() => {
    if (displayQuiz.length > 0) {
      setMode('active');
    }
  }, [displayQuiz.length]);

  const { speak, isReady, isSupported } = useTextToSpeech({
    onError: error => {
      console.error('Speech error:', error);
      showToast({
        message: t('error-speech'),
        variant: 'error',
        duration: 3000,
      });
    },
  });

  const readQuiz = useCallback(() => {
    if (!isSupported) {
      showToast({
        message: t('error-speech'),
        variant: 'error',
        duration: 3000,
      });
      return;
    }

    if (!isReady) {
      showToast({
        message: t('loading-voices'),
        variant: 'info',
        duration: 2000,
      });
      return;
    }

    if (currentQuizItem?.sentence) {
      speak(currentQuizItem?.sentence, currentQuizItem?.language);
    }
  }, [
    isSupported,
    isReady,
    currentQuizItem?.sentence,
    currentQuizItem?.language,
    showToast,
    t,
    speak,
  ]);

  const handleRestartQuiz = useCallback(() => {
    restartQuiz();
    setMode('idle');
    setIsFetchingWords(true);
    // Re-fetch word pool
    getWordsForQuiz(selectedLanguage.language, selectedLanguage.language as Language)
      .then(({ wordsForQuiz, composition: fetchedComposition }) => {
        setSelectedWords(wordsForQuiz);
        if (fetchedComposition) {
          setComposition(fetchedComposition);
        }
      })
      .catch(error => {
        console.error('Error re-fetching word pool:', error);
      })
      .finally(() => {
        setIsFetchingWords(false);
      });
  }, [restartQuiz, selectedLanguage.language]);

  if (status === 'loading' || !userData) {
    return <LoadingComponent />;
  }

  if (mode === 'idle') {
    if (isFetchingWords) {
      return <LoadingComponent message={t('loading-words')} />;
    }

    return (
      <main className="min-h-[80vh] flex flex-col items-center justify-center md:justify-start py-15 px-4 w-full">
        <QuizStartCard
          selectedWords={selectedWords}
          setSelectedWords={setSelectedWords}
          composition={composition}
          onStartQuiz={handleStartQuiz}
          isGenerating={false}
        />
      </main>
    );
  }
  if (mode === 'generating') {
    return <LoadingComponent message={t('generating')} />;
  }

  if (isQuizLoading) {
    return <LoadingComponent />;
  }

  if (isWaitingForNextQuiz) {
    return <LoadingComponent message={t('preparing-next-quiz')} />;
  }

  if (isFinishing) {
    return <LoadingComponent message={t('finishing-quiz')} />;
  }

  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center md:justify-start py-20 px-4 w-full">
      {isQuizFinished ? (
        <QuizFinished
          isSuccess={score.success / 2 > score.errors}
          successPoints={score}
          onRestartQuiz={handleRestartQuiz}
        />
      ) : (
        <QuizView
          quizItem={currentQuizItem}
          question={currentQuestion}
          onAnswerClick={handleAnswerClick}
          feedback={feedback}
          showingExplanation={showingExplanation}
          onContinue={handleContinue}
          quizProgress={quizProgress}
          questionProgress={questionProgress}
          composition={quizComposition}
          onReadQuiz={readQuiz}
          handleDeleteQuiz={handleDeleteQuiz}
        />
      )}
    </main>
  );
};

export default QuizPage;
