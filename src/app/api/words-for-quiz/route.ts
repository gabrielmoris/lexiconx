import User from '@/lib/mongodb/models/user';
import { connectDB } from '@/lib/mongodb/mongodb';
import { NextResponse } from 'next/server';
import Word from '@/lib/mongodb/models/word';
import { Language } from '@/types/Words';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';
import { getWordCategory } from '@/lib/correctionWords';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { languageToLearn, userLanguage } = (await req.json()) as {
      languageToLearn: Language;
      userLanguage: Language;
    };

    if (!languageToLearn || !userLanguage) {
      return NextResponse.json(
        {
          error: 'Target language and user language are required',
        },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    const desiredTotalWords = 10;

    // Target allocation: ~30% new, ~40% learning, ~30% mastered
    const targetNew = 3;
    const targetLearning = 4;
    const targetMastered = 3;

    // Fetch new words (never reviewed)
    const newWords = await Word.find({
      userId: user._id,
      language: languageToLearn,
      repetitions: 0,
      lastReviewed: null,
    })
      .sort({ createdAt: 1 })
      .limit(targetNew)
      .exec();

    // Fetch learning words (reviewed but interval <= 21 days)
    const learningWords = await Word.find({
      userId: user._id,
      language: languageToLearn,
      repetitions: { $gt: 0 },
      nextReview: { $lte: now },
      interval: { $lte: 21 },
    })
      .sort({ nextReview: 1 })
      .limit(targetLearning)
      .exec();

    // Fetch mastered words (interval > 21 days, due for review)
    const masteredWords = await Word.find({
      userId: user._id,
      language: languageToLearn,
      nextReview: { $lte: now },
      interval: { $gt: 21 },
    })
      .sort({ nextReview: 1 })
      .limit(targetMastered)
      .exec();

    // Build category buckets
    const buckets: Record<string, typeof newWords> = {
      new: newWords,
      learning: learningWords,
      mastered: masteredWords,
    };

    const targets: Record<string, number> = {
      new: targetNew,
      learning: targetLearning,
      mastered: targetMastered,
    };

    // Redistribute unfilled slots to categories that have extra words
    const unfilled = Object.entries(buckets)
      .filter(([key, words]) => words.length < targets[key])
      .map(([key, words]) => ({ category: key, shortfall: targets[key] - words.length }))
      .reduce((sum, u) => sum + u.shortfall, 0);

    if (unfilled > 0) {
      // Fetch additional overdue words to fill the gap
      const alreadyFetchedIds = [...newWords, ...learningWords, ...masteredWords].map(w => w._id);

      const extraWords = await Word.find({
        userId: user._id,
        language: languageToLearn,
        nextReview: { $lte: now },
        _id: { $nin: alreadyFetchedIds },
      })
        .sort({ nextReview: 1 })
        .limit(unfilled)
        .exec();

      // Distribute extras into the most undersized bucket first
      for (const extraWord of extraWords) {
        const category = getWordCategory(extraWord);
        buckets[category].push(extraWord);
      }
    }

    // Interleave: take one from each category in rotation to maximize variety
    const interleaved: typeof newWords = [];
    const categoryOrder = ['new', 'learning', 'mastered'];
    const indices: Record<string, number> = { new: 0, learning: 0, mastered: 0 };

    while (interleaved.length < desiredTotalWords) {
      let addedThisRound = false;
      for (const cat of categoryOrder) {
        if (interleaved.length >= desiredTotalWords) break;
        if (indices[cat] < buckets[cat].length) {
          interleaved.push(buckets[cat][indices[cat]]);
          indices[cat]++;
          addedThisRound = true;
        }
      }
      if (!addedThisRound) break; // All buckets exhausted
    }

    if (interleaved.length < 3) {
      return NextResponse.json(
        {
          error: 'Not enough words to create a quiz',
        },
        { status: 404 }
      );
    }

    // Compute final composition counts
    const composition = {
      new: interleaved.filter(w => getWordCategory(w) === 'new').length,
      learning: interleaved.filter(w => getWordCategory(w) === 'learning').length,
      mastered: interleaved.filter(w => getWordCategory(w) === 'mastered').length,
    };

    return NextResponse.json({
      success: true,
      wordsForQuiz: interleaved,
      composition,
    });
  } catch (error) {
    console.error('Error searching words for the quiz:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
