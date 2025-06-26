import { useConfetti } from "@/hooks/useConfetti";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { motion, AnimatePresence, easeOut, easeIn } from "framer-motion";

interface Props {
  isSuccess: boolean;
  successPoints: { errors: number; success: number };
  onRestartQuiz?: () => void;
}

const QuizFinished = ({ isSuccess, successPoints, onRestartQuiz }: Props) => {
  const { triggerFireworks, triggerSchoolPride, resetConfetti } = useConfetti();
  const t = useTranslations("quiz-finished");

  const totalQuestions = successPoints.success + successPoints.errors;
  const percentageCorrect = totalQuestions > 0 ? (successPoints.success / totalQuestions) * 100 : 0;

  useEffect(() => {
    if (isSuccess) {
      resetConfetti();
      triggerSchoolPride();
      triggerFireworks();
    }

    return () => {
      resetConfetti();
    };
  }, [isSuccess, resetConfetti, triggerSchoolPride, triggerFireworks]);

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.5 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: easeOut } },
    exit: { opacity: 0, y: -50, scale: 0.5, transition: { duration: 0.4, ease: easeIn } },
  };

  return (
    // Use theme-bg-light and theme-bg-dark for the background
    <div className="flex items-center justify-center bg-theme-bg-light dark:bg-theme-bg-dark p-4 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success-card"
            // Use theme-fg-light/dark for card background and theme-text-light/dark for general text
            className="rounded-3xl p-8 md:p-12 text-center max-w-md w-full relative overflow-hidden transform transition-all duration-500 hover:scale-105
                       bg-theme-fg-light text-theme-text-light
                       dark:bg-theme-fg-dark dark:text-theme-text-dark"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div
              className="absolute inset-0 z-0 opacity-20"
              style={{
                backgroundImage: "radial-gradient(circle at center, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "10px 10px",
              }}
            ></div>

            <h1 className="text-3xl font-extrabold text-secondary mb-4 drop-shadow-lg animate-bounce-short">{t("congratulations")}!</h1>
            <p className="text-xl  font-semibold mb-6 leading-tight">
              {t("you-answered-correctly", { count: successPoints.success, total: totalQuestions })}
            </p>
            <div className="w-24 h-24 mx-auto mb-6 bg-secondary/20 rounded-full flex items-center justify-center shadow-inner">
              <span className="text-2xl font-bold text-secondary">{Math.round(percentageCorrect)}%</span>
            </div>
            <p className="text-lg mb-8">{t("fantastic-job-keep-it-up")}</p>
          </motion.div>
        ) : (
          <motion.div
            key="failure-card"
            className="rounded-3xl p-8 md:p-12 text-center max-w-md w-full relative transform transition-all duration-500 hover:scale-105
                       bg-theme-fg-light text-theme-text-light
                       dark:bg-theme-fg-dark dark:text-theme-text-dark"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <h1 className="text-3xl font-extrabold text-error mb-4 drop-shadow-lg">{t("better-luck-next-time")}</h1>
            <p className="text-xl font-semibold mb-6 leading-tight">
              {t("you-answered-correctly", { count: successPoints.success, total: totalQuestions })}
            </p>
            <div className="w-24 h-24 mx-auto mb-6 bg-error/20 rounded-full flex items-center justify-center shadow-inner">
              <span className="text-2xl font-bold text-error">{Math.round(percentageCorrect)}%</span>
            </div>
            <p className="text-lg mb-8">{t("dont-give-up-try-again")}</p>
            {onRestartQuiz && (
              <button
                onClick={onRestartQuiz}
                className="bg-error cursor-pointer hover:brightness-110 text-theme-text-dark font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-error/50"
              >
                {t("try-again")}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizFinished;
