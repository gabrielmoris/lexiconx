/* eslint-disable @typescript-eslint/no-explicit-any */
import User from '@/lib/mongodb/models/user';
import { connectDB } from '@/lib/mongodb/mongodb';
import { NextResponse } from 'next/server';
import Word from '@/lib/mongodb/models/word';
import { Language } from '@/types/Words';
import { generateWords } from '@/lib/ai/generate-words';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextAuthOptions';

const LANGUAGES: Record<string, Language> = {
  en: 'English',
  de: 'Deutsch',
  zh: '中文',
  es: 'Español',
  ru: 'русский',
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { languageToLearn, userLanguage, level } = (await req.json()) as {
      languageToLearn: Language;
      userLanguage: Language;
      level: number;
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

    const wordsfromDatabase = await Word.find({
      userId: user._id,
      language: languageToLearn,
    }).exec();

    const currentUserWords = wordsfromDatabase.map(({ word }) => word);

    // Get user's language progress or default level
    const learningProgressArray = Array.isArray(user.learningProgress)
      ? user.learningProgress.map((lp: any) =>
          typeof lp.toObject === 'function' ? lp.toObject() : lp
        )
      : [];
    const languageProgress = learningProgressArray.find(
      (lp: any) => lp?.language === languageToLearn
    );
    const userLevel = level || languageProgress?.level || 1;

    const fullUserLanguage = LANGUAGES[userLanguage];

    const wordsResponse = await generateWords(
      currentUserWords,
      userLevel,
      languageToLearn,
      fullUserLanguage
    );

    return NextResponse.json({
      success: true,
      ...wordsResponse,
      userLevel,
    });
  } catch (error) {
    console.error('Words generation error:', error);
    return NextResponse.json(
      {
        error: 'An internal server error occurred during words generation.',
      },
      { status: 500 }
    );
  }
}
