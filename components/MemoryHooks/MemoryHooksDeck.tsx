'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageToLearnContext';
import { useToastContext } from '@/context/ToastContext';
import { MemoryHookCardData } from '@/types/MemoryHook';
import { getMemoryHooks, generateMemoryHooksApi } from '@/lib/apis';
import MemoryHookCard from './MemoryHookCard';
import LoadingComponent from '@/components/Layout/LoadingComponent';
import { localeToLanguage } from '@/lib/helpers';
import { Locale } from '@/types/Words';
import ArrowLeft from '../Icons/ArrowLeft';
import ArrowRight from '../Icons/ArrowRight';

const MemoryHooksDeck: React.FC<{ userLocale: Locale }> = ({ userLocale }) => {
  const [cards, setCards] = useState<MemoryHookCardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const t = useTranslations('memory-hooks');
  const { selectedLanguage, isSelectedLanguageLoading } = useLanguage();
  const { showToast } = useToastContext();

  const userLanguage = localeToLanguage(userLocale);
  const learningLanguage = selectedLanguage.language;

  const fetchCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await getMemoryHooks(learningLanguage);
      setCards(data || []);

      // Find cards without hooks and generate them
      const cardsNeedingHooks = (data || []).filter(
        (c: MemoryHookCardData) => !c.phoneticKeyword || !c.bridgeSentence
      );

      if (cardsNeedingHooks.length > 0) {
        setIsGenerating(true);
        try {
          const wordIds = cardsNeedingHooks.map((c: MemoryHookCardData) => c.wordId);
          await generateMemoryHooksApi(wordIds, learningLanguage, userLanguage);

          // Re-fetch to get updated cards with hooks
          const { data: updatedCards } = await getMemoryHooks(learningLanguage);
          setCards(updatedCards || []);
        } catch (error) {
          console.error('Error generating hooks:', error);
          showToast({
            message: t('error-generating'),
            variant: 'error',
            duration: 3000,
          });
        }
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('Error fetching memory hooks:', error);
      showToast({
        message: t('error-fetching'),
        variant: 'error',
        duration: 3000,
      });
    }
    setIsLoading(false);
  }, [learningLanguage, userLanguage, showToast, t]);

  useEffect(() => {
    if (isSelectedLanguageLoading) return;
    fetchCards();
  }, [fetchCards, isSelectedLanguageLoading]);

  const goNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (isLoading) {
    return <LoadingComponent message={t('loading')} />;
  }

  if (isGenerating) {
    return <LoadingComponent message={t('generating')} />;
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-lg text-gray-500 dark:text-gray-400">{t('no-weak-words')}</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="flex items-center justify-between w-full max-w-md">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors  cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {t('card-of', { current: currentIndex + 1, total: cards.length })}
        </div>

        <button
          onClick={goNext}
          disabled={currentIndex === cards.length - 1}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard.wordId}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="w-full flex justify-center"
        >
          <MemoryHookCard card={currentCard} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MemoryHooksDeck;
