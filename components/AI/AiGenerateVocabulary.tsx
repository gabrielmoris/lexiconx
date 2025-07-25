"use client";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useTranslations } from "next-intl";
import React from "react";

const AiGenerateVocabulary = () => {
  const t = useTranslations("generate-words");
  const { userData } = useAuthGuard();
  return <div>{t("generate-words")}</div>;
};

export default AiGenerateVocabulary;
