import { Word } from "./Words";

export interface Answer {
  sentence: string;
  isCorrect: boolean;
  phoneticNotation?: string;
  translation?: string;
}

export interface Question {
  question: string;
  answers: Answer[];
}

export interface Quiz {
  sentence: string;
  phoneticNotation: string;
  translation: string;
  usedWords: Word[];
  questions: Question[];
}
