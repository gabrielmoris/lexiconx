import { User, Word } from "@/types/Words";

/**
 * Calculates the next review parameters (interval and nextReview date) for a batch of words
 * based on their current SRS state (repetitions, easeFactor) and the user's learning level.
 *
 * @param {Array<object>} wordsArray An array of word documents with their current SRS fields.
 * @param {object} userObject The user document containing learningProgress.
 * @returns {Array<object>} An array of word documents with updated SRS parameters (interval, nextReview, lastReviewed, updatedAt).
 */

export const calculateNextReviewData = (wordsArray: Word[], userObject: User): Array<object> => {
  const CURRENT_TIME = new Date();
  const MIN_EASE_FACTOR = 1.3;
  const DEFAULT_EASE_FACTOR = 2.5;

  const updatedWords = wordsArray.map((word) => {
    const updatedWord = { ...word };

    let { easeFactor } = updatedWord;
    const { repetitions, interval, language } = updatedWord;

    const learningProgress = userObject.learningProgress.find((progress) => progress.language === language);
    const userLevel = learningProgress ? learningProgress.level : 0;

    // Define how much the level impacts the interval (e.g., 1% per level)
    const LEVEL_IMPACT_FACTOR = 0.01;

    let calculatedInterval;

    // Infer success/failure from repetitions and adjust easeFactor as if a review just happened

    if (repetitions === 0) {
      // Case 1: Word was just failed, or is new. Needs immediate re-review.
      calculatedInterval = 1;
    } else if (repetitions === 1) {
      // Case 2: First correct recall
      calculatedInterval = 1;

      easeFactor = (easeFactor || DEFAULT_EASE_FACTOR) + 0.05;
    } else if (repetitions === 2) {
      // Case 3: Second correct recall
      calculatedInterval = 6;
      // Slightly increase easeFactor for second correct
      easeFactor = (easeFactor || DEFAULT_EASE_FACTOR) + 0.05;
    } else {
      // Case 4: Subsequent correct recalls (repetitions > 2)

      const baseIntervalForCalc = interval === 0 && repetitions > 1 ? 6 : interval;
      calculatedInterval = Math.round(baseIntervalForCalc * (easeFactor || DEFAULT_EASE_FACTOR));

      // Slightly increase easeFactor for continued correct answers
      easeFactor = (easeFactor || DEFAULT_EASE_FACTOR) + 0.05;
    }

    // Apply user level impact to the calculated interval
    calculatedInterval = Math.round(calculatedInterval * (1 + userLevel * LEVEL_IMPACT_FACTOR));

    // Ensure minimum easeFactor
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor);

    // Update the word's SRS fields
    updatedWord.lastReviewed = CURRENT_TIME.toISOString();
    updatedWord.nextReview = new Date(CURRENT_TIME.getTime() + calculatedInterval * 24 * 60 * 60 * 1000).toISOString();
    updatedWord.interval = calculatedInterval;
    updatedWord.repetitions = repetitions;
    updatedWord.easeFactor = easeFactor;
    updatedWord.updatedAt = CURRENT_TIME.toISOString();

    return updatedWord;
  });

  return updatedWords;
};
