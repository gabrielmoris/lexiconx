import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import SoundIcon from '@/components/Icons/SoundIcon';
import TextIcon from '@/components/Icons/TextIcon';
import { Quiz, QuizAnswer, QuizQuestion, QuizComposition } from '@/types/Quiz';

interface Props {
  quizItem: Quiz;
  question: QuizQuestion;
  onAnswerClick: (option: QuizAnswer) => void;
  feedback: { correct: string; wrong: string };
  showingExplanation: boolean;
  onContinue: () => void;
  quizProgress: { current: number; total: number };
  questionProgress: { current: number; total: number };
  onReadQuiz: () => void;
  composition?: QuizComposition;
  ttsReady?: boolean;
}

const QuizView = ({
  quizItem,
  question,
  onAnswerClick,
  feedback,
  showingExplanation,
  onContinue,
  quizProgress,
  questionProgress,
  onReadQuiz,
  composition,
  ttsReady = true,
}: Props) => {
  const [showText, setShowText] = React.useState(false);
  const t = useTranslations('quiz');

  useEffect(() => {
    setShowText(false);
  }, [question]);

  if (!quizItem || !question) {
    return null;
  }

  const isCorrectAnswer = feedback.correct !== '';
  const isWrongAnswer = feedback.wrong !== '';
  const hasAnswered = isCorrectAnswer || isWrongAnswer;

  const explanationText =
    isCorrectAnswer && question.elaboration
      ? question.elaboration
      : isWrongAnswer && question.errorExplanation
        ? question.errorExplanation
        : null;

  const hasComposition =
    composition && composition.new + composition.learning + composition.mastered > 0;

  return (
    <div className="flex flex-col gap-5 w-full max-w-md" aria-live="polite">
      {hasComposition && (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {composition.new} {t('composition-new')}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {composition.learning} {t('composition-learning')}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {composition.mastered} {t('composition-mastered')}
          </span>
        </div>
      )}
      <div className="flex items-center gap-4">
        {showText ? (
          <div className="grow">
            <p className="text-2xl font-bold">{quizItem.sentence}</p>
            <p className="text-md font-extralight italic">{quizItem.phoneticNotation}</p>
          </div>
        ) : (
          <button onClick={() => setShowText(true)} aria-label="Show text">
            <TextIcon className="w-8 h-8 cursor-pointer" />
          </button>
        )}
        <button
          onClick={onReadQuiz}
          aria-label="Read sentence aloud"
          disabled={!ttsReady}
          className={`${!ttsReady ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={!ttsReady ? 'Loading speech voices...' : 'Read sentence aloud'}
        >
          <SoundIcon className={`w-8 h-8 ${!ttsReady ? 'animate-pulse' : ''}`} />
        </button>
      </div>

      <p className="text-xl">{question.question}</p>

      {/* Answer options */}
      <ul className="flex w-full flex-col gap-5">
        {question.options.map(option => (
          <li
            key={option.answer}
            onClick={() => !hasAnswered && onAnswerClick(option)}
            onKeyDown={e =>
              !hasAnswered && (e.key === 'Enter' || e.key === ' ') && onAnswerClick(option)
            }
            role="button"
            tabIndex={hasAnswered ? -1 : 0}
            className={`cursor-pointer flex items-center list-none py-2 px-5 rounded-md transition-colors
 dark:bg-theme-fg-dark bg-theme-fg-light
 ${!hasAnswered ? 'hover:bg-secondary' : ''}
 ${feedback.correct === option.answer ? 'blink-success' : ''}
 ${feedback.wrong === option.answer ? 'blink-error' : ''}
 ${hasAnswered ? 'pointer-events-none' : ''}`}
          >
            {option.answer}
          </li>
        ))}
      </ul>

      {/* Explanation panel */}
      {showingExplanation && explanationText && (
        <div
          className={`py-3 px-4 rounded-lg border-l-4 text-sm leading-relaxed ${
            isCorrectAnswer
              ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600 text-red-800 dark:text-red-200'
          }`}
        >
          <p className="font-semibold mb-1">
            {isCorrectAnswer ? t('why-correct') : t('why-wrong')}
          </p>
          <p>{explanationText}</p>
        </div>
      )}

      {showingExplanation && (
        <button
          onClick={onContinue}
          className="w-full py-2 px-4 rounded-md font-medium transition-colors bg-primary bg-info cursor-pointer hover:bg-info/80 text-white hover:bg-primary/90 active:bg-primary/80"
        >
          {t('continue')}
        </button>
      )}

      <section className="flex flex-col justify-start gap-0.5">
        <p className="text-[0.6rem] italic font-extralight opacity-60">
          {t('quiz', { current: quizProgress.current, total: quizProgress.total })}
        </p>
        <p className="text-[0.6rem] italic font-extralight opacity-60">
          {t('question', { current: questionProgress.current, total: questionProgress.total })}
        </p>
      </section>
    </div>
  );
};

export default QuizView;
