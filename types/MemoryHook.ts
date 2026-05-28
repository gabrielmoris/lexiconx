import { Language } from './Words';

export interface MemoryHook {
  _id?: string;
  userId: string;
  wordId: string;
  language: Language;
  phoneticKeyword: string;
  bridgeSentence: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MemoryHookGeneratorResponse {
  hooks: {
    wordId: string;
    phoneticKeyword: string;
    bridgeSentence: string;
  }[];
}

export interface MemoryHookCardData {
  wordId: string;
  word: string;
  definition: string;
  phoneticNotation: string;
  language: Language;
  easeFactor: number;
  phoneticKeyword: string;
  bridgeSentence: string;
}
