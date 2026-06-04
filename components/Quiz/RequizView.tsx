import { useTranslations } from 'next-intl';
import { RequizQuestion, RequizOption } from '@/lib/requiz';

interface Props {
  question: RequizQuestion;
  onAnswerClick: (option: RequizOption) => void;
  feedback: { correct: string; wrong: string };
  onContinue: () => void;
  progress: { current: number; total: number };
}

const RequizView = ({ question, onAnswerClick, feedback, onContinue, progress }: Props) => {
  const t = useTranslations('requiz');

  if (!question) return null;

  const hasAnswered = feedback.correct !== '' || feedback.wrong !== '';

  return (
    <div className="flex flex-col gap-5 w-full max-w-md" aria-live="polite">
      {/* Requiz header */}
      <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
        <span className="inline-flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          {t('review-missed-words')}
        </span>
      </div>

      {/* Question stem: definition in native language */}
      <p className="text-xl">{t('which-word-means', { definition: question.stem })}</p>

      {/* Answer options: target-language words */}
      <ul className="flex w-full flex-col gap-5">
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
 ${feedback.correct === option.word ? 'blink-success' : ''}
 ${feedback.wrong === option.word ? 'blink-error' : ''}
 ${hasAnswered ? 'pointer-events-none' : ''}`}
          >
            <span className="font-medium">{option.word}</span>
            <span className="text-xs font-extralight italic opacity-70">
              {option.phoneticNotation}
            </span>
          </li>
        ))}
      </ul>

      {/* Feedback panel */}
      {hasAnswered && (
        <div
          className={`py-3 px-4 rounded-lg border-l-4 text-sm leading-relaxed ${
            feedback.correct
              ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600 text-red-800 dark:text-red-200'
          }`}
        >
          <p className="font-semibold mb-1">{feedback.correct ? t('correct') : t('incorrect')}</p>
          <p>
            {feedback.correct
              ? t('correct-answer-was', { word: question.correctWord })
              : t('correct-answer-is', { word: question.correctWord })}
          </p>
        </div>
      )}

      {/* Continue button */}
      {hasAnswered && (
        <button
          onClick={onContinue}
          className="w-full py-2 px-4 rounded-md font-medium transition-colors bg-primary bg-info cursor-pointer hover:bg-info/80 text-white hover:bg-primary/90 active:bg-primary/80"
        >
          {progress.current < progress.total ? t('continue') : t('finish-review')}
        </button>
      )}

      {/* Progress */}
      <p className="text-[0.6rem] italic font-extralight opacity-60">
        {t('question', { current: progress.current, total: progress.total })}
      </p>
    </div>
  );
};

export default RequizView;
