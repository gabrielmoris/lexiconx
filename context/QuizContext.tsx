'use client';
import { Quiz } from '@/types/Quiz';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useToastContext } from './ToastContext';
import { useSession } from 'next-auth/react';
import { useLanguage } from './LanguageToLearnContext';
import { useLocale, useTranslations } from 'next-intl';
import useLocalStorage from '@/hooks/useLocalStorage';
import { getUserData, getWordsForQuiz, quizGeneration } from '@/lib/apis';
import { Language, User, Word } from '@/types/Words';

interface QuizContextType {
	clientQuizzes: Quiz[];
	setClientQuizzes: (quizes: Quiz[]) => void;
	isLoading: boolean;
	isGeneratingMore: boolean;
	totalExpectedQuizzes: number;
	isAllQuizzesReady: boolean;
	wordsForQuiz: Word[];
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
	generateQuiz: async () => ({ success: false }),
});

/**
 * Determines the number of quizzes based on word count.
 * >= 9 words -> 3 quizzes, >= 6 words -> 2 quizzes, >= 3 words -> 1 quiz
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

	// Ref to track if background generation is still running
	const isGeneratingRef = useRef(false);

	const { status } = useSession();
	const { selectedLanguage } = useLanguage();
	const { showToast } = useToastContext();
	const t = useTranslations('ai-quiz-generator');
	const currentLocale = useLocale();
	const [userData, setUserData] = useState<User>();

	// Fetch user data
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

				// Step 1: Fetch words for quiz
				const { wordsForQuiz: fetchedWords } = await getWordsForQuiz(
					selectedLanguage.language,
					currentLocale as Language
				);

				if (fetchedWords.length === 0) {
					setIsLoading(false);
					return { success: false };
				}

				setWordsForQuiz(fetchedWords);

				// Step 2: Determine quiz count from word count
				const quizCount = determineQuizCount(fetchedWords.length);
				if (quizCount === 0) {
					setIsLoading(false);
					return { success: false };
				}

				setTotalExpectedQuizzes(quizCount);

				// We pass the FULL word pool to each quiz generation call with quizCount=1.
				// The AI naturally selects different subsets for each quiz across
				// separate calls, avoiding the partitioning bug where splitting
				// words into groups could create partitions with <3 words.

				// Step 3: Generate quiz 1 immediately
				const data = await quizGeneration(
					selectedLanguage.language,
					currentLocale as Language,
					learningProgress!.level,
					fetchedWords,
					1 // quizCount=1 per call
				);

				const quiz1 = data.quizzes[0];
				setClientQuizzes([quiz1]);
				setIsLoading(false);

				// Step 4: If more quizzes expected, generate them in background sequentially
				if (quizCount > 1) {
					setIsGeneratingMore(true);
					isGeneratingRef.current = true;

					const backgroundQuizzes: Quiz[] = [quiz1];

					for (let i = 1; i < quizCount; i++) {
						if (!isGeneratingRef.current) break;

						try {
							const result = await quizGeneration(
								selectedLanguage.language,
								currentLocale as Language,
								learningProgress!.level,
								fetchedWords,
								1
							);

							if (result.quizzes[0]) {
								backgroundQuizzes.push(result.quizzes[0]);
								setClientQuizzes([...backgroundQuizzes]);
							}
						} catch (error) {
							console.error(`Error generating quiz ${i + 1}:`, error);
							// Continue generating remaining quizzes even if one fails
						}
					}

					setIsGeneratingMore(false);
					isGeneratingRef.current = false;

					// Step 5: Save to localStorage only when ALL quizzes are generated
					setIsAllQuizzesReady(true);
					setStoredQuizzes({ quizzes: backgroundQuizzes });
				} else {
					// Only 1 quiz - it's already ready
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status, selectedLanguage, userData]);

	// Cleanup: cancel background generation on unmount
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
