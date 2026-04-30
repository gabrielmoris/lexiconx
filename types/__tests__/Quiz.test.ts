import { getQuizUsedWords, Quiz, QuizQuestion } from "@/types/Quiz";
import { Language } from "@/types/Words";

const makeQuestion = (usedWords: string[]): QuizQuestion => ({
	question: "Test question?",
	options: [
		{ answer: "A", isCorrect: true },
		{ answer: "B", isCorrect: false },
		{ answer: "C", isCorrect: false },
		{ answer: "D", isCorrect: false },
	],
	usedWords,
});

const makeQuiz = (questions: QuizQuestion[], language: Language = "English"): Quiz => ({
	sentence: "Test sentence",
	language,
	phoneticNotation: "Test phonetic",
	translation: "Test translation",
	questions,
});

describe("getQuizUsedWords", () => {
	it("returns empty array for quiz with no questions", () => {
		const quiz = makeQuiz([]);
		expect(getQuizUsedWords(quiz)).toEqual([]);
	});

	it("returns word IDs from a single question", () => {
		const quiz = makeQuiz([makeQuestion(["id1", "id2"])]);
		expect(getQuizUsedWords(quiz)).toEqual(["id1", "id2"]);
	});

	it("deduplicates word IDs across questions", () => {
		const quiz = makeQuiz([
			makeQuestion(["id1", "id2"]),
			makeQuestion(["id2", "id3"]),
		]);
		expect(getQuizUsedWords(quiz)).toEqual(["id1", "id2", "id3"]);
	});

	it("deduplicates word IDs within a single question", () => {
		const quiz = makeQuiz([makeQuestion(["id1", "id1"])]);
		expect(getQuizUsedWords(quiz)).toEqual(["id1"]);
	});

	it("returns all unique IDs from many questions", () => {
		const quiz = makeQuiz([
			makeQuestion(["a"]),
			makeQuestion(["b"]),
			makeQuestion(["c"]),
			makeQuestion(["d"]),
		]);
		expect(getQuizUsedWords(quiz)).toEqual(["a", "b", "c", "d"]);
	});

	it("handles question with empty usedWords", () => {
		const quiz = makeQuiz([makeQuestion([])]);
		expect(getQuizUsedWords(quiz)).toEqual([]);
	});

	it("mixes questions with and without usedWords", () => {
		const quiz = makeQuiz([
			makeQuestion(["id1"]),
			makeQuestion([]),
			makeQuestion(["id2"]),
		]);
		expect(getQuizUsedWords(quiz)).toEqual(["id1", "id2"]);
	});

	it("preserves insertion order for first occurrence", () => {
		const quiz = makeQuiz([
			makeQuestion(["z", "a", "m"]),
			makeQuestion(["m", "b"]),
		]);
		expect(getQuizUsedWords(quiz)).toEqual(["z", "a", "m", "b"]);
	});
});
