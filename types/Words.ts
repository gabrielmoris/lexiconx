export interface LearningProgress {
  language: string;
  level: number;
  wordsMastered: number;
  currentStreak: number;
  lastSessionDate: Date;
  timeSpent: number;
}

export interface Word {
  _id?: string;
  userId: string;
  word: string;
  definition: string;
  phoneticNotation: string;
  language: Language;
  tags: string[];
  lastReviewed: string | null;
  nextReview: string;
  interval: number;
  repetitions: number;
  easeFactor: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface User {
  email: string;
  googleID?: string;
  name?: string;
  image?: string;
  nativeLanguage?: Language;
  activeLanguage: string;
  learningProgress: LearningProgress[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WordsGeneratorResponse {
  words: Word[];
}

export type Language = "中文" | "English" | "Deutsch" | "Español" | "русский";
export type Locale = "en" | "de" | "zh" | "es" | "ru";
