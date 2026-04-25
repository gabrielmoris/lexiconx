import { Language, Word } from "./Words";

export interface QuizAnswer {
  answer: string;
  isCorrect: boolean;
  phoneticNotation?: string;
  translation?: string;
}

export interface QuizQuestion {
  question: string;
  options: QuizAnswer[];
}

export interface Quiz {
  sentence: string;
  language: Language;
  phoneticNotation: string;
  translation: string;
  /** Array of Word _id string references */
  usedWords: string[];
  questions: QuizQuestion[];
}

export interface QuizGeneratorResponse {
  quizzes: Quiz[];
}
