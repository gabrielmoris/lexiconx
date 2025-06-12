"use client";
import React from "react";
import Button from "./UI/Button";
import { useTranslations } from "next-intl";
import { Word } from "@/types/Words";

const AiQuizzGenerator = ({ words }: { words: Word[] }) => {
  const t = useTranslations("ai-quiz-generator");
  const generateQuiz = () => {
    console.log(words);
  };

  return (
    <Button onClick={() => generateQuiz()} className="flex items-center justify-between px-5 max-w-48">
      {t("generate-quiz")} <span className="text-2xl font-extrabold">🧠</span>
    </Button>
  );
};

export default AiQuizzGenerator;
