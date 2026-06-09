import { describe, it, expect } from 'vitest';
import { buildRequizQuestions } from '@/lib/requiz';
import { Word } from '@/types/Words';

const makeWord = (id: string, word: string, definition: string, phonetic = ''): Word =>
  ({
    _id: id,
    word,
    definition,
    phoneticNotation: phonetic,
    language: 'English',
    tags: [],
    repetitions: 0,
    interval: 1,
    easeFactor: 2.5,
    nextReviewDate: new Date(),
    userId: 'u1',
  }) as unknown as Word;

describe('buildRequizQuestions', () => {
  it('returns empty array when no missed word IDs', () => {
    const result = buildRequizQuestions([], [makeWord('w1', 'cat', 'gato')]);
    expect(result).toEqual([]);
  });

  it('returns empty array when allWords is empty', () => {
    const result = buildRequizQuestions(['w1'], []);
    expect(result).toEqual([]);
  });

  it('builds a question for a single missed word', () => {
    const words = [
      makeWord('w1', 'cat', 'gato', 'kæt'),
      makeWord('w2', 'dog', 'perro', 'dɔg'),
      makeWord('w3', 'bird', 'pájaro'),
      makeWord('w4', 'fish', 'pez'),
    ];
    const result = buildRequizQuestions(['w1'], words);

    expect(result).toHaveLength(1);
    expect(result[0].stem).toBe('gato');
    expect(result[0].correctWord).toBe('cat');
    expect(result[0].correctPhonetic).toBe('kæt');
    expect(result[0].usedWords).toEqual(['w1']);

    // Correct option exists
    const correctOption = result[0].options.find(o => o.isCorrect);
    expect(correctOption).toBeDefined();
    expect(correctOption!.word).toBe('cat');
    expect(correctOption!.phoneticNotation).toBe('kæt');

    // Has distractors from other words
    const distractors = result[0].options.filter(o => !o.isCorrect);
    expect(distractors.length).toBeGreaterThan(0);
  });

  it('builds questions for multiple missed words', () => {
    const words = [
      makeWord('w1', 'cat', 'gato'),
      makeWord('w2', 'dog', 'perro'),
      makeWord('w3', 'bird', 'pájaro'),
      makeWord('w4', 'fish', 'pez'),
    ];
    const result = buildRequizQuestions(['w1', 'w2'], words);

    expect(result).toHaveLength(2);

    const stems = result.map(q => q.stem);
    expect(stems).toContain('gato');
    expect(stems).toContain('perro');
  });

  it('uses only non-missed words as distractors', () => {
    const words = [
      makeWord('w1', 'cat', 'gato'),
      makeWord('w2', 'dog', 'perro'),
      makeWord('w3', 'bird', 'pájaro'),
    ];
    const result = buildRequizQuestions(['w1', 'w2'], words);

    // For w1 question, distractors should only come from w3
    const w1Question = result.find(q => q.usedWords.includes('w1'));
    expect(w1Question).toBeDefined();
    const distractors = w1Question!.options.filter(o => !o.isCorrect);
    for (const d of distractors) {
      expect(d.word).toBe('bird'); // only non-missed word
    }
  });

  it('handles single missed word with no other words gracefully', () => {
    const words = [makeWord('w1', 'cat', 'gato')];
    const result = buildRequizQuestions(['w1'], words);

    expect(result).toHaveLength(1);
    expect(result[0].options).toHaveLength(1); // only correct, no distractors
    expect(result[0].options[0].isCorrect).toBe(true);
  });

  it('each question has exactly one correct option', () => {
    const words = [
      makeWord('w1', 'cat', 'gato'),
      makeWord('w2', 'dog', 'perro'),
      makeWord('w3', 'bird', 'pájaro'),
      makeWord('w4', 'fish', 'pez'),
    ];
    const result = buildRequizQuestions(['w1', 'w2', 'w3'], words);

    for (const q of result) {
      const correctCount = q.options.filter(o => o.isCorrect).length;
      expect(correctCount).toBe(1);
    }
  });

  it('limits distractors to at most 3 per question', () => {
    const words = [
      makeWord('w1', 'cat', 'gato'),
      makeWord('w2', 'dog', 'perro'),
      makeWord('w3', 'bird', 'pájaro'),
      makeWord('w4', 'fish', 'pez'),
      makeWord('w5', 'tree', 'árbol'),
      makeWord('w6', 'water', 'agua'),
    ];
    const result = buildRequizQuestions(['w1'], words);

    expect(result).toHaveLength(1);
    const distractors = result[0].options.filter(o => !o.isCorrect);
    expect(distractors.length).toBeLessThanOrEqual(3);
  });
});
