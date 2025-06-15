// /* eslint-disable @typescript-eslint/no-unused-vars */
// import { generateSentenceWithWords } from "@/lib/gemini";
import User from "@/lib/models/user";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Word from "@/lib/models/word";

export async function POST(req: Request) {
  try {
    const { session, selectedLanguage } = await req.json();

    const apikey = process.env.GEMINI_API_KEY;
    if (!apikey || !session || !selectedLanguage) {
      return NextResponse.json({ error: "API key, session and selected language are required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email }, { status: 404 });

    if (!user) {
      return NextResponse.json({ error: "User not found" });
    }

    const wordsForQuiz = await Word.find({
      userId: user._id,
      language: selectedLanguage,
      nextReview: { $lte: new Date() },
    })
      .sort({ nextReview: 1 })
      .limit(10)
      .exec()
      .catch((err) => {
        console.error("Error fetching words for quiz:", err);
        throw err;
      });

    //   const sentence = await generateSentenceWithWords(apikey, word);
    //   return NextResponse.json({ word, sentence });
    return NextResponse.json({ words: wordsForQuiz });
  } catch {
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
