'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Word } from '@/types/Words';
import { Deck } from '@/types/Deck';
import { useWords } from '@/context/WordsContext';
import { useDecks } from '@/context/DecksContext';
import { useLanguage } from '@/context/LanguageToLearnContext';
import { useToastContext } from '@/context/ToastContext';
import WordChip from '../Quiz/WordChip';
import Button from '../UI/Button';

interface DeckBuilderProps {
  // When provided the builder edits an existing deck instead of creating one.
  deck?: Deck;
  onDone: () => void;
}

const DeckBuilder = ({ deck, onDone }: DeckBuilderProps) => {
  const t = useTranslations('decks');
  const { words: allWords } = useWords();
  const { selectedLanguage } = useLanguage();
  const { addDeck, editDeck } = useDecks();
  const { showToast } = useToastContext();

  const languageWords = useMemo(
    () => allWords.filter(w => w.language === selectedLanguage.language),
    [allWords, selectedLanguage.language]
  );

  const [name, setName] = useState(deck?.name ?? '');
  const [selectedWords, setSelectedWords] = useState<Word[]>(() =>
    deck ? languageWords.filter(w => w._id && deck.wordIds.includes(w._id)) : []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const selectedIds = useMemo(
    () => new Set(selectedWords.map(w => w._id).filter(Boolean)),
    [selectedWords]
  );

  const handleRemoveWord = useCallback((wordId: string) => {
    setSelectedWords(prev => prev.filter(w => w._id !== wordId));
  }, []);

  const handleAddWord = useCallback(
    (word: Word) => {
      if (word._id && !selectedIds.has(word._id)) {
        setSelectedWords(prev => [...prev, word]);
      }
      setSearchQuery('');
    },
    [selectedIds]
  );

  const searchResults = useMemo(() => {
    const unselected = languageWords.filter(w => !selectedIds.has(w._id!));
    if (!searchQuery.trim()) return unselected.slice(0, 8);
    const q = searchQuery.toLowerCase();
    return unselected
      .filter(
        w =>
          w.word.toLowerCase().includes(q) ||
          w.definition.toLowerCase().includes(q) ||
          (w.phoneticNotation && w.phoneticNotation.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [searchQuery, languageWords, selectedIds]);

  const canSave = name.trim().length > 0 && selectedWords.length > 0 && !isSaving;

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    const wordIds = selectedWords.map(w => w._id!).filter(Boolean);
    if (deck) {
      await editDeck(deck._id, { name: name.trim(), wordIds });
    } else {
      const created = await addDeck(name.trim(), wordIds);
      if (created) {
        showToast({ message: t('deck-created'), variant: 'success', duration: 2500 });
      }
    }
    setIsSaving(false);
    onDone();
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {deck ? t('edit-deck') : t('new-deck')}
        </h2>
      </div>

      {/* Deck name */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {t('deck-name')}
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={t('deck-name-placeholder')}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all text-sm"
        />
      </div>

      {/* Selected words */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {t('selected-words')} ({selectedWords.length})
          </h3>
          {selectedWords.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedWords([])}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
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

      {/* Word search / picker */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          {t('add-words')}
        </h3>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={t('search-placeholder')}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all text-sm"
        />

        {searchResults.length > 0 ? (
          <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-600 divide-y divide-gray-100 dark:divide-gray-700">
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
                <div className="flex items-center gap-2 shrink-0 ml-2">
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
        ) : (
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500 text-center py-2">
            {languageWords.length === 0 ? t('no-words-available') : t('no-results')}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" type="button" onClick={onDone} className="px-5">
          {t('cancel')}
        </Button>
        <Button type="button" onClick={handleSave} disabled={!canSave} className="px-5">
          {isSaving ? t('saving') : t('save-deck')}
        </Button>
      </div>
    </div>
  );
};

export default DeckBuilder;
