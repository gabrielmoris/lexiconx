"use client";

import {useTranslations } from "next-intl";
import React from "react";
import LexiconxLogo from "../Icons/LexiconxLogo";
import WordAiIcon from "../Icons/WordAIIcon";
import Button from "../UI/Button";

import { useGenerateWords } from "@/hooks/useGenerateWords";

export const AiGenerateVocabulary = () => {
  const { generateWords, isLoading } = useGenerateWords();
  const t = useTranslations("generate-words");

  return (
    <Button onClick={generateWords} disabled={isLoading} className="flex items-center justify-between px-5 w-full">
      {t("generate-words")}
      <span className="text-2xl font-extrabold">
        {isLoading ? <LexiconxLogo className={`w-8 h-8 animate-spin`} /> : <WordAiIcon className="w-6 h-6" />}
      </span>
    </Button>
  );
};
