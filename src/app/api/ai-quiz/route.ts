/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateQuizWithWords } from '@/lib/ai/generate-quiz';
import User from '@/lib/mongodb/models/user';
import { connectDB } from '@/lib/mongodb/mongodb';
import { NextResponse } from 'next/server';
import { Language, Word } from '@/types/Words';
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

    const { languageToLearn, userLanguage, level, wordsForQuiz } = (await req.json()) as {
      languageToLearn: Language;
      userLanguage: Language;
      level: number;
      wordsForQuiz: Word[];
    };

    if (!languageToLearn || !userLanguage || !wordsForQuiz) {
      return NextResponse.json(
        {
          error: 'Target language, words for quiz and user language are required',
        },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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

    const quizResponse = await generateQuizWithWords(
      wordsForQuiz,
      userLevel,
      languageToLearn,
      fullUserLanguage
    );

    return NextResponse.json({
      success: true,
      ...quizResponse,
      userLevel,
      totalWords: wordsForQuiz.length,
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
