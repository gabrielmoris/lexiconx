'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDecks } from '@/context/DecksContext';
import { useLanguage } from '@/context/LanguageToLearnContext';
import { Deck } from '@/types/Deck';
import DeckCard from './DeckCard';
import DeckBuilder from './DeckBuilder';
import Button from '../UI/Button';
import LoadingComponent from '../Layout/LoadingComponent';
import DeckIcon from '../Icons/DeckIcon';

type View = { mode: 'list' } | { mode: 'create' } | { mode: 'edit'; deck: Deck };

const DecksManager = () => {
  const t = useTranslations('decks');
  const { decks, loading } = useDecks();
  const { isSelectedLanguageLoading } = useLanguage();
  const [view, setView] = useState<View>({ mode: 'list' });

  if (view.mode === 'create') {
    return <DeckBuilder onDone={() => setView({ mode: 'list' })} />;
  }

  if (view.mode === 'edit') {
    return <DeckBuilder deck={view.deck} onDone={() => setView({ mode: 'list' })} />;
  }

  if (loading || isSelectedLanguageLoading) {
    return <LoadingComponent />;
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex justify-center md:justify-end">
        <Button
          type="button"
          onClick={() => setView({ mode: 'create' })}
          className="flex items-center justify-between px-5 w-full md:max-w-60"
        >
          {t('new-deck')}
          <DeckIcon className="w-5 h-5" />
        </Button>
      </div>

      {decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <DeckIcon className="w-12 h-12 text-gray-300 dark:text-gray-600" />
          <p className="text-lg text-gray-500 dark:text-gray-400">{t('no-decks')}</p>
        </div>
      ) : (
        <section className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {decks.map(deck => (
            <DeckCard key={deck._id} deck={deck} onEdit={d => setView({ mode: 'edit', deck: d })} />
          ))}
        </section>
      )}
    </div>
  );
};

export default DecksManager;
