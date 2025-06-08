export interface LearningProgress {
  language: string;
  level: number;
  totalWords: number;
  wordsMastered: number;
  currentStreak: number;
  lastSessionDate: Date;
  timeSpent: number;
}

export interface Word {
  userId: string;
  word: string;
  definition: string;
  phoneticNotation: string;
  language: string;
  tags: string[];
  lastReviewed: Date;
  nextReview: Date;
  interval: number;
  repetitions: number;
  easeFactor: number;
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
