import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';

// --- Mocks ---

const mockPush = vi.fn();
vi.mock('@/src/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: { user: { id: 'u1' } },
    status: 'authenticated',
  })),
}));

const mockClientQuizzes = vi.fn(() => []);
vi.mock('@/context/QuizContext', () => ({
  useQuiz: () => ({
    clientQuizzes: mockClientQuizzes(),
    isLoading: false,
  }),
}));

let storedQuizzes: any[] = [];
let isHydrated = true;
const mockDeleteValue = vi.fn();
vi.mock('@/hooks/useLocalStorage', () => ({
  default: () => ({
    storedValue: { quizzes: storedQuizzes },
    isHydrated,
    deleteValue: mockDeleteValue,
  }),
}));

const mockGetWordsByIds = vi.fn();
const mockUpdateWordsData = vi.fn();
const mockUpdateUserData = vi.fn();
const mockSaveQuizSession = vi.fn();
vi.mock('@/lib/apis', () => ({
  getWordsByIds: (...args: any[]) => mockGetWordsByIds(...args),
  updateWordsData: (...args: any[]) => mockUpdateWordsData(...args),
  updateUserData: (...args: any[]) => mockUpdateUserData(...args),
  saveQuizSession: (...args: any[]) => mockSaveQuizSession(...args),
}));

const mockProcessAnswer = vi.fn();
vi.mock('@/lib/correctionWords', () => ({
  processAnswer: (...args: any[]) => mockProcessAnswer(...args),
}));

// --- Mock Data ---

const mockWord1 = {
  _id: 'word1',
  userId: 'u1',
  word: 'gato',
  definition: 'cat',
  phoneticNotation: 'gato',
  language: 'Español',
  tags: [],
  lastReviewed: null,
  nextReview: new Date().toISOString(),
  interval: 0,
  repetitions: 0,
  easeFactor: 2.5,
};

const mockWord2 = {
  _id: 'word2',
  userId: 'u1',
  word: 'perro',
  definition: 'dog',
  phoneticNotation: 'pero',
  language: 'Español',
  tags: [],
  lastReviewed: null,
  nextReview: new Date().toISOString(),
  interval: 0,
  repetitions: 0,
  easeFactor: 2.5,
};

const correctOption = { answer: 'cat', isCorrect: true as const };
const wrongOption = { answer: 'dog', isCorrect: false as const };

const mockQuiz = {
  sentence: 'El gato y el perro',
  language: 'Español',
  phoneticNotation: 'el gato i el pero',
  translation: 'The cat and the dog',
  questions: [
    {
      question: 'What does gato mean?',
      options: [correctOption, wrongOption, { answer: 'bird', isCorrect: false }],
      usedWords: ['word1'],
    },
    {
      question: 'What does perro mean?',
      options: [
        { answer: 'cat', isCorrect: false },
        { answer: 'dog', isCorrect: true },
      ],
      usedWords: ['word2'],
    },
  ],
};

const mockUserData = {
  email: 'test@test.com',
  name: 'Test User',
  activeLanguage: 'Español',
  learningProgress: [
    {
      language: 'Español',
      level: 5,
      wordsMastered: 0,
      currentStreak: 3,
      lastSessionDate: new Date(),
      timeSpent: 0,
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// --- Import hook after mocks ---

import { useQuizManager } from '@/hooks/useQuizManager';

// --- Setup helper---

async function setupHook() {
  vi.useRealTimers();
  const hook = renderHook(() => useQuizManager(mockUserData as any));
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

// --- Tests ---

describe('useQuizManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storedQuizzes = [mockQuiz];
    isHydrated = true;
    mockGetWordsByIds.mockResolvedValue({ data: [mockWord1, mockWord2] });
    mockUpdateWordsData.mockResolvedValue({});
    mockUpdateUserData.mockResolvedValue({});
    mockSaveQuizSession.mockResolvedValue({});
    mockProcessAnswer.mockImplementation((word: any, isCorrect: boolean) => ({
      ...word,
      repetitions: isCorrect ? word.repetitions + 1 : 0,
      easeFactor: isCorrect ? word.easeFactor + 0.05 : word.easeFactor - 0.15,
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('quiz loading', () => {
    it('loads quiz from localStorage when context is empty', async () => {
      const { result } = await setupHook();
      expect(result.current.currentQuizItem).toBeTruthy();
      expect(result.current.currentQuizItem.sentence).toBe('El gato y el perro');
    });

    it('prefetches word IDs from questions', async () => {
      await setupHook();
      expect(mockGetWordsByIds).toHaveBeenCalledWith(['word1', 'word2']);
    });

    it('redirects to /cards when no quizzes exist', async () => {
      storedQuizzes = [];
      renderHook(() => useQuizManager(mockUserData as any));
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/cards');
      });
    });

    it('stays loading when localStorage is not hydrated', async () => {
      isHydrated = false;
      const { result } = renderHook(() => useQuizManager(mockUserData as any));
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('handleAnswerClick', () => {
    it('increments success score on correct answer', async () => {
      const { result } = await setupHook();
      vi.useFakeTimers();
      act(() => {
        result.current.handleAnswerClick(correctOption);
      });
      expect(result.current.score.success).toBe(1);
    });

    it('increments error score on wrong answer', async () => {
      const { result } = await setupHook();
      vi.useFakeTimers();
      act(() => {
        result.current.handleAnswerClick(wrongOption);
      });
      expect(result.current.score.errors).toBe(1);
    });

    it('shows correct feedback on correct answer', async () => {
      const { result } = await setupHook();
      vi.useFakeTimers();
      act(() => {
        result.current.handleAnswerClick(correctOption);
      });
      expect(result.current.feedback.correct).toBe('cat');
      expect(result.current.feedback.wrong).toBe('');
    });

    it('shows wrong feedback on incorrect answer', async () => {
      const { result } = await setupHook();
      vi.useFakeTimers();
      act(() => {
        result.current.handleAnswerClick(wrongOption);
      });
      expect(result.current.feedback.correct).toBe('');
      expect(result.current.feedback.wrong).toBe('dog');
    });

    it('calls processAnswer for question usedWords only', async () => {
      const { result } = await setupHook();
      vi.useFakeTimers();
      act(() => {
        result.current.handleAnswerClick(correctOption);
      });
      // Q1 only uses word1
      expect(mockProcessAnswer).toHaveBeenCalledTimes(1);
      expect(mockProcessAnswer).toHaveBeenCalledWith(
        expect.objectContaining({ _id: 'word1' }),
        true,
        2.5
      );
    });

    it('advances to next question after timeout', async () => {
      const { result } = await setupHook();
      vi.useFakeTimers();
      expect(result.current.questionProgress.current).toBe(1);
      act(() => {
        result.current.handleAnswerClick(correctOption);
      });
      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(result.current.questionProgress.current).toBe(2);
    });
  });

  describe('quiz end', () => {
    const completeQuizSuccess = (result: any) => {
      act(() => {
        result.current.handleAnswerClick(correctOption);
      });
      act(() => {
        vi.advanceTimersByTime(600);
      });
      act(() => {
        result.current.handleAnswerClick({ answer: 'dog', isCorrect: true });
      });
      act(() => {
        vi.advanceTimersByTime(600);
      });
    };

    const completeQuizFail = (result: any) => {
      act(() => {
        result.current.handleAnswerClick(wrongOption);
      });
      act(() => {
        vi.advanceTimersByTime(600);
      });
      act(() => {
        result.current.handleAnswerClick(wrongOption);
      });
      act(() => {
        vi.advanceTimersByTime(600);
      });
    };

    it('calls updateWordsData when quiz completes', async () => {
      const { result } = await setupHook();
      vi.useFakeTimers();
      completeQuizSuccess(result);
      // Real timers so waitFor can poll
      vi.useRealTimers();
      await waitFor(
        () => {
          expect(mockUpdateWordsData).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );
    });

    it('calls saveQuizSession with correct data', async () => {
      const { result } = await setupHook();
      vi.useFakeTimers();
      completeQuizSuccess(result);
      vi.useRealTimers();
      await waitFor(
        () => {
          expect(mockSaveQuizSession).toHaveBeenCalledWith(
            expect.objectContaining({
              language: 'Español',
              totalQuestions: 2,
              correctAnswers: 2,
            })
          );
        },
        { timeout: 3000 }
      );
    });

    it('increments level on success', async () => {
      const { result } = await setupHook();
      vi.useFakeTimers();
      completeQuizSuccess(result);
      vi.useRealTimers();
      await waitFor(
        () => {
          expect(mockUpdateUserData).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );
      const updatedUser = mockUpdateUserData.mock.calls[0][0];
      const lp = updatedUser.learningProgress.find((l: any) => l.language === 'Español');
      expect(lp.level).toBe(6);
    });

    it('decrements level on failure (min 0)', async () => {
      const { result } = await setupHook();
      vi.useFakeTimers();
      completeQuizFail(result);
      vi.useRealTimers();
      await waitFor(
        () => {
          expect(mockUpdateUserData).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );
      const updatedUser = mockUpdateUserData.mock.calls[0][0];
      const lp = updatedUser.learningProgress.find((l: any) => l.language === 'Español');
      expect(lp.level).toBe(4);
    });

    it('increments currentStreak on success', async () => {
      const { result } = await setupHook();
      vi.useFakeTimers();
      completeQuizSuccess(result);
      vi.useRealTimers();
      await waitFor(
        () => {
          expect(mockUpdateUserData).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );
      const updatedUser = mockUpdateUserData.mock.calls[0][0];
      const lp = updatedUser.learningProgress.find((l: any) => l.language === 'Español');
      expect(lp.currentStreak).toBe(4);
    });

    it('resets currentStreak to 0 on failure', async () => {
      const { result } = await setupHook();
      vi.useFakeTimers();
      completeQuizFail(result);
      vi.useRealTimers();
      await waitFor(
        () => {
          expect(mockUpdateUserData).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );
      const updatedUser = mockUpdateUserData.mock.calls[0][0];
      const lp = updatedUser.learningProgress.find((l: any) => l.language === 'Español');
      expect(lp.currentStreak).toBe(0);
    });

    it('sets isQuizFinished to true', async () => {
      const { result } = await setupHook();
      vi.useFakeTimers();
      completeQuizSuccess(result);
      vi.useRealTimers();
      await waitFor(
        () => {
          expect(result.current.isQuizFinished).toBe(true);
        },
        { timeout: 3000 }
      );
    });
  });

  // --- Quiz Restart ---

  describe('restartQuiz', () => {
    it('resets score to 0/0', async () => {
      const { result } = await setupHook();
      act(() => {
        result.current.handleAnswerClick(correctOption);
      });
      expect(result.current.score.success).toBe(1);
      act(() => {
        result.current.restartQuiz();
      });
      expect(result.current.score).toEqual({ success: 0, errors: 0 });
    });

    it('sets isQuizFinished to false', async () => {
      const { result } = await setupHook();
      act(() => {
        result.current.restartQuiz();
      });
      expect(result.current.isQuizFinished).toBe(false);
    });

    it('re-fetches words from DB', async () => {
      const { result } = await setupHook();
      const initialCalls = mockGetWordsByIds.mock.calls.length;
      act(() => {
        result.current.restartQuiz();
      });
      expect(mockGetWordsByIds.mock.calls.length).toBeGreaterThan(initialCalls);
    });
  });

  describe('progress tracking', () => {
    it('returns correct quizProgress', async () => {
      const { result } = await setupHook();
      expect(result.current.quizProgress).toEqual({ current: 1, total: 1 });
    });

    it('returns correct questionProgress', async () => {
      const { result } = await setupHook();
      expect(result.current.questionProgress).toEqual({ current: 1, total: 2 });
    });
  });
});
