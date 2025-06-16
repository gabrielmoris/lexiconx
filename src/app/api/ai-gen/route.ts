/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateQuizWithWords } from "@/lib/gemini";
import User from "@/lib/models/user";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Word from "@/lib/models/word";

const LANGUAGES: Record<string, "english" | "spanish" | "german" | "chinese"> = { en: "english", de: "german", zh: "chinese", es: "spanish" };

// Updated Next.js API endpoint
export async function POST(req: Request) {
  try {
    const { session, languageToLearn, userLanguage, level } = (await req.json()) as {
      session: any;
      languageToLearn: string;
      userLanguage: "english" | "spanish" | "german" | "chinese";
      level?: number;
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
    const wordsForQuiz = await Word.find({
      userId: user._id,
      language: languageToLearn,
      nextReview: { $lte: new Date() },
    })
      .sort({ nextReview: 1 })
      .limit(10)
      .exec();

    if (wordsForQuiz.length < 3) {
      return NextResponse.json(
        {
          error: "Not enough words found for quiz generation",
        },
        { status: 404 }
      );
    }

    // Get user's language progress or default level
    const learningProgressArray = Array.isArray(user.learningProgress)
      ? user.learningProgress.map((lp: any) => (typeof lp.toObject === "function" ? lp.toObject() : lp))
      : [];
    const languageProgress = learningProgressArray.find((lp: any) => lp?.language === languageToLearn);
    const userLevel = level || languageProgress?.level || 1;

    const fullUserLanguage = LANGUAGES[userLanguage];

    // Generate quiz using the enhanced function
    const quizResponse = await generateQuizWithWords(apikey, wordsForQuiz, userLevel, languageToLearn, fullUserLanguage);

    return NextResponse.json({
      success: true,
      ...quizResponse,
      userLevel,
      totalWords: wordsForQuiz.length,
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
