export interface LearningProgress {
  language: string;
  level: number;
  totalWords: number;
  wordsMastered: number;
  currentStreak: number;
  lastSessionDate: Date;
  timeSpent: number;
}
