"use client";
import Button from "../UI/Button";
import { useTranslations } from "next-intl";
import LexiconxLogo from "../Icons/LexiconxLogo";
import { useQuiz } from "@/context/QuizContext";
import { useEffect } from "react";

const AiQuizzGenerator = () => {
  const t = useTranslations("ai-quiz-generator");
  const { generateQuiz, isLoading, quiz } = useQuiz();

  useEffect(() => {
    console.log("Called", quiz);
  }, [quiz]);

  return (
    <Button onClick={() => generateQuiz()} className="flex items-center justify-between px-5 max-w-48">
      {t("generate-quiz")} <span className="text-2xl font-extrabold"> {isLoading ? <LexiconxLogo className={`w-8 h-8 animate-spin`} /> : "🧠"}</span>
    </Button>
  );
};

export default AiQuizzGenerator;
