import { Word } from "@/types/Words";
import { getWordsByIds } from "./apis";

const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const processAnswer = (word: Word, isCorrect: boolean): Word => {
  const updated = { ...word };

  if (!isCorrect) {
    updated.repetitions = 0;
    updated.interval = 0;
    updated.easeFactor = parseFloat(Math.max(MIN_EASE_FACTOR, (word.easeFactor || DEFAULT_EASE_FACTOR) - 0.15).toFixed(2));
    updated.nextReview = addDays(new Date(), -1).toISOString();
  } else {
    updated.repetitions = word.repetitions + 1;
    updated.easeFactor = parseFloat(((word.easeFactor || DEFAULT_EASE_FACTOR) + 0.05).toFixed(2));

    if (updated.repetitions === 1) {
      updated.interval = 1;
    } else if (updated.repetitions === 2) {
      updated.interval = 6;
    } else {
      updated.interval = Math.round((word.interval || 1) * updated.easeFactor);
    }

    updated.nextReview = addDays(new Date(), updated.interval).toISOString();
  }

  updated.lastReviewed = new Date().toISOString();

  return updated;
};

export const successWords = async (wordsIds: string[]): Promise<Word[]> => {
  const { data } = await getWordsByIds(wordsIds);
  return data.map((word: Word) => processAnswer(word, true));
};

export const failWords = async (wordsIds: string[]): Promise<Word[]> => {
  const { data } = await getWordsByIds(wordsIds);
  return data.map((word: Word) => processAnswer(word, false));
};
