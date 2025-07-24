"use client";
import Button from "../UI/Button";
import { useTranslations } from "next-intl";
import LexiconxLogo from "../Icons/LexiconxLogo";
import { useQuiz } from "@/context/QuizContext";
import { useRouter } from "@/src/i18n/navigation";
import { useCallback } from "react";

const AiQuizzGenerator = () => {
  const t = useTranslations("ai-quiz-generator");
  const { generateQuiz, isLoading, storedQuizzesData } = useQuiz();
  const route = useRouter();

  const handleGenerateQuiz = useCallback(() => {
    // If you failed you repeat the quizzes, otherwise you can generate new ones
    if (storedQuizzesData.quizzes.length > 0) {
      route.push("/quiz");
      return;
    }

    generateQuiz().then((res) => {
      if (res?.success) {
        route.push("/quiz");
      }
    });
  }, [generateQuiz, storedQuizzesData, route]);

  return (
    <Button disabled={isLoading} onClick={handleGenerateQuiz} className="flex items-center justify-between px-5 w-full">
      {t("generate-quiz")} <span className="text-2xl font-extrabold"> {isLoading ? <LexiconxLogo className={`w-8 h-8 animate-spin`} /> : "🧠"}</span>
    </Button>
  );
};

export default AiQuizzGenerator;
