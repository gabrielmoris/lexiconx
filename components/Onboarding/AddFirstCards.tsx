import { useTranslations } from "next-intl";
import React from "react";
import WordForm from "../Words/WordForm";
import WordList from "../Words/WordList";

const AddFirstCards = () => {
  const t = useTranslations("add-first-cards");

  return (
    <section className="flex flex-col items-center justify-center min-h-72 lg:min-h-96 w-72 lg:w-96 gap-10 mb-10">
      <p className="text-2xl font-bold text-center z-10">{t("title")}</p>
      <WordForm className="w-full" isOpen />
      <WordList />
    </section>
  );
};

export default AddFirstCards;
