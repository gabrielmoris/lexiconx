import { describe, it, expect } from 'vitest';
import { buildRequizQuestions } from '../requiz';
import { Word } from '@/types/Words';

const makeWord = (id: string, word: string, definition: string, phonetic?: string): Word => ({
  _id: id,
  userId: 'u1',
  word,
  definition,
  phoneticNotation: phonetic || word,
  language: 'Español',
  tags: [],
  lastReviewed: null,
  nextReview: new Date().toISOString(),
  interval: 0,
  repetitions: 0,
  easeFactor: 2.5,
});

describe('buildRequizQuestions', () => {
  const allWords = [
    makeWord('w1', 'gato', 'cat', 'gato'),
    makeWord('w2', 'perro', 'dog', 'pero'),
    makeWord('w3', 'pájaro', 'bird', 'paharo'),
    makeWord('w4', 'pez', 'fish', 'pes'),
  ];

  it('returns empty array when no missed word IDs', () => {
    const result = buildRequizQuestions([], allWords);
    expect(result).toEqual([]);
  });

  it('creates one question per missed word', () => {
    const result = buildRequizQuestions(['w1', 'w2'], allWords);
    expect(result).toHaveLength(2);
  });

  it('uses definition as stem', () => {
    const result = buildRequizQuestions(['w1'], allWords);
    expect(result[0].stem).toBe('cat');
  });

  it('sets correctWord to the target-language word', () => {
    const result = buildRequizQuestions(['w1'], allWords);
    expect(result[0].correctWord).toBe('gato');
  });

  it('sets correctPhonetic from the word', () => {
    const result = buildRequizQuestions(['w1'], allWords);
    expect(result[0].correctPhonetic).toBe('gato');
  });

  it('includes correct option in options array', () => {
    const result = buildRequizQuestions(['w1'], allWords);
    const correctOpt = result[0].options.find(o => o.isCorrect);
    expect(correctOpt).toBeDefined();
    expect(correctOpt!.word).toBe('gato');
    expect(correctOpt!.phoneticNotation).toBe('gato');
  });

  it('includes distractors from other words in the pool', () => {
    const result = buildRequizQuestions(['w1'], allWords);
    const distractors = result[0].options.filter(o => !o.isCorrect);
    expect(distractors.length).toBeLessThanOrEqual(3);
    expect(distractors.length).toBeGreaterThanOrEqual(1);
    distractors.forEach(d => {
      expect(d.word).not.toBe('gato');
      expect(d.isCorrect).toBe(false);
    });
  });

  it('tracks usedWords with the missed word ID', () => {
    const result = buildRequizQuestions(['w1'], allWords);
    expect(result[0].usedWords).toEqual(['w1']);
  });

  it('handles single word in pool (no distractors available)', () => {
    const singleWord = [makeWord('w1', 'gato', 'cat')];
    const result = buildRequizQuestions(['w1'], singleWord);
    expect(result).toHaveLength(1);
    expect(result[0].options).toHaveLength(1);
    expect(result[0].options[0].isCorrect).toBe(true);
  });

  it('shuffles options so correct answer is not always first', () => {
    const results = Array.from({ length: 20 }, () => buildRequizQuestions(['w1'], allWords));
    const positions = results.map(r => r[0].options.findIndex(o => o.isCorrect));
    const uniquePositions = new Set(positions);
    expect(uniquePositions.size).toBeGreaterThanOrEqual(2);
  });

  it('handles multiple missed words', () => {
    const result = buildRequizQuestions(['w1', 'w2', 'w3'], allWords);
    expect(result).toHaveLength(3);
    const stems = result.map(q => q.stem);
    expect(stems).toContain('cat');
    expect(stems).toContain('dog');
    expect(stems).toContain('bird');
  });
});
