import Word from '@/lib/mongodb/models/word';
import MemoryHook from '@/lib/mongodb/models/memoryHook';
import User from '@/lib/mongodb/models/user';
import { connectDB } from '@/lib/mongodb/mongodb';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { generateMemoryHooks } from '@/lib/ai/generate-memory-hooks';
import type { Word as WordType } from '@/types/Words';
import type { MemoryHookCardData } from '@/types/MemoryHook';

const MAX_WEAK_WORDS = 10;

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const language = searchParams.get('language');

    if (!language) {
      return NextResponse.json({ error: 'Language parameter is required' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch weakest words (lowest easeFactor)
    const weakWords = await Word.aggregate([
      { $match: { userId: user._id, language, easeFactor: { $exists: true } } },
      { $sort: { easeFactor: 1 } },
      { $limit: MAX_WEAK_WORDS },
    ]);

    if (weakWords.length === 0) {
      return NextResponse.json({ error: null, data: [] });
    }

    const weakWordIds = weakWords.map((w: WordType) => w._id);

    // Fetch existing hooks for these words
    const existingHooks = await MemoryHook.find({
      userId: user._id,
      wordId: { $in: weakWordIds },
    });

    const existingHookMap = new Map(existingHooks.map(hook => [hook.wordId.toString(), hook]));

    // Build card data: merge word + hook info
    const cards: MemoryHookCardData[] = weakWords.map((w: WordType) => {
      const hook = existingHookMap.get(w._id!.toString());
      return {
        wordId: w._id!.toString(),
        word: w.word,
        definition: w.definition,
        phoneticNotation: w.phoneticNotation || '',
        language: w.language,
        easeFactor: w.easeFactor,
        phoneticKeyword: hook?.phoneticKeyword || '',
        bridgeSentence: hook?.bridgeSentence || '',
      };
    });

    return NextResponse.json({ error: null, data: cards });
  } catch {
    return NextResponse.json({ error: 'Error getting memory hooks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { wordIds, learningLanguage, userLanguage } = await req.json();

    if (!wordIds || !Array.isArray(wordIds) || wordIds.length === 0) {
      return NextResponse.json({ error: 'wordIds array is required' }, { status: 400 });
    }

    if (!learningLanguage || !userLanguage) {
      return NextResponse.json(
        { error: 'learningLanguage and userLanguage are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch the words that need hooks (only the user's own words)
    const words = await Word.find({
      _id: { $in: wordIds },
      userId: user._id,
    });

    if (words.length === 0) {
      return NextResponse.json({ error: 'No words found' }, { status: 404 });
    }

    // Check which words already have hooks (skip them)
    const existingHooks = await MemoryHook.find({
      userId: user._id,
      wordId: { $in: wordIds },
    });

    const existingWordIds = new Set(existingHooks.map(h => h.wordId.toString()));
    const wordsNeedingHooks = words.filter(w => !existingWordIds.has(w._id.toString()));

    if (wordsNeedingHooks.length === 0) {
      return NextResponse.json({ error: null, data: existingHooks });
    }

    // Generate hooks via AI
    const generated = await generateMemoryHooks(
      wordsNeedingHooks as unknown as WordType[],
      learningLanguage,
      userLanguage
    );

    // Save generated hooks to DB
    const hookDocs = generated.hooks.map(hook => ({
      userId: user._id,
      wordId: hook.wordId,
      language: learningLanguage,
      phoneticKeyword: hook.phoneticKeyword,
      bridgeSentence: hook.bridgeSentence,
    }));

    const savedHooks = await MemoryHook.insertMany(hookDocs, { ordered: false });

    return NextResponse.json({
      error: null,
      data: [...existingHooks, ...savedHooks],
    });
  } catch {
    return NextResponse.json({ error: 'Error generating memory hooks' }, { status: 500 });
  }
}
