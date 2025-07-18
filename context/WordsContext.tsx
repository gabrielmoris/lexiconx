"use client";
import { Word } from "@/types/Words";
import { createContext, useContext, useEffect, useState } from "react";
import { useToastContext } from "./ToastContext";
import { useSession } from "next-auth/react";
import { useLanguage } from "./LanguageToLearnContext";
import { deleteWordApi, fetchUserWords } from "@/lib/apis";

interface WordsContextType {
  words: Word[];
  setWords: (words: Word[]) => void;
  deleteWord: (words: Word) => void;
  loading: boolean;
}

const WordsContext = createContext<WordsContextType>({
  words: [],
  setWords: () => {},
  loading: false,
  deleteWord: () => {},
});

export const WordsProvider = ({ children }: { children: React.ReactNode }) => {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: session } = useSession();
  const { selectedLanguage, isSelectedLanguageLoading } = useLanguage();

  const { showToast } = useToastContext();

  useEffect(() => {
    if (session && !isSelectedLanguageLoading) {
      const fetchCards = async () => {
        try {
          const { data } = await fetchUserWords(session, selectedLanguage.language);
          setWords(data);
        } catch (err) {
          showToast({
            message: err instanceof Error ? err.message : "An unknown error occurred.",
            variant: "error",
            duration: 3000,
          });
        } finally {
          setLoading(false);
        }
      };
      setLoading(true);
      fetchCards();
    } else if (!session) {
      setLoading(false);
      setWords([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, selectedLanguage, isSelectedLanguageLoading]);

  const deleteWord = async (word: Word) => {
    if (!session) {
      showToast({
        message: "A session error occurred.",
        variant: "error",
        duration: 3000,
      });
      return;
    }

    try {
      await deleteWordApi(word, session);
      const filteredWords = words.filter((currWord) => currWord._id !== word._id);
      setWords(filteredWords);
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : "An unknown error occurred.",
        variant: "error",
        duration: 3000,
      });
    }
  };

  return <WordsContext.Provider value={{ words, setWords, loading, deleteWord }}>{children}</WordsContext.Provider>;
};

export const useWords = () => {
  const context = useContext(WordsContext);
  if (context === undefined) {
    throw new Error("useWords must be used within a WordsProvider");
  }
  return context;
};
