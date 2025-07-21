import { LearningProgress } from "./Words";

export interface UserProfile {
  _id: string;
  email: string;
  name?: string;
  image?: string;
  createdAt: string;
  updatedAt?: string;
  __v?: number;
  nativeLanguage: string;
  activeLanguage: string;
  learningProgress: LearningProgress[];
}
