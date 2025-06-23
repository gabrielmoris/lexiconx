"use client";
import Button from "../UI/Button";
import { useTranslations } from "next-intl";
import LexiconxLogo from "../Icons/LexiconxLogo";
import { useQuiz } from "@/context/QuizContext";
import { useRouter } from "@/src/i18n/navigation";

const AiQuizzGenerator = () => {
  const t = useTranslations("ai-quiz-generator");
  const { generateQuiz, isLoading } = useQuiz();
  const route = useRouter();

  const handleGenerateQuiz = () => {
    generateQuiz().then((res) => {
      if (res?.success) {
        route.push("/quiz");
      }
    });
  };

  return (
    <Button disabled={isLoading} onClick={handleGenerateQuiz} className="flex items-center justify-between px-5 max-w-48">
      {t("generate-quiz")} <span className="text-2xl font-extrabold"> {isLoading ? <LexiconxLogo className={`w-8 h-8 animate-spin`} /> : "🧠"}</span>
    </Button>
  );
};

export default AiQuizzGenerator;
