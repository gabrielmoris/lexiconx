'use client';

import { Word } from '@/types/Words';
import RemoveIcon from '../Icons/RemoveIcon';

interface WordChipProps {
  word: Word;
  onRemove: (wordId: string) => void;
}

const WordChip = ({ word, onRemove }: WordChipProps) => {
  const isNew = word.repetitions === 0;
  const isMastered = word.interval > 21;

  const colorClasses = isNew
    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700'
    : isMastered
      ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700'
      : 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium border ${colorClasses} transition-all duration-150`}
    >
      <span className="max-w-[120px] truncate" title={word.word}>
        {word.word}
      </span>
      {word.phoneticNotation && (
        <span className="text-xs opacity-70 truncate max-w-[80px]" title={word.phoneticNotation}>
          {word.phoneticNotation}
        </span>
      )}
      <button
        type="button"
        onClick={() => word._id && onRemove(word._id)}
        className="ml-0.5 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        aria-label={`Remove ${word.word}`}
      >
        <RemoveIcon className="w-3.5 h-3.5" />
      </button>
    </span>
  );
};

export default WordChip;
