import { Word } from "@/types/Words";

export const failWords = (words: Word[]) => {
  const wordsCopy = [...words];

  wordsCopy.forEach((word) => {
    word.nextReview = new Date().toISOString();
    word.interval = 0;
    word.repetitions = 0;
    word.easeFactor = parseFloat((word.easeFactor - 0.1).toFixed(2));
  });
  return wordsCopy;
};

export const successWords = (words: Word[]) => {
  const wordsCopy = [...words];

  words.forEach((word) => {
    word.nextReview = new Date().toISOString();
    word.interval = word.interval > 5 ? word.interval + 1 : word.interval;
    word.repetitions = word.repetitions + 1;
    word.easeFactor = parseFloat((word.easeFactor + 0.1).toFixed(2));
  });
  return wordsCopy;
};
