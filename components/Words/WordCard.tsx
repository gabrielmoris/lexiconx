import formatMongoDate from "@/lib/dateFormat";
import { textToSpeech } from "@/lib/textToSpeech";
import { Word } from "@/types/Words";
import { useTranslations } from "next-intl";
import React from "react";

const WordCard = ({ word }: { word: Word }) => {
  const t = useTranslations("word-card");

  const readWord = (text: string, language: string) => {
    textToSpeech(text, language as "chinese" | "english" | "german" | "spanish");
  };

  return (
    <div
      className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 
                 rounded-lg shadow-sm p-4 mb-4 flex flex-col space-y-2
                 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-4 mb-2">
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">{word.word}</h3>
        {word.phoneticNotation && <p className="text-md text-gray-600 dark:text-gray-400">[{word.phoneticNotation}]</p>}
        <button
          className="hover:bg-theme-fg-light rounded-md hover:dark:bg-theme-fg-dark cursor-pointer transition-colors duration-200"
          onClick={() => readWord(word.word, word.language)}
        >
          🎧
        </button>
      </div>

      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
        <span className="font-semibold text-gray-500 dark:text-gray-400 mr-1">{t("definition")}:</span> {word.definition}
      </p>

      <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
        {word.lastReviewed && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">{t("last-reviewed")}:</span> {formatMongoDate(word.lastReviewed)}
          </p>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-medium">{t("next-review")}:</span> {formatMongoDate(word.nextReview)}
        </p>
      </div>
    </div>
  );
};

export default WordCard;
