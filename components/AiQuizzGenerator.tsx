"use client";
import { useCallback, useState } from "react";
import Button from "./UI/Button";
import { useTranslations } from "next-intl";
import LexiconxLogo from "./Icons/LexiconxLogo";
import { useToastContext } from "@/context/toastContext";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/context/LanguageToLearnContext";

const AiQuizzGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("ai-quiz-generator");
  const { data: session, status } = useSession();
  const { selectedLanguage } = useLanguage();

  const { showToast } = useToastContext();

  const generateQuiz = useCallback(() => {
    if (status === "authenticated") {
      setIsLoading(true);
      fetch("/api/ai-gen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session,
          selectedLanguage: selectedLanguage.language,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("DATA: ", data);
        })
        .catch(() => {
          showToast({
            message: t("error-generating quiz"),
            variant: "error",
            duration: 3000,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      showToast({
        message: t("error-generating quiz"),
        variant: "error",
        duration: 3000,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, selectedLanguage]);

  return (
    <Button onClick={() => generateQuiz()} className="flex items-center justify-between px-5 max-w-48">
      {t("generate-quiz")} <span className="text-2xl font-extrabold"> {isLoading ? <LexiconxLogo className={`w-8 h-8 animate-spin`} /> : "🧠"}</span>
    </Button>
  );
};

export default AiQuizzGenerator;
