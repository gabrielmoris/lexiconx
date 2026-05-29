'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import useTextToSpeech from '@/hooks/useTextToSpeech';
import { useToastContext } from '@/context/ToastContext';
import { Language } from '@/types/Words';
import { MemoryHookCardData } from '@/types/MemoryHook';
import SoundIcon from '@/components/Icons/SoundIcon';

interface MemoryHookCardProps {
  card: MemoryHookCardData;
}

const MemoryHookCard: React.FC<MemoryHookCardProps> = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const t = useTranslations('memory-hooks');
  const { showToast } = useToastContext();

  const { speak, isReady, isSupported } = useTextToSpeech({
    onError: error => {
      console.error('Speech error:', error);
      showToast({ message: t('error-speech'), variant: 'error', duration: 3000 });
    },
  });

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
      if (text) {
        speak(text, language);
      }
    },
    [isReady, isSupported, showToast, speak, t]
  );

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    readWord(card.word, card.language);
  };

  return (
    <div
      className="w-full max-w-md h-80 cursor-pointer"
      style={{ perspective: 1000 }}
      onClick={handleFlip}
    >
      <AnimatePresence mode="wait">
        {!isFlipped ? (
          <motion.div
            key="front"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full rounded-xl border-2 text-info bg-gradient-to-br from-theme-text-dark to-theme-bg-light shadow-lg p-6 flex flex-col
 justify-center items-center gap-4"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-info/50 ">
              {t('hook-side')}
            </div>
            <div className="text-3xl font-bold text-info">{card.phoneticKeyword}</div>
            <div className="text-center text-lg text-info leading-relaxed">
              {card.bridgeSentence}
            </div>
            <div className="text-xs text-info/50 mt-auto">{t('tap-to-flip')}</div>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full rounded-xl border-2 border-emerald-400
 dark:border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50
 dark:from-emerald-950 dark:to-teal-950 shadow-lg p-6 flex flex-col
 justify-center items-center gap-3"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600/50 dark:text-theme-text-dark/20">
              {t('word-side')}
            </div>
            <div className="flex items-center gap-3">
              <h3 className="text-3xl font-extrabold text-emerald-800 dark:text-theme-text-dark">
                {card.word}
              </h3>
              <SoundIcon className="w-5 h-5 cursor-pointer" onClick={handleSpeak} />
            </div>
            {card.phoneticNotation && (
              <p className="text-md text-emerald-800/80 dark:text-theme-text-dark">
                {card.phoneticNotation}
              </p>
            )}
            <p className="text-lg text-emerald-800/50 dark:text-theme-text-dark/50 text-center">
              {card.definition}
            </p>
            <div className="flex items-center gap-2 mt-auto">
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600/80 dark:bg-emerald-900 dark:text-theme-text-dark/40">
                EF: {card.easeFactor}
              </span>
              <span className="text-xs text-emerald-600/50 dark:text-theme-text-dark/20">
                {t('tap-to-flip-back')}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemoryHookCard;
