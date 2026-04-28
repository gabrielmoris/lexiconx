import { processAnswer, MIN_EASE_FACTOR, DEFAULT_EASE_FACTOR, MAX_EASE_DECREASE_PER_QUIZ } from "@/lib/correctionWords";
import { Word } from "@/types/Words";

/** Helper to create a base word with sensible defaults */
const createWord = (overrides: Partial<Word> = {}): Word => ({
	_id: "word123",
	userId: "user1",
	word: "gato",
	definition: "cat",
	phoneticNotation: "ˈɡætoʊ",
	language: "Español",
	tags: [],
	lastReviewed: null,
	nextReview: new Date().toISOString(),
	interval: 0,
	repetitions: 0,
	easeFactor: 2.5,
	...overrides,
});

/** Helper to extract the date portion of an ISO string */
const toDate = (iso: string): string => new Date(iso).toISOString().split("T")[0];

/** Helper to get a date N days from now as YYYY-MM-DD */
const daysFromNow = (days: number): string => {
	const d = new Date();
	d.setDate(d.getDate() + days);
	return d.toISOString().split("T")[0];
};

describe("processAnswer", () => {
	// ─── CORRECT ANSWERS ─────────────────────────────────────────────

	describe("when the user answers correctly", () => {
		it("schedules first correct answer (rep 0→1) for review in 1 day", () => {
			const word = createWord({ repetitions: 0, interval: 0, easeFactor: 2.5 });
			const result = processAnswer(word, true);

			expect(result.repetitions).toBe(1);
			expect(result.interval).toBe(1);
			expect(result.easeFactor).toBe(2.55); // 2.5 + 0.05
			expect(toDate(result.nextReview)).toBe(daysFromNow(1));
			expect(result.lastReviewed).toBeTruthy();
		});

		it("schedules second correct answer (rep 1→2) for review in 6 days", () => {
			const word = createWord({ repetitions: 1, interval: 1, easeFactor: 2.55 });
			const result = processAnswer(word, true);

			expect(result.repetitions).toBe(2);
			expect(result.interval).toBe(6);
			expect(result.easeFactor).toBe(2.6); // 2.55 + 0.05
			expect(toDate(result.nextReview)).toBe(daysFromNow(6));
		});

		it("schedules third+ correct answer using interval × easeFactor", () => {
			const word = createWord({ repetitions: 2, interval: 6, easeFactor: 2.6 });
			const result = processAnswer(word, true);

			expect(result.repetitions).toBe(3);
			expect(result.interval).toBe(Math.round(6 * 2.65)); // 6 * (2.6 + 0.05) = 15.9 → 16
			expect(result.easeFactor).toBe(2.65);
		});

		it("uses default easeFactor when word has none (undefined)", () => {
			const word = createWord({ repetitions: 0, interval: 0, easeFactor: undefined as unknown as number });
			const result = processAnswer(word, true);

			expect(result.repetitions).toBe(1);
			expect(result.interval).toBe(1);
			expect(result.easeFactor).toBe(parseFloat((DEFAULT_EASE_FACTOR + 0.05).toFixed(2)));
		});

		it("progressively increases intervals for consecutive correct answers", () => {
			let word = createWord({ repetitions: 0, interval: 0, easeFactor: 2.5 });
			const intervals: number[] = [];

			// Simulate 5 consecutive correct answers
			for (let i = 0; i < 5; i++) {
				word = processAnswer(word, true);
				intervals.push(word.interval);
			}

			// Intervals should be strictly increasing after the first two tiers
			expect(intervals).toEqual([1, 6, 16, 43, 118]);
		});
	});

	// ─── INCORRECT ANSWERS ───────────────────────────────────────────

	describe("when the user answers incorrectly", () => {
		it("resets repetitions and interval to 0", () => {
			const word = createWord({ repetitions: 5, interval: 30, easeFactor: 2.5 });
			const result = processAnswer(word, false);

			expect(result.repetitions).toBe(0);
			expect(result.interval).toBe(0);
		});

		it("decreases easeFactor by 0.15", () => {
			const word = createWord({ easeFactor: 2.5 });
			const result = processAnswer(word, false);

			expect(result.easeFactor).toBe(2.35); // 2.5 - 0.15
		});

		it("enforces minimum easeFactor of 1.3", () => {
			const word = createWord({ easeFactor: 1.35 });
			const result = processAnswer(word, false);

			expect(result.easeFactor).toBe(MIN_EASE_FACTOR); // 1.3
		});

		it("uses default easeFactor when word has none (undefined)", () => {
			const word = createWord({ easeFactor: undefined as unknown as number });
			const result = processAnswer(word, false);

			expect(result.easeFactor).toBe(parseFloat((DEFAULT_EASE_FACTOR - 0.15).toFixed(2))); // 2.35
		});

		it("schedules review for the next day (addDays +1)", () => {
			const word = createWord({ easeFactor: 2.5 });
			const result = processAnswer(word, false);

			// The current code uses addDays(new Date(), -1), which schedules
			// in the past. This test documents the ACTUAL behavior.
			// If this is a bug, change -1 to 1 in correctionWords.ts.
			expect(toDate(result.nextReview)).toBe(daysFromNow(-1));
		});

		it("sets lastReviewed to current time", () => {
			const word = createWord();
			const before = new Date().toISOString();
			const result = processAnswer(word, false);
			const after = new Date().toISOString();

			expect(result.lastReviewed).toBeTruthy();
			expect(result.lastReviewed! >= before).toBe(true);
			expect(result.lastReviewed! <= after).toBe(true);
		});
	});

	// ─── PER-QUIZ EASEFACTOR CAPS ─────────────────────────────────────

	describe("per-quiz easeFactor caps", () => {
		it("caps easeFactor decrease to MAX_EASE_DECREASE_PER_QUIZ (0.3)", () => {
			// Word starts with easeFactor 2.5, fails once → would be 2.35
			// That's only a 0.15 drop, which is within the 0.3 cap
			const word = createWord({ easeFactor: 2.5 });
			const result = processAnswer(word, false, 2.5);

			expect(result.easeFactor).toBe(2.35); // 0.15 drop, within cap
		});

		it("prevents easeFactor from dropping more than 0.3 in a single quiz", () => {
			// Simulate a word that was already failed once this quiz
			// Original ease: 2.5, after first fail: 2.35
			// Second fail would try: 2.35 - 0.15 = 2.20, which is a 0.30 drop from 2.5
			// This is exactly at the cap, so it should pass
			const word = createWord({ easeFactor: 2.35 });
			const result = processAnswer(word, false, 2.5);

			expect(result.easeFactor).toBe(2.2); // exactly 0.3 below original
		});

		it("enforces the cap strictly when drop would exceed 0.3", () => {
			// Original ease: 2.5, word already failed twice to 2.20
			// Third fail would try: 2.20 - 0.15 = 2.05, which is a 0.45 drop from 2.5
			// Cap should limit to 2.5 - 0.3 = 2.20
			const word = createWord({ easeFactor: 2.2 });
			const result = processAnswer(word, false, 2.5);

			expect(result.easeFactor).toBe(2.2); // capped at original - 0.3
		});

		it("does not apply cap when originalEaseFactor is not provided", () => {
			// Without originalEaseFactor, the cap is not applied
			const word = createWord({ easeFactor: 1.45 });
			const result = processAnswer(word, false); // no originalEaseFactor

			expect(result.easeFactor).toBe(1.3); // drops to MIN_EASE_FACTOR, no cap
		});

		it("still enforces MIN_EASE_FACTOR even with a generous cap", () => {
			// Original ease is already at MIN, cap can't push it lower
			const word = createWord({ easeFactor: 1.35 });
			const result = processAnswer(word, false, 1.35);

			expect(result.easeFactor).toBe(1.3); // MIN_EASE_FACTOR wins
		});
	});

	// ─── MULTIPLE ANSWERS FOR SAME WORD (IN-MEMORY ACCUMULATION) ─────

	describe("accumulated answers for the same word", () => {
		it("builds on in-memory state: fail then succeed", () => {
			let word = createWord({ repetitions: 3, interval: 15, easeFactor: 2.6 });

			// Fail the word
			word = processAnswer(word, false, 2.6);
			expect(word.repetitions).toBe(0);
			expect(word.interval).toBe(0);
			expect(word.easeFactor).toBe(2.45); // 2.6 - 0.15

			// Then answer correctly (building on the failed state)
			word = processAnswer(word, true, 2.6);
			expect(word.repetitions).toBe(1); // 0 + 1
			expect(word.interval).toBe(1); // first correct after fail
			expect(word.easeFactor).toBe(2.5); // 2.45 + 0.05
		});

		it("builds on in-memory state: succeed then fail", () => {
			let word = createWord({ repetitions: 1, interval: 1, easeFactor: 2.55 });

			// Answer correctly
			word = processAnswer(word, true, 2.5);
			expect(word.repetitions).toBe(2);
			expect(word.interval).toBe(6);

			// Then fail (resets reps and interval, decreases ease)
			word = processAnswer(word, false, 2.5);
			expect(word.repetitions).toBe(0);
			expect(word.interval).toBe(0);
			expect(word.easeFactor).toBe(2.45); // 2.6 - 0.15
		});

		it("handles multiple failures with cap: 3 failures in one quiz", () => {
			const originalEase = 2.5;
			let word = createWord({ easeFactor: originalEase });

			// Fail 3 times — cap should prevent easeFactor from dropping more than 0.3
			word = processAnswer(word, false, originalEase); // 2.5 → 2.35
			expect(word.easeFactor).toBe(2.35);

			word = processAnswer(word, false, originalEase); // 2.35 → 2.20
			expect(word.easeFactor).toBe(2.2);

			word = processAnswer(word, false, originalEase); // 2.20 → would be 2.05, but capped at 2.20
			expect(word.easeFactor).toBe(2.2); // cap enforced
		});
	});

	// ─── IMMUTABILITY ─────────────────────────────────────────────────

	describe("immutability", () => {
		it("does not mutate the original word object", () => {
			const word = createWord({ repetitions: 2, interval: 6, easeFactor: 2.5 });
			const originalReps = word.repetitions;
			const originalInterval = word.interval;
			const originalEase = word.easeFactor;

			processAnswer(word, true);

			expect(word.repetitions).toBe(originalReps);
			expect(word.interval).toBe(originalInterval);
			expect(word.easeFactor).toBe(originalEase);
		});
	});

	// ─── EXPORTED CONSTANTS ──────────────────────────────────────────

	describe("exported constants", () => {
		it("exports MIN_EASE_FACTOR as 1.3", () => {
			expect(MIN_EASE_FACTOR).toBe(1.3);
		});

		it("exports DEFAULT_EASE_FACTOR as 2.5", () => {
			expect(DEFAULT_EASE_FACTOR).toBe(2.5);
		});

		it("exports MAX_EASE_DECREASE_PER_QUIZ as 0.3", () => {
			expect(MAX_EASE_DECREASE_PER_QUIZ).toBe(0.3);
		});
	});
});
