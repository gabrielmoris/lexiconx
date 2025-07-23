"use client";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import React, { useEffect, useState } from "react";
import ChinaFlag from "@/components/Icons/ChinaFlag";
import EnglishFlag from "@/components/Icons/EnglishFlag";
import GermanFlag from "@/components/Icons/GermanFlag";
import SpanishFlag from "@/components/Icons/SpanishFlag";
import RussianFlag from "@/components/Icons/RussianFlag";
import { Language } from "@/types/Words";
import { useTranslations } from "next-intl";

const languages = {
  English: { icon: EnglishFlag },
  Deutsch: { icon: GermanFlag },
  中文: { icon: ChinaFlag },
  Español: { icon: SpanishFlag },
  русский: { icon: RussianFlag },
};

const ShowLearningFlag: React.FC = () => {
  const [flagInfo, setFlagInfo] = useState<{ icon: React.FC<{ className?: string }> } | undefined>();
  const { userData, status } = useAuthGuard();
  const t = useTranslations("show-learning-flag");

  useEffect(() => {
    if (status === "authenticated" && !!userData) {
      setFlagInfo(languages[userData.activeLanguage as Language]);
    }
  }, [status, userData]);

  return (
    <div className="flex flex-row gap-5 justify-center items-center">
      <span>{t("currently-learning")}:</span> {flagInfo && <flagInfo.icon className="w-10" />}
    </div>
  );
};

export default ShowLearningFlag;
