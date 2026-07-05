import Deck from '@/lib/mongodb/models/deck';
import Word from '@/lib/mongodb/models/word';
import User from '@/lib/mongodb/models/user';
import { connectDB } from '@/lib/mongodb/mongodb';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';

async function sanitizeWordIds(
  userId: unknown,
  language: string,
  wordIds: string[]
): Promise<string[]> {
  if (!Array.isArray(wordIds) || wordIds.length === 0) return [];
  const ownedWords = await Word.find({
    _id: { $in: wordIds },
    userId,
    language,
  }).select('_id');
  return ownedWords.map(w => w._id.toString());
}

// Returns the deck with its words fully populated, so quiz / review / hooks
// receive live SRS state straight from the Word collection.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const deck = await Deck.findOne({ _id: id, userId: user._id });
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Only return words still owned by the user (handles words deleted after
    // the deck was saved) and preserve the deck's order.
    const words = await Word.find({ _id: { $in: deck.wordIds }, userId: user._id });
    const wordMap = new Map(words.map(w => [w._id.toString(), w]));
    const orderedWords = deck.wordIds
      .map((wid: { toString: () => string }) => wordMap.get(wid.toString()))
      .filter(Boolean);

    return NextResponse.json({
      error: null,
      data: {
        _id: deck._id.toString(),
        userId: deck.userId.toString(),
        name: deck.name,
        language: deck.language,
        wordCount: orderedWords.length,
        words: orderedWords,
        createdAt: deck.createdAt,
        updatedAt: deck.updatedAt,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Error getting deck' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { name, wordIds } = await req.json();

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const deck = await Deck.findOne({ _id: id, userId: user._id });
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    if (typeof name === 'string' && name.trim()) {
      deck.name = name.trim();
    }

    if (Array.isArray(wordIds)) {
      deck.wordIds = await sanitizeWordIds(user._id, deck.language, wordIds);
    }

    await deck.save();

    return NextResponse.json({
      error: null,
      data: {
        _id: deck._id.toString(),
        userId: deck.userId.toString(),
        name: deck.name,
        language: deck.language,
        wordIds: deck.wordIds.map((wid: { toString: () => string }) => wid.toString()),
        wordCount: deck.wordIds.length,
        createdAt: deck.createdAt,
        updatedAt: deck.updatedAt,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Error updating deck' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const deleted = await Deck.deleteOne({ _id: id, userId: user._id });

    if (deleted.deletedCount === 0) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    return NextResponse.json({ error: null, data: deleted });
  } catch {
    return NextResponse.json({ error: 'Error deleting deck' }, { status: 500 });
  }
}
