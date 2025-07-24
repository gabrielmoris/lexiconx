"use client";
import { useLanguage } from "@/context/LanguageToLearnContext";
import React from "react";
import WordCard from "./WordCard";
import { useTranslations } from "next-intl";
import { useWords } from "@/context/WordsContext";
import LoadingComponent from "../Layout/LoadingComponen";

const WordList = () => {
  const { isSelectedLanguageLoading } = useLanguage();
  const t = useTranslations("word-list");
  const { loading, words } = useWords();

  if (loading) {
    return <LoadingComponent />;
  }

  if ((!words || words.length === 0) && isSelectedLanguageLoading === false) {
    return <div className="text-theme-text-light dark:text-theme-text-dark">{t("no-words")}</div>;
  }

  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-5">
      {words && words.map((word) => <WordCard key={word._id} word={word} />)}
    </section>
  );
};

export default WordList;
