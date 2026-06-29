import { Language, Word } from './Words';

export interface Deck {
  _id: string;
  userId: string;
  name: string;
  language: Language;
  wordIds: string[];
  wordCount: number;
  createdAt?: string;
  updatedAt?: string;
}

// A deck with its referenced words fully populated (used by quiz, review and hooks).
export interface DeckWithWords extends Omit<Deck, 'wordIds'> {
  words: Word[];
}

export interface DecksResponse {
  error: string | null;
  data: Deck[];
}

export interface DeckResponse {
  error: string | null;
  data: Deck;
}

export interface DeckWithWordsResponse {
  error: string | null;
  data: DeckWithWords;
}
