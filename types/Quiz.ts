import { Language } from "./Words";

export interface QuizAnswer {
  answer: string;
  isCorrect: boolean;
  phoneticNotation?: string;
  translation?: string;
}

export interface QuizQuestion {
  question: string;
  options: QuizAnswer[];
 usedWords: string[];
 elaboration?: string;
 errorExplanation?: string;
}

export interface Quiz {
  sentence: string;
  language: Language;
  phoneticNotation: string;
  translation: string;
  questions: QuizQuestion[];
}

/** Derives all unique word IDs used across all questions in a quiz */
export const getQuizUsedWords = (quiz: Quiz): string[] => [...new Set(quiz.questions.flatMap((q) => q.usedWords))];

export interface QuizGeneratorResponse {
  quizzes: Quiz[];
}
