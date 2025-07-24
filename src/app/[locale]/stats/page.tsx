"use client";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { LearningProgress } from "@/types/Words";

const StatsPage = () => {
  const t = useTranslations("stats");
  const { userData, status } = useAuthGuard();
  const [userInfo, setUserInfo] = useState<LearningProgress>();

  const locale = useLocale();

  useEffect(() => {
    if (status === "authenticated" && !!userData) {
      const languageInfo = userData.learningProgress.find((learningLanguage) => learningLanguage.language === userData.activeLanguage);
      if (!languageInfo) {
        return;
      }
      setUserInfo(languageInfo);
      console.log(languageInfo);
    }
  }, [status, userData]);

  return (
    <main className="flex items-center justify-center py-20 px-4 md:w-xl md:p-20">
      <div className="w-full max-w-xl border border-theme-bg-light dark:border-theme-bg-dark rounded-lg shadow-lg p-6 space-y-5">
        <h1 className="text-3xl font-extrabold text-center pb-4 border-b border-theme-bg-light dark:border-theme-bg-dark">{t("title")}</h1>

        <div className="space-y-4">
          <StatItem label={t("current-streak")} value={userInfo?.currentStreak} />
          <StatItem label={t("learning-language")} value={userInfo?.language} />
          {userInfo?.lastSessionDate && (
            <StatItem
              label={t("last-session")}
              value={new Date(userInfo?.lastSessionDate).toLocaleDateString(locale === "en" ? locale + "-uk" : locale)}
            />
          )}
          <StatItem label={t("learning-level")} value={userInfo?.level} />
          {userInfo?.timeSpent && <StatItem label={t("time-spent")} value={`${(userInfo?.timeSpent / 3600000).toFixed(2)} ${t("hours")}`} />}
          <StatItem label={t("words-mastered")} value={userInfo?.wordsMastered} />
        </div>
      </div>
    </main>
  );
};

const StatItem = ({ label, value }: { label: string | undefined; value: string | number | undefined }) => {
  if (!value || !label) return;
  return (
    <p className="flex justify-between items-center text-lgn border-b dark:border-theme-fg-dark border-theme-fg-light">
      <span className="font-semibold">{label}:</span>
      <span className="font-medium">{value}</span>
    </p>
  );
};

export default StatsPage;
