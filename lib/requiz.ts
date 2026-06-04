import { Word } from '@/types/Words';

/**
 * A requiz question built entirely from existing Word data — no LLM needed.
 * Uses the "Reverse Direction" approach: the stem is the word's definition
 * (in the user's native language), and options are target-language words.
 * This shifts the cognitive task from recognition (L2→L1) to productive
 * recall (L1→L2), which is a harder and more effective encoding operation.
 *
 * Approach 1 (Option Shuffle) is baked in: distractors are drawn from the
 * full session word pool, not the original question, destroying positional cues.
 */
export interface RequizQuestion {
  /** The definition of the target word, used as the question stem */
  stem: string;
  /** The correct target-language word */
  correctWord: string;
  /** Phonetic notation for the correct word */
  correctPhonetic: string;
  /** All options (including correct), already shuffled */
  options: RequizOption[];
  /** Word IDs this requiz question targets */
  usedWords: string[];
}

export interface RequizOption {
  word: string;
  phoneticNotation: string;
  isCorrect: boolean;
}

/**
 * Shuffles an array using Fisher-Yates algorithm.
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Builds reverse-direction requiz questions for missed words.
 *
 * For each missed word:
 * - Stem = word's definition (native language)
 * - Correct option = the target-language word + its phonetic notation
 * - Distractors = other words from the same quiz session (shuffled)
 *
 * @param missedWordIds - IDs of words the user answered incorrectly
 * @param allWords - All Word objects used in the quiz session
 * @returns RequizQuestion array (one per missed word), shuffled
 */
export function buildRequizQuestions(missedWordIds: string[], allWords: Word[]): RequizQuestion[] {
  if (missedWordIds.length === 0) return [];

  const missedWords = allWords.filter(w => missedWordIds.includes(w._id!));
  const distractorPool = allWords.filter(w => !missedWordIds.includes(w._id!));

  const questions: RequizQuestion[] = missedWords.map(targetWord => {
    // Pick up to 3 distractors from other words in the session
    const distractors = shuffle(distractorPool)
      .slice(0, 3)
      .map(dw => ({
        word: dw.word,
        phoneticNotation: dw.phoneticNotation,
        isCorrect: false,
      }));

    const correctOption: RequizOption = {
      word: targetWord.word,
      phoneticNotation: targetWord.phoneticNotation,
      isCorrect: true,
    };

    // Shuffle correct + distractors together (Approach 1: option shuffle)
    const options = shuffle([correctOption, ...distractors]);

    return {
      stem: targetWord.definition,
      correctWord: targetWord.word,
      correctPhonetic: targetWord.phoneticNotation,
      options,
      usedWords: [targetWord._id!],
    };
  });

  return shuffle(questions);
}
