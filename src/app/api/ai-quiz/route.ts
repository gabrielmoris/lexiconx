/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateQuizWithWords } from "@/lib/gemini-quiz";
import User from "@/lib/mongodb/models/user";
import { connectDB } from "@/lib/mongodb/mongodb";
import { NextResponse } from "next/server";
import Word from "@/lib/mongodb/models/word";
import { Language } from "@/types/Words";

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
    const now = new Date();

    const overdueWords = await Word.find({
      userId: user._id,
      language: languageToLearn,
      nextReview: { $lte: now },
    })
      .sort({ nextReview: 1 })
      .limit(15)
      .exec();

    let newWords = [];
    const desiredTotalWords = 10;
    const newWordsToFetch = Math.max(0, desiredTotalWords - overdueWords.length);

    // Fetch some new words if overdue words are scarce
    if (newWordsToFetch > 0) {
      newWords = await Word.find({
        userId: user._id,
        language: languageToLearn,
        repetitions: 0,
        lastReviewed: null,
      })
        .sort({ createdAt: 1 })
        .limit(newWordsToFetch)
        .exec();
    }

    let wordsForQuiz = [...overdueWords, ...newWords];

    // Simple shuffle to mix overdue and new words, and randomize within due words
    wordsForQuiz.sort(() => Math.random() - 0.5);

    // Limit to the desired number of words for the quiz
    wordsForQuiz = wordsForQuiz.slice(0, desiredTotalWords);
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
