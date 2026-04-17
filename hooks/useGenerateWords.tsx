import { useWords } from "@/context/WordsContext";
import { addWordToDatabase, wordsGeneration } from "@/lib/apis";
import { Language, Word } from "@/types/Words";
import { useState } from "react";
import { useAuthGuard } from "./useAuthGuard";
import { useLanguage } from "@/context/LanguageToLearnContext";
import { useToastContext } from "@/context/ToastContext";
import { useLocale, useTranslations } from "next-intl";

export const useGenerateWords = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setWords, words } = useWords();
  const { status, session, userData } = useAuthGuard();
  const { selectedLanguage } = useLanguage();
  const { showToast } = useToastContext();
  const t = useTranslations("generate-words");
  const currentLocale = useLocale();

  const generateWords = async () => {
    if (status !== "authenticated" || !session) return { success: false };
    
    setIsLoading(true);
    const learningProgress = userData?.learningProgress.find(
      (lp) => lp.language === selectedLanguage.language
    );

    try {
      if (!learningProgress) throw new Error("Learning progress not found");

      const { words: newWords } = await wordsGeneration(
        session,
        selectedLanguage.language,
        currentLocale as Language,
        learningProgress.level
      );

      await Promise.all(
        newWords.map((word: Word) => addWordToDatabase({ ...word, session }))
      );

      setWords([ ...newWords,...words]);
      showToast({ message: t("words-generated-success"), variant: "success", duration: 3000, });

      return { success: true };
    } catch {
      showToast({ message: t("error-generating-words"), variant: "error", duration: 3000, });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return { generateWords, isLoading };
};
