'use client';

import { useState, useMemo, useCallback } from 'react';
import { Word } from '@/types/Words';
import { QuizComposition } from '@/types/Quiz';
import { useTranslations } from 'next-intl';
import { useWords } from '@/context/WordsContext';
import { useLanguage } from '@/context/LanguageToLearnContext';
import WordChip from './WordChip';
import Button from '../UI/Button';
import QuestionAiIcon from '../Icons/QuestionAiIcon';

interface QuizStartCardProps {
  selectedWords: Word[];
  setSelectedWords: (words: Word[]) => void;
  composition: QuizComposition;
  onStartQuiz: () => void;
  isGenerating: boolean;
}

const QuizStartCard = ({
  selectedWords,
  setSelectedWords,
  composition,
  onStartQuiz,
  isGenerating,
}: QuizStartCardProps) => {
  const t = useTranslations('quiz-start');
  const { words: allWords } = useWords();
  const { selectedLanguage } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAllWords, setShowAllWords] = useState(false);

  const selectedIds = useMemo(
    () => new Set(selectedWords.map(w => w._id).filter(Boolean)),
    [selectedWords]
  );

  const handleRemoveWord = useCallback(
    (wordId: string) => {
      setSelectedWords(selectedWords.filter(w => w._id !== wordId));
    },
    [selectedWords, setSelectedWords]
  );

  const handleAddWord = useCallback(
    (word: Word) => {
      if (word._id && !selectedIds.has(word._id)) {
        setSelectedWords([...selectedWords, word]);
      }
      setSearchQuery('');
    },
    [selectedWords, selectedIds, setSelectedWords]
  );

  // Filter available words for the search dropdown
  const availableWords = useMemo(() => {
    const languageWords = allWords.filter(w => w.language === selectedLanguage.language);
    const unselected = languageWords.filter(w => !selectedIds.has(w._id!));

    if (showAllWords) {
      return unselected;
    }

    // Show only overdue words (due for review or new)
    const now = new Date();
    return unselected.filter(w => {
      if (w.repetitions === 0) return true; // new words
      return new Date(w.nextReview) <= now; // overdue words
    });
  }, [allWords, selectedLanguage.language, selectedIds, showAllWords]);

  // Search results filtered by query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return availableWords
      .filter(
        w =>
          w.word.toLowerCase().includes(q) ||
          w.definition.toLowerCase().includes(q) ||
          (w.phoneticNotation && w.phoneticNotation.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [searchQuery, availableWords]);

  const canStartQuiz = selectedWords.length >= 3;
  const isOverMax = selectedWords.length > 10;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-5">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('ready-to-study')}</h2>
      </div>

      {/* Composition badges */}
      <div className="flex justify-center gap-3">
        {composition.new > 0 && (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200">
            {composition.new} {t('new')}
          </span>
        )}
        {composition.learning > 0 && (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
            {composition.learning} {t('learning')}
          </span>
        )}
        {composition.mastered > 0 && (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200">
            {composition.mastered} {t('mastered')}
          </span>
        )}
      </div>

      {/* Selected word chips */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {t('selected-words')} ({selectedWords.length})
          </h3>
          {selectedWords.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedWords([])}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              {t('clear-all')}
            </button>
          )}
        </div>

        {selectedWords.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
            {t('no-words-selected')}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedWords.map(word =>
              word._id ? <WordChip key={word._id} word={word} onRemove={handleRemoveWord} /> : null
            )}
          </div>
        )}
      </div>

      {/* Search input */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {t('add-words')}
          </h3>
          <button
            type="button"
            onClick={() => setShowAllWords(!showAllWords)}
            className="text-xs text-secondary dark:text-gray-400 hover:underline transition-colors"
          >
            {showAllWords ? t('show-overdue-only') : t('show-all-words')}
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('search-placeholder')}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all text-sm"
          />
        </div>

        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-600 divide-y divide-gray-100 dark:divide-gray-700">
            {searchResults.map(word => (
              <button
                key={word._id}
                type="button"
                onClick={() => handleAddWord(word)}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-gray-900 dark:text-white truncate">
                    {word.word}
                  </span>
                  {word.phoneticNotation && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {word.phoneticNotation}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                    {word.definition}
                  </span>
                  <span className="text-secondary dark:text-blue-400 font-bold text-lg leading-none">
                    +
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {searchQuery.trim() && searchResults.length === 0 && (
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500 text-center py-2">
            {t('no-results')}
          </p>
        )}

        {availableWords.length === 0 && !searchQuery && (
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500 text-center py-2">
            {t('no-words-available')}
          </p>
        )}
      </div>

      {/* Validation messages */}
      {!canStartQuiz && (
        <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
          {t('min-words-hint')}
        </p>
      )}
      {isOverMax && (
        <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
          {t('max-words-hint')}
        </p>
      )}

      {/* Start Quiz button */}
      <Button
        onClick={onStartQuiz}
        disabled={!canStartQuiz || isGenerating}
        className="flex items-center justify-between px-5"
      >
        {isGenerating ? (
          <span className="animate-pulse">{t('generating')}</span>
        ) : (
          <>{t('start-quiz')}</>
        )}
        <QuestionAiIcon className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default QuizStartCard;
