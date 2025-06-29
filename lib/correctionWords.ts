import { Word } from "@/types/Words";
import { Session } from "next-auth";
import { getWordsByIds } from "./apis";

export const failWords = async (session: Session, wordsIds: string[]): Promise<Word[]> => {
  if (!session.user?.email) throw new Error("User not found");
  const { data } = await getWordsByIds(wordsIds, session?.user?.email);

  data.forEach((word: Word) => {
    word.nextReview = new Date().toISOString();
    word.interval = 0;
    word.repetitions = 0;
    word.easeFactor = parseFloat((word.easeFactor - 0.1).toFixed(2));
  });

  return data;
};

export const successWords = async (session: Session, wordsIds: string[]): Promise<Word[]> => {
  if (!session.user?.email) throw new Error("User not found");
  const { data } = await getWordsByIds(wordsIds, session?.user?.email);

  data.forEach((word: Word) => {
    word.nextReview = new Date().toISOString();
    word.interval = word.interval > 5 ? word.interval + 1 : word.interval;
    word.repetitions = word.repetitions + 1;
    word.easeFactor = parseFloat((word.easeFactor + 0.1).toFixed(2));
  });

  return data;
};
