import { Word } from "@/types/Words";

const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;

/** Maximum easeFactor decrease per quiz session (prevents destroying a word from multiple failures) */
const MAX_EASE_DECREASE_PER_QUIZ = 0.3;

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const processAnswer = (word: Word, isCorrect: boolean, originalEaseFactor?: number): Word => {
  const updated = { ...word };

  if (!isCorrect) {
    // Failed: reset reps, schedule for tomorrow, decrease easeFactor
    updated.repetitions = 0;
    updated.interval = 0;

    let newEase = (word.easeFactor || DEFAULT_EASE_FACTOR) - 0.15;

    // Per-quiz cap: don't let easeFactor drop more than MAX_EASE_DECREASE_PER_QUIZ
    if (originalEaseFactor !== undefined) {
      const minEaseThisQuiz = originalEaseFactor - MAX_EASE_DECREASE_PER_QUIZ;
      newEase = Math.max(newEase, minEaseThisQuiz);
    }

    updated.easeFactor = parseFloat(Math.max(MIN_EASE_FACTOR, newEase).toFixed(2));
    updated.nextReview = addDays(new Date(), -1).toISOString();
  } else {
    updated.repetitions = word.repetitions + 1;
    updated.easeFactor = parseFloat(((word.easeFactor || DEFAULT_EASE_FACTOR) + 0.05).toFixed(2));

    if (updated.repetitions === 1) {
      updated.interval = 1; // 1 day
    } else if (updated.repetitions === 2) {
      updated.interval = 6; // 6 days
    } else {
      updated.interval = Math.round((word.interval || 1) * updated.easeFactor);
    }

    updated.nextReview = addDays(new Date(), updated.interval).toISOString();
  }

  updated.lastReviewed = new Date().toISOString();
  return updated;
};

export { MIN_EASE_FACTOR, DEFAULT_EASE_FACTOR, MAX_EASE_DECREASE_PER_QUIZ };
