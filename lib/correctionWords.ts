import { Word } from "@/types/Words";
import { Session } from "next-auth";

const getWordsByID = async (session: Session | null, ids: string[]) => {
  const apiCall = await fetch(`/api/words?ids=${ids.join(",")}&email=${session?.user?.email}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!apiCall.ok) {
    const errorData = await apiCall.json();
    throw new Error(errorData.error || "Failed to fetch words by ID");
  }

  const result = await apiCall.json();
  return result.data as Word[];
};

export const failWords = async (session: Session, wordsIds: string[]): Promise<Word[]> => {
  const wordsArray = await getWordsByID(session, wordsIds);

  wordsArray.forEach((word: Word) => {
    word.nextReview = new Date().toISOString();
    word.interval = 0;
    word.repetitions = 0;
    word.easeFactor = parseFloat((word.easeFactor - 0.1).toFixed(2));
  });

  return wordsArray;
};

export const successWords = async (session: Session, wordsIds: string[]): Promise<Word[]> => {
  const wordsArray = await getWordsByID(session, wordsIds);

  wordsArray.forEach((word: Word) => {
    word.nextReview = new Date().toISOString();
    word.interval = word.interval > 5 ? word.interval + 1 : word.interval;
    word.repetitions = word.repetitions + 1;
    word.easeFactor = parseFloat((word.easeFactor + 0.1).toFixed(2));
  });

  return wordsArray;
};
