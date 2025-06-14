// /* eslint-disable @typescript-eslint/no-unused-vars */
// import { generateSentenceWithWords } from "@/lib/gemini";
import { Word } from "@/types/Words";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { words } = await req.json(); // Instead of getting the words, I should query them from Mongo
  //    words whose nextReview date is in the past or present, ordered by nextReview and limited to 10.
  //   const { userId } = await req.json();

  const apikey = process.env.GEMINI_API_KEY;
  if (!apikey) {
    return NextResponse.json({ error: "API key is required" });
  }

  const wordsToGenerate = words.filter((word: Word) => word.nextReview >= new Date());

  return NextResponse.json({ wordsToGenerate });

  //   const sentence = await generateSentenceWithWords(apikey, word);
  //   return NextResponse.json({ word, sentence });
}
