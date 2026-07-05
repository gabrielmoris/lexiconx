'use client';
import { Deck } from '@/types/Deck';
import { Language } from '@/types/Words';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useToastContext } from './ToastContext';
import { useSession } from 'next-auth/react';
import { useLanguage } from './LanguageToLearnContext';
import { createDeck, deleteDeck, getDecks, updateDeck } from '@/lib/apis';
import { useTranslations } from 'next-intl';

interface DecksContextType {
  decks: Deck[];
  loading: boolean;
  addDeck: (name: string, wordIds: string[]) => Promise<Deck | undefined>;
  editDeck: (deckId: string, updates: { name?: string; wordIds?: string[] }) => Promise<void>;
  removeDeck: (deckId: string) => Promise<void>;
}

const DecksContext = createContext<DecksContextType>({
  decks: [],
  loading: false,
  addDeck: async () => undefined,
  editDeck: async () => {},
  removeDeck: async () => {},
});

export const DecksProvider = ({ children }: { children: React.ReactNode }) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: session } = useSession();
  const { selectedLanguage, isSelectedLanguageLoading } = useLanguage();
  const { showToast } = useToastContext();
  const t = useTranslations('decks');

  const fetchDecks = useCallback(
    async (language: Language) => {
      setLoading(true);
      try {
        const { data } = await getDecks(language);
        setDecks(data || []);
      } catch (err) {
        showToast({
          message: err instanceof Error ? err.message : t('error-fetching'),
          variant: 'error',
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    },
    [showToast, t]
  );

  useEffect(() => {
    if (session && !isSelectedLanguageLoading) {
      fetchDecks(selectedLanguage.language);
    } else if (!session) {
      setLoading(false);
      setDecks([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, selectedLanguage, isSelectedLanguageLoading]);

  const addDeck = async (name: string, wordIds: string[]) => {
    try {
      const { data } = await createDeck(name, selectedLanguage.language, wordIds);
      setDecks(prev => [data, ...prev]);
      return data as Deck;
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : t('error-saving'),
        variant: 'error',
        duration: 3000,
      });
    }
  };

  const editDeck = async (deckId: string, updates: { name?: string; wordIds?: string[] }) => {
    try {
      const { data } = await updateDeck(deckId, updates);
      setDecks(prev => prev.map(deck => (deck._id === deckId ? data : deck)));
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : t('error-saving'),
        variant: 'error',
        duration: 3000,
      });
    }
  };

  const removeDeck = async (deckId: string) => {
    try {
      await deleteDeck(deckId);
      setDecks(prev => prev.filter(deck => deck._id !== deckId));
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : t('error-deleting'),
        variant: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <DecksContext.Provider value={{ decks, loading, addDeck, editDeck, removeDeck }}>
      {children}
    </DecksContext.Provider>
  );
};

export const useDecks = () => {
  const context = useContext(DecksContext);
  if (context === undefined) {
    throw new Error('useDecks must be used within a DecksProvider');
  }
  return context;
};
