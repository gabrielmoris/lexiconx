'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '@/src/i18n/navigation';
import { getDeckWithWords } from '@/lib/apis';
import { useToastContext } from '@/context/ToastContext';
import useTextToSpeech from '@/hooks/useTextToSpeech';
import { Language, Word } from '@/types/Words';
import LoadingComponent from '@/components/Layout/LoadingComponent';
import SoundIcon from '@/components/Icons/SoundIcon';
import ArrowLeft from '@/components/Icons/ArrowLeft';
import ArrowRight from '@/components/Icons/ArrowRight';

const DeckReview: React.FC<{ deckId: string }> = ({ deckId }) => {
  const t = useTranslations('deck-review');
  const router = useRouter();
  const { showToast } = useToastContext();

  const [deckName, setDeckName] = useState('');
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { speak, isReady, isSupported } = useTextToSpeech({
    onError: error => {
      console.error('Speech error:', error);
      showToast({ message: t('error-speech'), variant: 'error', duration: 3000 });
    },
  });

  useEffect(() => {
    const fetchDeck = async () => {
      setIsLoading(true);
      try {
        const { data } = await getDeckWithWords(deckId);
        setDeckName(data.name);
        setWords(data.words || []);
      } catch (error) {
        console.error('Error fetching deck:', error);
        showToast({ message: t('error-fetching'), variant: 'error', duration: 3000 });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeck();
  }, [deckId, showToast, t]);

  const readWord = useCallback(
    (text: string, language: Language) => {
      if (!isSupported) {
        showToast({ message: t('error-speech'), variant: 'error', duration: 3000 });
        return;
      }
      if (!isReady) {
        showToast({ message: t('loading-voices'), variant: 'info', duration: 2000 });
        return;
      }
      if (text) speak(text, language);
    },
    [isReady, isSupported, showToast, speak, t]
  );

  const goNext = () => {
    if (currentIndex < words.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (isLoading) {
    return <LoadingComponent message={t('loading')} />;
  }

  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-lg text-gray-500 dark:text-gray-400">{t('empty-deck')}</p>
        <button
          onClick={() => router.push('/decks')}
          className="text-sm text-secondary hover:underline cursor-pointer"
        >
          {t('back-to-decks')}
        </button>
      </div>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <h2 className="text-xl font-bold text-theme-text-light dark:text-theme-text-dark">
        {deckName}
      </h2>

      <div className="flex items-center justify-between w-full max-w-md">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {t('card-of', { current: currentIndex + 1, total: words.length })}
        </div>

        <button
          onClick={goNext}
          disabled={currentIndex === words.length - 1}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      <div
        className="w-full max-w-md h-72 cursor-pointer"
        style={{ perspective: 1000 }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key={`front-${currentWord._id}`}
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-6 flex flex-col justify-center items-center gap-4"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {t('word-side')}
              </div>
              <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white text-center">
                {currentWord.word}
              </h3>
              {currentWord.phoneticNotation && (
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {currentWord.phoneticNotation}
                </p>
              )}
              <SoundIcon
                className="w-10 h-10 cursor-pointer hover:opacity-50"
                onClick={e => {
                  e.stopPropagation();
                  readWord(currentWord.word, currentWord.language);
                }}
              />
              <div className="text-xs text-gray-400 mt-auto">{t('tap-to-flip')}</div>
            </motion.div>
          ) : (
            <motion.div
              key={`back-${currentWord._id}`}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full rounded-xl border-2 border-emerald-400 dark:border-emerald-500 bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 shadow-lg p-6 flex flex-col justify-center items-center gap-3"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600/50 dark:text-theme-text-dark/20">
                {t('definition-side')}
              </div>
              <p className="text-xl text-emerald-800 dark:text-theme-text-dark text-center leading-relaxed">
                {currentWord.definition}
              </p>
              <div className="text-xs text-emerald-600/50 dark:text-theme-text-dark/20 mt-auto">
                {t('tap-to-flip-back')}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DeckReview;
