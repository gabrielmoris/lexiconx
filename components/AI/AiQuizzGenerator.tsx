"use client";
import Button from "../UI/Button";
import { useTranslations } from "next-intl";
import LexiconxLogo from "../Icons/LexiconxLogo";
import { useQuiz } from "@/context/QuizContext";
import { useEffect } from "react";
import { useRouter } from "@/src/i18n/navigation";

const AiQuizzGenerator = () => {
  const t = useTranslations("ai-quiz-generator");
  const { generateQuiz, isLoading, quiz } = useQuiz();
  const route = useRouter();

  useEffect(() => {
    console.log("quiz", quiz);
    if (quiz.length > 0) {
      route.push("/quiz");
    }
  }, [quiz, route]);

  return (
    <Button disabled={isLoading} onClick={() => generateQuiz()} className="flex items-center justify-between px-5 max-w-48">
      {t("generate-quiz")} <span className="text-2xl font-extrabold"> {isLoading ? <LexiconxLogo className={`w-8 h-8 animate-spin`} /> : "🧠"}</span>
    </Button>
  );
};

export default AiQuizzGenerator;
