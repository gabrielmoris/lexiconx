/* eslint-disable @typescript-eslint/no-explicit-any */
import User from "@/lib/mongodb/models/user";
import { connectDB } from "@/lib/mongodb/mongodb";
import { NextResponse } from "next/server";
import Word from "@/lib/mongodb/models/word";
import { Language } from "@/types/Words";
import { generateWords } from "@/lib/gemini-words";

const LANGUAGES: Record<string, Language> = { en: "English", de: "Deutsch", zh: "中文", es: "Español" };

// Updated Next.js API endpoint
export async function POST(req: Request) {
  try {
    const { session, languageToLearn, userLanguage, level } = (await req.json()) as {
      session: any;
      languageToLearn: Language;
      userLanguage: Language;
      level: number;
    };

    const apikey = process.env.GEMINI_API_KEY;
    if (!apikey || !session || !languageToLearn || !userLanguage) {
      return NextResponse.json(
        {
          error: "API key, session, target language, and user language are required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch words for quiz

    const wordsfromDatabase = await Word.find({
      userId: user._id,
      language: languageToLearn,
    }).exec();

    const wordsForQuiz = wordsfromDatabase.map(({ word }) => word);

    // Get user's language progress or default level
    const learningProgressArray = Array.isArray(user.learningProgress)
      ? user.learningProgress.map((lp: any) => (typeof lp.toObject === "function" ? lp.toObject() : lp))
      : [];
    const languageProgress = learningProgressArray.find((lp: any) => lp?.language === languageToLearn);
    const userLevel = level || languageProgress?.level || 1;

    const fullUserLanguage = LANGUAGES[userLanguage];

    // Generate quiz using the enhanced function
    const wordsResponse = await generateWords(apikey, wordsForQuiz, userLevel, languageToLearn, fullUserLanguage);

    return NextResponse.json({
      success: true,
      ...wordsResponse,
      userLevel,
    });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      {
        error: "An internal server error occurred during quiz generation.",
      },
      { status: 500 }
    );
  }
}
