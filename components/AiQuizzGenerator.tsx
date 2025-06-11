"use client";
import React from "react";
import Button from "./UI/Button";
import { useTranslations } from "next-intl";

const AiQuizzGenerator = () => {
  const t = useTranslations("ai-quiz-generator");
  const generateQuiz = () => {
    console.log("generating quiz...");
  };

  return (
    <Button onClick={() => generateQuiz()} className="flex items-center justify-between px-5 max-w-48">
      {t("generate-quiz")} <span className="text-2xl font-extrabold">🧠</span>
    </Button>
  );
};

export default AiQuizzGenerator;
