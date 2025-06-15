"use client";
import { Word } from "@/types/Words";
import { createContext, useContext, useEffect, useState } from "react";
import { useToastContext } from "./ToastContext";
import { useSession } from "next-auth/react";
import { useLanguage } from "./LanguageToLearnContext";

interface WordsContextType {
  words: Word[];
  setWords: (words: Word[]) => void;
  loading: boolean;
}

const WordsContext = createContext<WordsContextType>({
  words: [],
  setWords: () => {},
  loading: false,
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
          const response = await fetch(`/api/words?language=${selectedLanguage.language}&email=${session.user?.email}`);

          if (!response.ok) {
            throw new Error("Something went wrong and the cards could not be fetched.");
          }

          const { data } = await response.json();
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

  return <WordsContext.Provider value={{ words, setWords, loading }}>{children}</WordsContext.Provider>;
};

export const useWords = () => {
  const context = useContext(WordsContext);
  if (context === undefined) {
    throw new Error("useWords must be used within a WordsProvider");
  }
  return context;
};
