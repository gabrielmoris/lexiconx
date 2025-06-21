import { Word } from "@/types/Words";

export const failWords = (words: Word[]) => {
  words.forEach((word) => {
    word.nextReview = new Date().toString();
    word.interval = 0;
    word.repetitions = 0;
    word.easeFactor = word.easeFactor - 0.1;
  });
};

export const successWords = (words: Word[]) => {
  words.forEach((word) => {
    word.nextReview = new Date().toString();
    word.interval = word.interval > 5 ? word.interval + 1 : word.interval;
    word.repetitions = word.repetitions + 1;
    word.easeFactor = word.easeFactor + 0.1;
  });
};
