'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import { Deck } from '@/types/Deck';
import { useDecks } from '@/context/DecksContext';
import Popup from '../UI/Popup';
import QuestionAiIcon from '../Icons/QuestionAiIcon';
import MemoryHookIcon from '../Icons/MemoryHookIcon';
import CardsIcon from '../Icons/CardsIcon';
import RemoveIcon from '../Icons/RemoveIcon';
import EditIcon from '../Icons/EditIcon';

interface DeckCardProps {
  deck: Deck;
  onEdit: (deck: Deck) => void;
}

const DeckCard = ({ deck, onEdit }: DeckCardProps) => {
  const t = useTranslations('decks');
  const { removeDeck } = useDecks();
  const [deletePopup, setDeletePopup] = useState(false);

  const actionClass =
    'flex flex-1 items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ' +
    'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-secondary hover:text-white ' +
    'dark:hover:bg-secondary transition-colors';

  return (
    <div className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      {deletePopup && (
        <Popup
          handleAccept={() => removeDeck(deck._id)}
          handleClose={() => setDeletePopup(false)}
          message={t('delete-message')}
        />
      )}
      <div className="flex flex-row justify-between items-start gap-2">
        <div className="min-w-0">
          <h3
            title={deck.name}
            className="text-xl font-extrabold text-gray-900 dark:text-white truncate"
          >
            {deck.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('word-count', { count: deck.wordCount })}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <EditIcon className="w-5 h-5 cursor-pointer" onClick={() => onEdit(deck)} />
          <RemoveIcon className="w-5 h-5 cursor-pointer" onClick={() => setDeletePopup(true)} />
        </div>
      </div>
      {/* //TODO: Memory hooks is broken! check what happens */}
      <div className="flex flex-col gap-2">
        <Link href={`/decks/${deck._id}/review`} className={actionClass}>
          <CardsIcon className="w-4 h-4" /> {t('review')}
        </Link>
        <Link href={`/memory-hooks?deckId=${deck._id}`} className={actionClass}>
          <MemoryHookIcon className="w-4 h-4 min-w-4" /> {t('memory-hooks')}
        </Link>
        <Link href={`/quiz?deckId=${deck._id}`} className={actionClass}>
          <QuestionAiIcon className="w-4 h-4" /> {t('quiz')}
        </Link>
      </div>
    </div>
  );
};

export default DeckCard;
