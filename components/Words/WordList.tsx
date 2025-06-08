"use client";
import { useLanguage } from "@/context/LanguageToLearnContext";
import { useToastContext } from "@/context/toastContext";
import { Word } from "@/types/Words";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import WordCard from "./WordCard";

const WordList = () => {
  const { data: session } = useSession();
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedLanguage } = useLanguage();

  const { showToast } = useToastContext();

  useEffect(() => {
    if (session) {
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

      fetchCards();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  if (loading) {
    return <div>Loading...</div>;
  }

  console.log(words);

  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-5">
      {words && words.map((word) => <WordCard key={word._id} word={word} />)}
    </section>
  );
};

export default WordList;
