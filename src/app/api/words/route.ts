import Word from "@/lib/models/word";
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const language = searchParams.get("language");
  const email = searchParams.get("email");
  await connectDB();

  if (!language || !email) {
    return NextResponse.json({ error: "Language or email not provided" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return NextResponse.json({ error: "User not found" });
  }

  const words = await Word.find({ userId: user._id, language });

  return NextResponse.json({ error: null, data: words });
}
