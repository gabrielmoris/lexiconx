import { Word } from "./Words";

export interface Answer {
  sentence: string;
  isCorrect: boolean;
}

export interface Quiz {
  sentence: string;
  usedWords: Word[];
  answers: Answer[];
}
