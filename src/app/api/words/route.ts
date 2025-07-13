import Word from "@/lib/mongodb/models/word";
import User from "@/lib/mongodb/models/user";
import { connectDB } from "@/lib/mongodb/mongodb";
import { NextResponse } from "next/server";
import type { Word as WordType } from "@/types/Words";

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
  const worIds = searchParams.get("ids");
  const ids = worIds ? worIds.split(",") : [];

  await connectDB();

  if ((!language || !email) && !ids.length) {
    return NextResponse.json({ error: "Language or email not provided" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return NextResponse.json({ error: "User not found" });
  }

  if (ids.length) {
    const words = await Word.find({ _id: { $in: ids } });
    return NextResponse.json({ error: null, data: words });
  } else {
    const words = await Word.find({ userId: user._id, language });
    return NextResponse.json({ error: null, data: words });
  }
}

export async function PUT(req: Request) {
  const { words, session } = await req.json();
  await connectDB();

  if (!session.user.email) {
    return NextResponse.json({ error: "User not found" });
  }

  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return NextResponse.json({ error: "User not found" });
  }

  const updatedWords = await Word.bulkWrite(
    words.map((word: WordType) => ({
      updateOne: {
        filter: { _id: word._id },
        update: {
          nextReview: word.nextReview,
          interval: word.interval,
          lastReviewed: word.lastReviewed,
          repetitions: word.repetitions,
          easeFactor: word.easeFactor,
        },
      },
    }))
  );

  return NextResponse.json({ error: null, data: updatedWords });
}

export async function DELETE(req: Request) {
  const { word, session } = await req.json();

  await connectDB();

  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return NextResponse.json({ error: "User not found" });
  }

  const wordToDelete = await Word.findOne({ _id: word._id });

  if (!wordToDelete) {
    return NextResponse.json({ error: "Word not found" });
  }

  const deletedWord = await Word.deleteOne(wordToDelete);

  return NextResponse.json({ error: null, data: deletedWord });
}
