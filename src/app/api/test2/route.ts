/* eslint-disable @typescript-eslint/no-unused-vars */
import { generateSentenceWithWords } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  //   const { searchParams } = new URL(req.url);
  // hardcoded example
  const word = ["Hi", "friend", "horse", "brave"];
  const apikey = process.env.GEMINI_API_KEY;
  if (!apikey) {
    return NextResponse.json({ error: "API key is required" });
  }

  const sentence = await generateSentenceWithWords(apikey, word);
  return NextResponse.json({ word, sentence });
}
