import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/src/i18n/navigation";
import { useQuiz } from "@/context/QuizContext";
import useLocalStorage from "@/hooks/useLocalStorage";
import { processAnswer } from "@/lib/correctionWords";
import { getWordsByIds, updateWordsData, updateUserData } from "@/lib/apis";
import { Quiz, QuizAnswer } from "@/types/Quiz";
import { User, Word } from "@/types/Words";

export const useQuizManager = (userData: User) => {
	const { clientQuizzes: contextQuiz, isLoading: isGeneratingQuiz } = useQuiz();
	const { storedValue: storedQuizzesData, isHydrated: isLocalStorageHydrated, deleteValue } = useLocalStorage("quizes", { quizzes: [] });
	const { data: session } = useSession();
	const router = useRouter();

	const [displayQuiz, setDisplayQuiz] = useState<Quiz[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [quizStep, setQuizStep] = useState(0);
	const [questionStep, setQuestionStep] = useState(0);
	const [feedback, setFeedback] = useState({ correct: "", wrong: "" });
	const [usedWords, setUsedWords] = useState<Word[]>([]);
	const [score, setScore] = useState({ errors: 0, success: 0 });
	const [isQuizFinished, setIsQuizFinished] = useState(false);
	const [startingTimer, setStartingTimer] = useState<number>();

	/**
	 * Stores the original easeFactor for each word at the start of the quiz.
	 * Used to enforce per-quiz caps (MAX_EASE_DECREASE_PER_QUIZ).
	 */
	const originalEaseFactors = useRef<Map<string, number>>(new Map());

	useEffect(() => {
		const start = Date.now();
		setStartingTimer(start);
	}, []);

	// Load quiz data and prefetch all words used in the quiz
	useEffect(() => {
		if (!isLocalStorageHydrated) return;

		const quizSource = contextQuiz?.length > 0 ? contextQuiz : storedQuizzesData.quizzes;
		if (quizSource?.length > 0) {
			setDisplayQuiz(quizSource);
			setIsLoading(false);

			// Prefetch all words used in the quiz
			const allWordIds = [...new Set(quizSource.flatMap((q) => q.usedWords))];
			if (allWordIds.length > 0) {
				getWordsByIds(allWordIds)
					.then(({ data }) => {
						// Capture original easeFactors for per-quiz caps
						const easeMap = new Map<string, number>();
						data.forEach((word: Word) => {
							easeMap.set(word._id!, word.easeFactor || 2.5);
						});
						originalEaseFactors.current = easeMap;

						setUsedWords(data);
					})
					.catch((error) => {
						console.error("Error prefetching quiz words:", error);
					});
			}
		} else {
			router.push("/cards");
		}
	}, [contextQuiz, storedQuizzesData.quizzes, isLocalStorageHydrated, router]);

	// Effect to handle the end of the quiz
	useEffect(() => {
		if (isQuizFinished || !session) return;
		const finishQuiz = async () => {
			if (displayQuiz.length && quizStep >= displayQuiz.length && userData) {
				const actualTimeEnd = Date.now();
				try {
					await updateWordsData(usedWords);
					const updatedUserData: User = JSON.parse(JSON.stringify(userData));

					const isSucceed = score.success / 2 > score.errors;
					const learningProgress = updatedUserData?.learningProgress.find((lp) => lp.language === displayQuiz[0].language);
					if (!learningProgress) throw new Error("Learning progress not found");
					learningProgress.level = isSucceed ? learningProgress.level + 1 : learningProgress.level > 0 ? learningProgress.level - 1 : 0;
					learningProgress.wordsMastered += usedWords.filter((word) => word.repetitions > 0).length;
					learningProgress.currentStreak = isSucceed ? learningProgress.currentStreak + 1 : 0;
					learningProgress.lastSessionDate = new Date();
					if (!startingTimer) throw new Error("Starting timer not found");
					learningProgress.timeSpent += Math.round(actualTimeEnd - startingTimer); // Saved in miliseconds

					await updateUserData(updatedUserData);
					if (isSucceed) {
						setIsQuizFinished(true);
						deleteValue(); 
					} else {
						setIsQuizFinished(true);
					}
				} catch (error) {
					console.error("Error finishing quiz:", error);
					// TODO: Show a toast message to the user
				}
			}
		};
		finishQuiz();
	}, [quizStep, displayQuiz, userData, session, usedWords, score, startingTimer, deleteValue, isQuizFinished]);

	const handleAnswerClick = useCallback(
		(option: QuizAnswer) => {
			if (!session) return;
			const currentQuiz = displayQuiz[quizStep];
			if (!currentQuiz) return;

			// Score and feedback
			if (option.isCorrect) {
				setScore((prev) => ({ ...prev, success: prev.success + 1 }));
				setFeedback({ correct: option.answer, wrong: "" });
			} else {
				setScore((prev) => ({ ...prev, errors: prev.errors + 1 }));
				setFeedback({ correct: "", wrong: option.answer });
			}

			// Process each word used in this question against in-memory state
			setUsedWords((prev) => {
				const wordMap = new Map(prev.map((w) => [w._id!, w]));

				for (const wordId of currentQuiz.usedWords) {
					const word = wordMap.get(wordId);
					if (!word) continue; // Skip if word not found (shouldn't happen after prefetch)

					// Get original easeFactor for per-quiz cap
					const originalEase = originalEaseFactors.current.get(wordId);

					// Apply SM-2 processing using the in-memory word state
					const updatedWord = processAnswer(word, option.isCorrect, originalEase);
					wordMap.set(wordId, updatedWord);
				}

				return Array.from(wordMap.values());
			});

			// Advance to the next question/step
			setTimeout(() => {
				setFeedback({ correct: "", wrong: "" });
				if (questionStep < currentQuiz.questions.length - 1) {
					setQuestionStep((prev) => prev + 1);
				} else {
					setQuizStep((prev) => prev + 1);
					setQuestionStep(0);
				}
			}, 500);
		},
		[displayQuiz, quizStep, questionStep, session]
	);

	const restartQuiz = () => {
		setQuizStep(0);
		setQuestionStep(0);
		setIsQuizFinished(false);
		setScore({ errors: 0, success: 0 });
		// Re-prefetch words to reset in-memory state
		const allWordIds = [...new Set(displayQuiz.flatMap((q) => q.usedWords))];
		if (allWordIds.length > 0) {
			getWordsByIds(allWordIds)
				.then(({ data }) => {
					const easeMap = new Map<string, number>();
					data.forEach((word: Word) => {
						easeMap.set(word._id!, word.easeFactor || 2.5);
					});
					originalEaseFactors.current = easeMap;
					setUsedWords(data);
				})
				.catch((error) => {
					console.error("Error re-fetching quiz words:", error);
				});
		}
	};

	const currentQuizItem = displayQuiz[quizStep];
	const currentQuestion = currentQuizItem?.questions[questionStep];

	return {
		isLoading: isLoading || isGeneratingQuiz,
		isQuizFinished,
		score,
		currentQuizItem,
		currentQuestion,
		feedback,
		quizProgress: { current: quizStep + 1, total: displayQuiz.length },
		questionProgress: { current: questionStep + 1, total: currentQuizItem?.questions.length || 0 },
		handleAnswerClick,
		restartQuiz,
	};
};
