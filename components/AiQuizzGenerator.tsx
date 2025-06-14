"use client";
import { useState } from "react";
import Button from "./UI/Button";
import { useTranslations } from "next-intl";
import LexiconxLogo from "./Icons/LexiconxLogo";
import { useToastContext } from "@/context/toastContext";

const AiQuizzGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("ai-quiz-generator");

  const { showToast } = useToastContext();

  const generateQuiz = () => {
    setIsLoading(true);
    fetch("/api/ai-gen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // words, // Send UserID instead and query the words from the DB
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      })
      .catch(() => {
        showToast({
          message: t("error-generating quiz"),
          variant: "error",
          duration: 3000,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Button onClick={() => generateQuiz()} className="flex items-center justify-between px-5 max-w-48">
      {t("generate-quiz")} <span className="text-2xl font-extrabold"> {isLoading ? <LexiconxLogo className={`w-8 h-8 animate-spin`} /> : "🧠"}</span>
    </Button>
  );
};

export default AiQuizzGenerator;
