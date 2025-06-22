"use client";
import Button from "../UI/Button";
import { useTranslations } from "next-intl";
import LexiconxLogo from "../Icons/LexiconxLogo";
import { useQuiz } from "@/context/QuizContext";
import { useEffect, useRef } from "react";
import { useRouter } from "@/src/i18n/navigation";

const AiQuizzGenerator = () => {
  const t = useTranslations("ai-quiz-generator");
  const { generateQuiz, isLoading, quiz } = useQuiz();
  const route = useRouter();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    console.log("quiz", quiz); // TESTING PURPOSES: DELETE
    if (quiz.length > 0 && !isLoading && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      route.push("/quiz");
    }
  }, [quiz, route, isLoading]);

  const handleGenerateQuiz = () => {
    hasRedirectedRef.current = false;
    generateQuiz();
  };

  return (
    <Button disabled={isLoading} onClick={handleGenerateQuiz} className="flex items-center justify-between px-5 max-w-48">
      {t("generate-quiz")} <span className="text-2xl font-extrabold"> {isLoading ? <LexiconxLogo className={`w-8 h-8 animate-spin`} /> : "🧠"}</span>
    </Button>
  );
};

export default AiQuizzGenerator;
