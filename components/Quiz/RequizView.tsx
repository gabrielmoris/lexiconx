import { useTranslations } from 'next-intl';
import { RequizQuestion, RequizOption } from '@/lib/requiz';

interface Props {
  question: RequizQuestion;
  onAnswerClick: (option: RequizOption) => void;
  feedback: 'correct' | 'wrong' | null;
  onContinue: () => void;
  progress: { current: number; total: number };
}

const RequizView = ({ question, onAnswerClick, feedback, onContinue, progress }: Props) => {
  const t = useTranslations('requiz');

  if (!question) return null;

  const hasAnswered = feedback !== null;

  return (
    <div className="flex flex-col gap-5 w-full max-w-md" aria-live="polite">
      {/* Requiz header */}
      <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        {t('review-missed-words')}
      </div>

      {/* Question stem = definition in native language */}
      <p className="text-xl font-semibold">{question.stem}</p>

      {/* Answer options = target-language words */}
      <ul className="flex w-full flex-col gap-4">
        {question.options.map(option => (
          <li
            key={option.word}
            onClick={() => !hasAnswered && onAnswerClick(option)}
            onKeyDown={e =>
              !hasAnswered && (e.key === 'Enter' || e.key === ' ') && onAnswerClick(option)
            }
            role="button"
            tabIndex={hasAnswered ? -1 : 0}
            className={`cursor-pointer flex flex-col items-start list-none py-2 px-5 rounded-md transition-colors
              dark:bg-theme-fg-dark bg-theme-fg-light
              ${!hasAnswered ? 'hover:bg-secondary' : ''}
              ${hasAnswered && option.isCorrect ? 'blink-success' : ''}
              ${hasAnswered ? 'pointer-events-none' : ''}`}
          >
            <span className="text-lg font-medium">{option.word}</span>
            {option.phoneticNotation && (
              <span className="text-sm font-extralight italic opacity-70">
                {option.phoneticNotation}
              </span>
            )}
          </li>
        ))}
      </ul>

      {/* Feedback message */}
      {hasAnswered && (
        <div
          className={`py-3 px-4 rounded-lg border-l-4 text-sm leading-relaxed ${
            feedback === 'correct'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600 text-red-800 dark:text-red-200'
          }`}
        >
          <p className="font-semibold">
            {feedback === 'correct' ? t('you-got-it') : t('correct-answer-was')}
          </p>
          {feedback === 'wrong' && (
            <p className="mt-1">
              <span className="font-bold">{question.correctWord}</span>
              {question.correctPhonetic && (
                <span className="ml-2 italic opacity-70">{question.correctPhonetic}</span>
              )}
            </p>
          )}
        </div>
      )}

      {/* Continue button */}
      {hasAnswered && (
        <button
          onClick={onContinue}
          className="w-full py-2 px-4 rounded-md font-medium transition-colors bg-primary bg-info cursor-pointer hover:bg-info/80 text-white hover:bg-primary/90 active:bg-primary/80"
        >
          {t('continue')}
        </button>
      )}

      {/* Progress */}
      <section className="flex justify-between gap-0.5">
        <p className="text-[0.6rem] italic font-extralight opacity-60">
          {t('progress', { current: progress.current, total: progress.total })}
        </p>
      </section>
    </div>
  );
};

export default RequizView;
