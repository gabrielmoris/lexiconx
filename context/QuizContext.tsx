'use client';
import { Quiz, QuizComposition } from '@/types/Quiz';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useToastContext } from './ToastContext';
import { useSession } from 'next-auth/react';
import { useLanguage } from './LanguageToLearnContext';
import { useLocale, useTranslations } from 'next-intl';
import useLocalStorage from '@/hooks/useLocalStorage';
import { getUserData, getWordsForQuiz, quizGeneration } from '@/lib/apis';
import { Language, User, Word } from '@/types/Words';
import { sleep } from '@/lib/helpers';

interface QuizContextType {
  clientQuizzes: Quiz[];
  setClientQuizzes: (quizes: Quiz[]) => void;
  isLoading: boolean;
  isGeneratingMore: boolean;
  totalExpectedQuizzes: number;
  isAllQuizzesReady: boolean;
  wordsForQuiz: Word[];
  composition: QuizComposition;
  generateQuiz: () => Promise<{ success: boolean } | undefined>;
}

const QuizContext = createContext<QuizContextType>({
  clientQuizzes: [],
  setClientQuizzes: () => {},
  isLoading: false,
  isGeneratingMore: false,
  totalExpectedQuizzes: 0,
  isAllQuizzesReady: false,
  wordsForQuiz: [],
  composition: { new: 0, learning: 0, mastered: 0 },
  generateQuiz: async () => ({ success: false }),
});

/**
 * Splits an array of words into roughly equal chunks for per-quiz generation.
 * Each quiz receives its own word subset so the AI uses ALL provided words
 * instead of choosing a subset from the full list.
 */
function splitWordsForQuizzes(words: Word[], quizCount: number): Word[][] {
  const chunks: Word[][] = [];
  const base = Math.floor(words.length / quizCount);
  const remainder = words.length % quizCount;
  let offset = 0;
  for (let i = 0; i < quizCount; i++) {
    const size = base + (i < remainder ? 1 : 0);
    chunks.push(words.slice(offset, offset + size));
    offset += size;
  }
  return chunks;
}

/**
 * Determines the number of quizzes based on word count.
 */
function determineQuizCount(wordCount: number): number {
  if (wordCount >= 9) return 3;
  if (wordCount >= 6) return 2;
  if (wordCount >= 3) return 1;
  return 0;
}

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const { setValue: setStoredQuizzes, storedValue: storedQuizzesData } = useLocalStorage<{
    quizzes: Quiz[];
  }>('quizes', { quizzes: [] });

  const [clientQuizzes, setClientQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [totalExpectedQuizzes, setTotalExpectedQuizzes] = useState(0);
  const [isAllQuizzesReady, setIsAllQuizzesReady] = useState(false);
  const [wordsForQuiz, setWordsForQuiz] = useState<Word[]>([]);
  const [composition, setComposition] = useState<QuizComposition>({
    new: 0,
    learning: 0,
    mastered: 0,
  });

  const isGeneratingRef = useRef(false);

  const selectedLanguageRef = useRef<Language | null>(null);
  const currentLocaleRef = useRef<string>('en');
  const levelRef = useRef<number>(1);
  const fetchedWordsRef = useRef<Word[]>([]);
  const wordChunksRef = useRef<Word[][]>([]);
  const totalExpectedRef = useRef<number>(0);

  const { status } = useSession();
  const { selectedLanguage } = useLanguage();
  const { showToast } = useToastContext();
  const t = useTranslations('ai-quiz-generator');
  const currentLocale = useLocale();
  const [userData, setUserData] = useState<User>();

  useEffect(() => {
    selectedLanguageRef.current = selectedLanguage.language;
    currentLocaleRef.current = currentLocale;
  }, [selectedLanguage, currentLocale]);

  useEffect(() => {
    const fetchUser = async () => {
      if (status === 'authenticated') {
        try {
          const { data } = await getUserData();
          setUserData(data);
        } catch (e) {
          console.error(e);
          showToast({ message: t('error-getting-user'), variant: 'error', duration: 3000 });
        }
      }
    };
    fetchUser();
  }, [status, showToast, t]);

  /**
   * Generates remaining quizzes in the background (fire-and-forget).
   * Adapts totalExpectedQuizzes when a generation fails so the
   * finish screen triggers correctly with partial quiz sets.
   */
  const generateRemainingQuizzes = useCallback(
    async (quiz1: Quiz, quizCount: number, wordChunks: Word[][]) => {
      const backgroundQuizzes: Quiz[] = [quiz1];
      let failedCount = 0;

      for (let i = 1; i < quizCount; i++) {
        if (!isGeneratingRef.current) break;

        try {
          await sleep(3000);
          const result = await quizGeneration(
            selectedLanguageRef.current!,
            currentLocaleRef.current as Language,
            levelRef.current,
            wordChunks[i],
            1
          );

          if (result.quizzes[0]) {
            backgroundQuizzes.push(result.quizzes[0]);
            setClientQuizzes([...backgroundQuizzes]);
          } else {
            failedCount++;
          }
        } catch (error) {
          console.error('Error generating quiz ' + (i + 1) + ':', error);
          failedCount++;
          // Adjust expected count so the finish screen triggers correctly
          const newExpected = totalExpectedRef.current - failedCount;
          setTotalExpectedQuizzes(newExpected);
        }
      }

      if (failedCount > 0) {
        const finalExpected = backgroundQuizzes.length;
        setTotalExpectedQuizzes(finalExpected);
        const message =
          failedCount === 1
            ? t('quiz-generation-partial-failure')
            : t('quiz-generation-partial-failure-plural', {
                count: failedCount,
              });
        showToast({
          message,
          variant: 'warning',
          duration: 4000,
        });
      }

      setIsGeneratingMore(false);
      isGeneratingRef.current = false;

      setIsAllQuizzesReady(true);
      setStoredQuizzes({ quizzes: backgroundQuizzes });
    },
    [setStoredQuizzes]
  );

  const generateQuiz = useCallback(async () => {
    if (status === 'authenticated') {
      setIsLoading(true);
      setIsAllQuizzesReady(false);
      setIsGeneratingMore(false);
      setTotalExpectedQuizzes(0);

      const learningProgress = userData?.learningProgress?.find(
        lp => lp.language === selectedLanguage.language
      );

      try {
        if (!learningProgress) {
          throw new Error('Learning progress not found');
        }

        // Fetch words for quiz
        const { wordsForQuiz: fetchedWords, composition: fetchedComposition } =
          await getWordsForQuiz(selectedLanguage.language, currentLocale as Language);

        if (fetchedWords.length === 0) {
          setIsLoading(false);
          return { success: false };
        }

        setWordsForQuiz(fetchedWords);
        if (fetchedComposition) {
          setComposition(fetchedComposition);
        }

        // Determine quiz count from word count
        const quizCount = determineQuizCount(fetchedWords.length);
        if (quizCount === 0) {
          setIsLoading(false);
          return { success: false };
        }

        setTotalExpectedQuizzes(quizCount);
        totalExpectedRef.current = quizCount;

        // Split words into per-quiz chunks so each quiz uses a dedicated word set
        const wordChunks = splitWordsForQuizzes(fetchedWords, quizCount);

        // Store values in refs for background generation
        levelRef.current = learningProgress!.level;
        fetchedWordsRef.current = fetchedWords;
        wordChunksRef.current = wordChunks;

        // Generate quiz 1 immediately with its dedicated word chunk
        const data = await quizGeneration(
          selectedLanguage.language,
          currentLocale as Language,
          learningProgress!.level,
          wordChunks[0],
          1
        );

        const quiz1 = data.quizzes[0];
        setClientQuizzes([quiz1]);
        setIsLoading(false);

        // If more quizzes expected, fire-and-forget background generation
        if (quizCount > 1) {
          setIsGeneratingMore(true);
          isGeneratingRef.current = true;

          generateRemainingQuizzes(quiz1, quizCount, wordChunks);
        } else {
          setIsAllQuizzesReady(true);
          setStoredQuizzes({ quizzes: [quiz1] });
        }

        return { success: true };
      } catch (error) {
        console.error('Error generating quiz:', error);
        showToast({
          message: t('error-generating quiz'),
          variant: 'error',
          duration: 3000,
        });
        setIsLoading(false);
        setIsGeneratingMore(false);
        return { success: false };
      }
    } else {
      showToast({
        message: t('error-generating quiz'),
        variant: 'error',
        duration: 3000,
      });
      return { success: false };
    }
  }, [status, selectedLanguage, userData, generateRemainingQuizzes]);

  useEffect(() => {
    return () => {
      isGeneratingRef.current = false;
    };
  }, []);

  return (
    <QuizContext.Provider
      value={{
        clientQuizzes,
        setClientQuizzes,
        isLoading,
        isGeneratingMore,
        totalExpectedQuizzes,
        isAllQuizzesReady,
        wordsForQuiz,
        composition,
        generateQuiz,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
