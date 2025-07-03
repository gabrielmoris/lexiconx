"use client";
import { useLanguage } from "@/context/LanguageToLearnContext";
import React, { useEffect } from "react";
import WordCard from "./WordCard";
import { useLocale, useTranslations } from "next-intl";
import { useWords } from "@/context/WordsContext";
import LoadingComponent from "../Layout/LoadingComponen";
import { useSession } from "next-auth/react";
import { getUserData } from "@/lib/apis";
import { redirect, useRouter } from "next/navigation";
import { useToastContext } from "@/context/ToastContext";
import { signOut } from "next-auth/react";

const WordList = () => {
  const { isSelectedLanguageLoading } = useLanguage();
  const t = useTranslations("word-list");
  const { loading, words } = useWords();
  const { data: session, status } = useSession();
  const { showToast } = useToastContext();
  const locale = useLocale();
  const router = useRouter();

  // TODO: check if I can put this on the parent using SSR
  // fetch user data and redirect to /onbooarding if no learningProgress.length
  useEffect(() => {
    const fetchUser = async () => {
      if (status === "authenticated") {
        try {
          const { data } = await getUserData(session);
          if (data.learningProgress.length === 0) {
            router.push(`/${locale}/onboarding`);
          }
        } catch (e) {
          console.error(e);
          showToast({ message: t("error-getting-user"), variant: "error", duration: 3000 });
          await signOut();
          redirect("/");
        }
      } else if (status === "unauthenticated") {
        redirect("/");
      }
    };
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, showToast, t, router, locale]);

  if (loading || status === "loading") {
    return <LoadingComponent />;
  }

  if ((!words || words.length === 0) && isSelectedLanguageLoading === false) {
    return <div className="text-theme-text-light dark:text-theme-text-dark">{t("no-words")}</div>;
  }

  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-5">
      {words && words.map((word) => <WordCard key={word._id} word={word} />)}
    </section>
  );
};

export default WordList;
