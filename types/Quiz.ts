import { Word } from "./Words";

export interface QuizAnswer {
  sentence: string;
  isCorrect: boolean;
  //   phoneticNotation?: string;
  //   translation?: string;
}

export interface QuizQuestion {
  question: string;
  answers: QuizAnswer[];
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
