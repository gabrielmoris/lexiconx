import React from "react";
import { useTranslations } from "next-intl";
import SoundIcon from "@/components/Icons/SoundIcon";
import TextIcon from "@/components/Icons/TextIcon";
import { Quiz, QuizAnswer, QuizQuestion } from "@/types/Quiz";

interface Props {
  quizItem: Quiz;
  question: QuizQuestion;
  onAnswerClick: (option: QuizAnswer) => void;
  feedback: { correct: string; wrong: string };
  quizProgress: { current: number; total: number };
  questionProgress: { current: number; total: number };
  onReadQuiz: () => void;
}

const QuizView = ({ quizItem, question, onAnswerClick, feedback, quizProgress, questionProgress, onReadQuiz }: Props) => {
  const [showText, setShowText] = React.useState(false);
  const t = useTranslations("quiz");

  if (!quizItem || !question) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-md" aria-live="polite">
      <div className="flex items-center gap-4">
        {showText ? (
          <div className="flex-grow">
            <p className="text-2xl font-bold">{quizItem.sentence}</p>
            <p className="text-md font-extralight italic">{quizItem.phoneticNotation}</p>
          </div>
        ) : (
          <button onClick={() => setShowText(true)} aria-label="Show text">
            <TextIcon className="w-8 h-8 cursor-pointer" />
          </button>
        )}
        <button onClick={onReadQuiz} aria-label="Read sentence aloud">
          <SoundIcon className="w-8 h-8 cursor-pointer" />
        </button>
      </div>

      <p className="text-xl">{question.question}</p>

      {/* For a11y, using a list for options is better */}
      <ul className="flex w-full flex-col gap-5">
        {question.options.map((option) => (
          <li
            key={option.answer} // Use a more stable key if possible
            onClick={() => onAnswerClick(option)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onAnswerClick(option)}
            role="button"
            tabIndex={0}
            className={`cursor-pointer flex items-center list-none py-2 px-5 rounded-md transition-colors
                        dark:bg-theme-fg-dark bg-theme-fg-light hover:bg-secondary
                        ${feedback.correct === option.answer ? "blink-success" : ""}
                        ${feedback.wrong === option.answer ? "blink-error" : ""}`}
          >
            {option.answer}
          </li>
        ))}
      </ul>

      <section className="flex flex-col justify-start gap-0.5">
        <p className="text-[0.6rem] italic font-extralight opacity-60">{t("quiz", { current: quizProgress.current, total: quizProgress.total })}</p>
        <p className="text-[0.6rem] italic font-extralight opacity-60">
          {t("question", { current: questionProgress.current, total: questionProgress.total })}
        </p>
      </section>
    </div>
  );
};

export default QuizView;
