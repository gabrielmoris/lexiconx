import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/src/i18n/navigation";
import { useQuiz } from "@/context/QuizContext";
import useLocalStorage from "@/hooks/useLocalStorage";
import { processAnswer } from "@/lib/correctionWords";
import { getWordsByIds, updateWordsData, updateUserData } from "@/lib/apis";
import { saveQuizSession } from "@/lib/apis";
import { Quiz, QuizAnswer } from "@/types/Quiz";
import { User, Word } from "@/types/Words";

export const useQuizManager = (userData: User) => {
	const {
		clientQuizzes: contextQuiz,
		isLoading: isGeneratingQuiz,
		isGeneratingMore,
		isAllQuizzesReady,
		totalExpectedQuizzes,
	} = useQuiz();
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

	const originalEaseFactors = useRef<Map<string, number>>(new Map());
	const quizStartTime = useRef(Date.now());

	// True when user has finished all currently available quizzes but more are still being generated
	const isWaitingForNextQuiz =
		!isAllQuizzesReady &&
		totalExpectedQuizzes > 0 &&
		quizStep >= displayQuiz.length &&
		displayQuiz.length > 0;

	useEffect(() => {
		const start = Date.now();
		setStartingTimer(start);
		quizStartTime.current = start;
	}, []);

	// Load quiz data and prefetch words used in the quiz
	// When new quizzes arrive progressively, we MERGE new words into usedWords
	// instead of replacing, to preserve in-memory SRS updates from answered questions.
	useEffect(() => {
		if (isQuizFinished) return;
		if (!isLocalStorageHydrated) return;

		const quizSource = contextQuiz?.length > 0 ? contextQuiz : storedQuizzesData.quizzes;
		if (quizSource?.length > 0) {
			setDisplayQuiz(quizSource);
			setIsLoading(false);

			const allWordIds = [...new Set(quizSource.flatMap((q) => q.questions.flatMap((question) => question.usedWords)))];
			if (allWordIds.length > 0) {
				getWordsByIds(allWordIds)
					.then(({ data }) => {
						// Build ease map from DB data for NEW words only
						// (preserve original ease factors for words we haven't seen yet)
						data.forEach((word: Word) => {
							if (!originalEaseFactors.current.has(word._id!)) {
								originalEaseFactors.current.set(word._id!, word.easeFactor || 2.5);
							}
						});

						// Merge new words into existing usedWords, preserving SRS updates
						setUsedWords((prev) => {
							const existingMap = new Map(prev.map((w) => [w._id!, w]));
							data.forEach((word: Word) => {
								// Only add words not already in state (preserve in-memory SRS updates)
								if (!existingMap.has(word._id!)) {
									existingMap.set(word._id!, word);
								}
							});
							return Array.from(existingMap.values());
						});
					})
					.catch((error) => {
						console.error("Error prefetching quiz words:", error);
					});
			}
		} else if (!isGeneratingQuiz && !isGeneratingMore) {
			// Only redirect if no quizzes exist AND no generation is in progress
			router.push("/cards");
		}
	}, [contextQuiz, storedQuizzesData.quizzes, isLocalStorageHydrated, router, isGeneratingQuiz, isGeneratingMore]);

	// Effect to handle the end of the quiz
	// Quiz only truly finishes when ALL quizzes are ready AND the user has answered all of them
	useEffect(() => {
		if (isQuizFinished || !session) return;
		const finishQuiz = async () => {
			if (displayQuiz.length && quizStep >= displayQuiz.length && userData) {
				// If not all quizzes are ready yet, we're in waiting state (not finished)
				if (!isAllQuizzesReady) {
					return;
				}

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

					// Save quiz session for analytics
					const wordsMasteredCount = usedWords.filter((word) => word.repetitions > 0).length;
					saveQuizSession({
						language: displayQuiz[0].language,
						totalQuestions: score.success + score.errors,
						correctAnswers: score.success,
						wordsMastered: wordsMasteredCount,
						duration: actualTimeEnd - quizStartTime.current,
					}).catch((err) => console.error("Error saving quiz session:", err));

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
	}, [quizStep, displayQuiz, userData, session, usedWords, score, startingTimer, deleteValue, isQuizFinished, isAllQuizzesReady]);

	const handleAnswerClick = useCallback(
		(option: QuizAnswer) => {
			if (!session) return;
			const currentQuiz = displayQuiz[quizStep];
			if (!currentQuiz) return;
			const currentQuestion = currentQuiz.questions[questionStep];
			if (!currentQuestion) return;

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

				for (const wordId of currentQuestion.usedWords) {
					const word = wordMap.get(wordId);
					if (!word) continue; 

					const originalEase = originalEaseFactors.current.get(wordId);

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
		const allWordIds = [...new Set(displayQuiz.flatMap((q) => q.questions.flatMap((question) => question.usedWords)))];
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
		isWaitingForNextQuiz,
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
