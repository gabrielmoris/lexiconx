import { Word } from "./Words";

// export interface Answer {
//   sentence: string;
//   isCorrect: boolean;
//   phoneticNotation?: string;
//   translation?: string;
// }

export interface QuizAnswer {
  sentence: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  question: string;
  answers: QuizAnswer[];
}

export interface Quiz {
  sentence: string;
  phoneticNotation: string;
  translation: string;
  usedWords: Word[];
  questions: QuizQuestion[];
}

export interface QuizGeneratorResponse {
  quizzes: Quiz[];
}
