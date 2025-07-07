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
  activeLanguage: string;
  learningProgress: LearningProgress[];
  createdAt: Date;
  updatedAt: Date;
}

export type Language = "chinese" | "english" | "german" | "spanish";
export type Locale = "en" | "de" | "zh" | "es";
