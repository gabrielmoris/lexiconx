/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-unused-vars */
import { generateSentenceWithWords } from "@/lib/gemini";
import User from "@/lib/models/user";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Word from "@/lib/models/word";
import { LearningProgress } from "@/types/Words";

export async function POST(req: Request) {
  try {
    const { session, languageToLearn, userLanguage } = await req.json();

    const apikey = process.env.GEMINI_API_KEY;
    if ((!apikey || !session || !languageToLearn, userLanguage)) {
      return NextResponse.json({ error: "API key, session and selected language are required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" });
    }

    const wordsForQuiz = await Word.find({
      userId: user._id,
      language: languageToLearn,
      userLanguage,
      nextReview: { $lte: new Date() },
    })
      .sort({ nextReview: 1 })
      .limit(10)
      .exec()
      .catch((err) => {
        console.error("Error fetching words for quiz:", err);
        throw err;
      });

    const languageProgress = user.learningProgress.find((lp: any) => lp?.language === languageToLearn, userLanguage) as LearningProgress | undefined;
    const languageLevel = languageProgress?.level ?? 1;

    if (wordsForQuiz.length < 10) {
      return NextResponse.json({ error: "No enoughwords found" }, { status: 404 });
    }

    //   const sentence = await generateSentenceWithWords(apikey, wordsForQuiz, languageToLearn, userLanguage, user.activeLanguage.level);
    //   return NextResponse.json({ word, sentence });
    return NextResponse.json({ words: wordsForQuiz, level: languageLevel });
  } catch {
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
