import Word from "@/lib/mongodb/models/word";
import User from "@/lib/mongodb/models/user";
import { connectDB } from "@/lib/mongodb/mongodb";
import { NextResponse } from "next/server";
import type { Word as WordType } from "@/types/Words";

export async function POST(req: Request) {
  const { word, definition, phoneticNotation, language, session } = await req.json();

  try {
    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
  } catch {
    return NextResponse.json({ error: "Error saving words" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const language = searchParams.get("language");
  const email = searchParams.get("email");
  const worIds = searchParams.get("ids");
  const ids = worIds ? worIds.split(",") : [];

  try {
    await connectDB();

    if ((!language || !email) && !ids.length) {
      return NextResponse.json({ error: "Language or email not provided" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (ids.length) {
      const words = await Word.find({ _id: { $in: ids } });
      return NextResponse.json({ error: null, data: words });
    } else {
      const words = await Word.find({ userId: user._id, language });
      return NextResponse.json({ error: null, data: words });
    }
  } catch {
    return NextResponse.json({ error: "Error getting words" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { words, session } = await req.json();

  try {
    await connectDB();

    if (!session.user.email) {
      return NextResponse.json({ error: "User not provided" }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
      })),
    );

    return NextResponse.json({ error: null, data: updatedWords });
  } catch {
    return NextResponse.json({ error: "Error updating words" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { word, session } = await req.json();

  try {
    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const wordToDelete = await Word.findOne({ _id: word._id });

    if (!wordToDelete) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    if (!wordToDelete.userId.equals(user._id)) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    const deletedWord = await Word.deleteOne(wordToDelete);

    return NextResponse.json({ error: null, data: deletedWord });
  } catch {
    return NextResponse.json({ error: "Error deleting words" }, { status: 500 });
  }
}
