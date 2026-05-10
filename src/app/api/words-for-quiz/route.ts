import User from '@/lib/mongodb/models/user';
import { connectDB } from '@/lib/mongodb/mongodb';
import { NextResponse } from 'next/server';
import Word from '@/lib/mongodb/models/word';
import { Language } from '@/types/Words';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';

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

    // Mix overdue and new words, and randomize within due words
    wordsForQuiz.sort(() => Math.random() - 0.5);

    // Limit to the desired number of words for the quiz
    wordsForQuiz = wordsForQuiz.slice(0, desiredTotalWords);
    if (wordsForQuiz.length < 3) {
      return NextResponse.json(
        {
          error: 'Not enough words to create a quiz',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      wordsForQuiz: wordsForQuiz,
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
