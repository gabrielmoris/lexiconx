// AiGenerateVocabulary.jsx
"use client";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useLocale, useTranslations } from "next-intl";
import React, { useState } from "react";
import LexiconxLogo from "../Icons/LexiconxLogo";
import WordAiIcon from "../Icons/WordAIIcon";
import Button from "../UI/Button";
import { useLanguage } from "@/context/LanguageToLearnContext";
import { useToastContext } from "@/context/ToastContext";
import { Language, Word } from "@/types/Words";
import { addword, wordsGeneration } from "@/lib/apis";
import { useWords } from "@/context/WordsContext";

const AiGenerateVocabulary = () => {
  const [isLoading, setIsLoading] = useState(false);

  const t = useTranslations("generate-words");
  const { setWords, words } = useWords();
  const { status, session, userData } = useAuthGuard();
  const { selectedLanguage } = useLanguage();
  const { showToast } = useToastContext();
  const currentLocale = useLocale();

  const handleGenerateWords = async () => {
    if (status === "authenticated" && session) {
      setIsLoading(true);
      const learningProgress = userData?.learningProgress.find((lp) => lp.language === selectedLanguage.language);

      try {
        if (!learningProgress) {
          throw new Error("Learning progress not found");
        }

        const { words: newWordsGenerated } = await wordsGeneration(
          session,
          selectedLanguage.language,
          currentLocale as Language,
          learningProgress.level
        );

        const addWordPromises = newWordsGenerated.map(async (word: Word) => {
          const { data: wordToAdd } = await addword({ ...word, session });
          return wordToAdd;
        });

        const addedWords = await Promise.all(addWordPromises);

        setWords([...words, ...addedWords]);

        showToast({
          message: t("words-generated-success"),
          variant: "success",
          duration: 3000,
        });

        return { success: true };
      } catch (error) {
        console.error("Error generating words:", error);
        showToast({
          message: t("error-generating words"),
          variant: "error",
          duration: 3000,
        });
        return { success: false };
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Button disabled={isLoading} onClick={handleGenerateWords} className="flex items-center justify-between px-5 w-full">
      {t("generate-words")}
      <span className="text-2xl font-extrabold">
        {isLoading ? <LexiconxLogo className={`w-8 h-8 animate-spin`} /> : <WordAiIcon className="w-6 h-6" />}
      </span>
    </Button>
  );
};

export default AiGenerateVocabulary;
