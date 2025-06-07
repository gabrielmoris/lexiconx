import Word from "@/lib/models/LanguageCards";
import User from "@/lib/models/user";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { word, definition, phoneticNotation, language, session } = await req.json();
  await connectDB();

  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return NextResponse.json({ error: "User not found" });
  }

  const wordData = {
    userId: user._id,
    word,
    definition,
    phoneticNotation,
    language,
  };

  const saved = await Word.create(wordData);

  return NextResponse.json({ error: null, data: saved });
}
