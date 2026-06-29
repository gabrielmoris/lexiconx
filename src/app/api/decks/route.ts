import Deck from '@/lib/mongodb/models/deck';
import Word from '@/lib/mongodb/models/word';
import User from '@/lib/mongodb/models/user';
import { connectDB } from '@/lib/mongodb/mongodb';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';

// Keep only the word ids that actually belong to the user for the given
// language, so a deck can never reference deleted or foreign words.
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

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const language = searchParams.get('language');

    if (!language) {
      return NextResponse.json({ error: 'Language not provided' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const decks = await Deck.find({ userId: user._id, language }).sort({ updatedAt: -1 });

    const data = decks.map(deck => ({
      _id: deck._id.toString(),
      userId: deck.userId.toString(),
      name: deck.name,
      language: deck.language,
      wordIds: deck.wordIds.map((id: { toString: () => string }) => id.toString()),
      wordCount: deck.wordIds.length,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    }));

    return NextResponse.json({ error: null, data });
  } catch {
    return NextResponse.json({ error: 'Error getting decks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, language, wordIds } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Deck name is required' }, { status: 400 });
    }

    if (!language) {
      return NextResponse.json({ error: 'Language is required' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sanitizedIds = await sanitizeWordIds(user._id, language, wordIds || []);

    const deck = await Deck.create({
      userId: user._id,
      name: name.trim(),
      language,
      wordIds: sanitizedIds,
    });

    return NextResponse.json({
      error: null,
      data: {
        _id: deck._id.toString(),
        userId: deck.userId.toString(),
        name: deck.name,
        language: deck.language,
        wordIds: sanitizedIds,
        wordCount: sanitizedIds.length,
        createdAt: deck.createdAt,
        updatedAt: deck.updatedAt,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Error creating deck' }, { status: 500 });
  }
}
