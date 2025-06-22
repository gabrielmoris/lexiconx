import { Word } from "./Words";

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
  language: string;
  phoneticNotation: string;
  translation: string;
  usedWords: Word[];
  questions: QuizQuestion[];
}

export interface QuizGeneratorResponse {
  quizzes: Quiz[];
}
