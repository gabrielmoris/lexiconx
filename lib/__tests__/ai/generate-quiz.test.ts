import { generateQuizWithWords } from "@/lib/ai/generate-quiz";
import { Word, Language } from "@/types/Words";
import { vi } from "vitest";

const mockGenerateContent = vi.fn();

vi.mock("@/lib/ai/client", () => ({
	createAIClient: () => ({
		generateContent: mockGenerateContent,
	}),
}));

// Mock the model env var
const originalEnv = process.env;
beforeAll(() => {
	process.env = { ...originalEnv, AI_MODEL: "test-model" };
});
afterAll(() => {
	process.env = originalEnv;
});
beforeEach(() => {
	mockGenerateContent.mockReset();
});

const makeWord = (id: string): Word => ({
	_id: id,
	userId: "user1",
	word: "test",
	definition: "test definition",
	phoneticNotation: "tɛst",
	language: "English" as Language,
	tags: [],
	lastReviewed: new Date().toISOString(),
	nextReview: new Date().toISOString(),
	interval: 1,
	repetitions: 1,
	easeFactor: 2.5,
});

const makeValidQuizResponse = () => ({
	quizzes: [
		{
			sentence: "The cat eats fish.",
			phoneticNotation: "ðə kæt iːts fɪʃ",
			translation: "El gato come pescado.",
			language: "English",
			questions: [
				{
					question: "What does 'cat' mean?",
					usedWords: ["word1"],
					options: [
						{ answer: "Gato", isCorrect: true, translation: "cat", phoneticNotation: "" },
						{ answer: "Perro", isCorrect: false, translation: "dog", phoneticNotation: "" },
						{ answer: "Pájaro", isCorrect: false, translation: "bird", phoneticNotation: "" },
						{ answer: "Pez", isCorrect: false, translation: "fish", phoneticNotation: "" },
					],
				},
				{
					question: "What does 'fish' mean?",
					usedWords: ["word2"],
					options: [
						{ answer: "Pez", isCorrect: true, translation: "fish", phoneticNotation: "" },
						{ answer: "Carne", isCorrect: false, translation: "meat", phoneticNotation: "" },
						{ answer: "Leche", isCorrect: false, translation: "milk", phoneticNotation: "" },
						{ answer: "Agua", isCorrect: false, translation: "water", phoneticNotation: "" },
					],
				},
				{
					question: "What does 'eats' mean?",
					usedWords: ["word3"],
					options: [
						{ answer: "Come", isCorrect: true, translation: "eats", phoneticNotation: "" },
						{ answer: "Bebe", isCorrect: false, translation: "drinks", phoneticNotation: "" },
						{ answer: "Duerme", isCorrect: false, translation: "sleeps", phoneticNotation: "" },
						{ answer: "Corre", isCorrect: false, translation: "runs", phoneticNotation: "" },
					],
				},
			],
		},
	],
});

describe("generateQuizWithWords - input validation", () => {
	const words = [makeWord("1"), makeWord("2"), makeWord("3")];

	it("throws if fewer than 3 words provided", async () => {
		await expect(
			generateQuizWithWords([makeWord("1"), makeWord("2")], 10, "English", "Español"),
		).rejects.toThrow("At least 3 words are required");
	});

	it("throws if level is below 1", async () => {
		await expect(
			generateQuizWithWords(words, 0, "English", "Español"),
		).rejects.toThrow("Level must be between 1 and 100");
	});

	it("throws if level is above 100", async () => {
		await expect(
			generateQuizWithWords(words, 101, "English", "Español"),
		).rejects.toThrow("Level must be between 1 and 100");
	});

	it("throws if empty words array", async () => {
		await expect(
			generateQuizWithWords([], 10, "English", "Español"),
		).rejects.toThrow("At least 3 words are required");
	});

	it("throws for unsupported learning language", async () => {
		await expect(
			generateQuizWithWords(words, 10, "Klingon" as Language, "Español"),
		).rejects.toThrow("Unsupported user language");
	});
});

describe("generateQuizWithWords - response validation", () => {
	const words = [makeWord("1"), makeWord("2"), makeWord("3")];

	it("throws if response missing quizzes array", async () => {
		mockGenerateContent.mockResolvedValue({
			text: JSON.stringify({ data: [] }),
		});

		await expect(
			generateQuizWithWords(words, 10, "English", "Español"),
		).rejects.toThrow("Response missing quizzes array");
	});

	it("throws if quiz missing required fields", async () => {
		mockGenerateContent.mockResolvedValue({
			text: JSON.stringify({
				quizzes: [{ sentence: "test" }], // missing translation, questions, phoneticNotation
			}),
		});

		await expect(
			generateQuizWithWords(words, 10, "English", "Español"),
		).rejects.toThrow("missing required fields");
	});

	it("throws if quiz has fewer than 3 questions", async () => {
		mockGenerateContent.mockResolvedValue({
			text: JSON.stringify({
				quizzes: [
					{
						sentence: "Test",
						translation: "Prueba",
						phoneticNotation: "test",
						questions: [
							{
								question: "Q1?",
								usedWords: ["w1"],
								options: [
									{ answer: "A", isCorrect: true },
									{ answer: "B", isCorrect: false },
									{ answer: "C", isCorrect: false },
									{ answer: "D", isCorrect: false },
								],
							},
							{
								question: "Q2?",
								usedWords: ["w2"],
								options: [
									{ answer: "A", isCorrect: true },
									{ answer: "B", isCorrect: false },
									{ answer: "C", isCorrect: false },
									{ answer: "D", isCorrect: false },
								],
							},
						], // only 2 questions
					},
				],
			}),
		});

		await expect(
			generateQuizWithWords(words, 10, "English", "Español"),
		).rejects.toThrow("must have between 3 and 5 questions");
	});

	it("throws if question has fewer than 4 options", async () => {
		const response = makeValidQuizResponse();
		response.quizzes[0].questions[0].options = response.quizzes[0].questions[0].options.slice(0, 3);

		mockGenerateContent.mockResolvedValue({
			text: JSON.stringify(response),
		});

		await expect(
			generateQuizWithWords(words, 10, "English", "Español"),
		).rejects.toThrow("invalid number of answer choices");
	});

	it("throws if question has no usedWords array", async () => {
		const response = makeValidQuizResponse();
		delete (response.quizzes[0].questions[0] as { usedWords?: string[] }).usedWords;

		mockGenerateContent.mockResolvedValue({
			text: JSON.stringify(response),
		});

		await expect(
			generateQuizWithWords(words, 10, "English", "Español"),
		).rejects.toThrow("must have a non-empty 'usedWords' array");
	});

	it("throws if question has empty usedWords array", async () => {
		const response = makeValidQuizResponse();
		response.quizzes[0].questions[0].usedWords = [];

		mockGenerateContent.mockResolvedValue({
			text: JSON.stringify(response),
		});

		await expect(
			generateQuizWithWords(words, 10, "English", "Español"),
		).rejects.toThrow("must have a non-empty 'usedWords' array");
	});

	it("throws if question has multiple correct answers", async () => {
		const response = makeValidQuizResponse();
		response.quizzes[0].questions[0].options[1].isCorrect = true;

		mockGenerateContent.mockResolvedValue({
			text: JSON.stringify(response),
		});

		await expect(
			generateQuizWithWords(words, 10, "English", "Español"),
		).rejects.toThrow("must have exactly one correct answer");
	});

	it("throws if question has no correct answer", async () => {
		const response = makeValidQuizResponse();
		response.quizzes[0].questions[0].options.forEach((o: { isCorrect: boolean }) => (o.isCorrect = false));

		mockGenerateContent.mockResolvedValue({
			text: JSON.stringify(response),
		});

		await expect(
			generateQuizWithWords(words, 10, "English", "Español"),
		).rejects.toThrow("must have exactly one correct answer");
	});

	it("throws on invalid JSON response", async () => {
		mockGenerateContent.mockResolvedValue({
			text: "not valid json{{{",
		});

		await expect(
			generateQuizWithWords(words, 10, "English", "Español"),
		).rejects.toThrow("Failed to parse quiz response");
	});

	it("returns valid quiz response when all validations pass", async () => {
		const response = makeValidQuizResponse();

		mockGenerateContent.mockResolvedValue({
			text: JSON.stringify(response),
		});

		const result = await generateQuizWithWords(words, 10, "English", "Español");

		expect(result.quizzes).toHaveLength(1);
		expect(result.quizzes[0].questions).toHaveLength(3);
		expect(result.quizzes[0].questions[0].usedWords).toEqual(["word1"]);
	});
});
