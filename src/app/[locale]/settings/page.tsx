import { ThemeSwitcher } from "@/components/Layout/ThemeSwitcher";
import { useTranslations } from "next-intl";
import React from "react";

const SettingsPage = () => {
  const t = useTranslations("settings");
  return (
    <main className="p-5 w-full md:w-1/2">
      <h1 className="text-xl md:text-2xl font-bold w-full text-center mb-10">{t("title")}</h1>
      <section className="flex flex-col gap-5 w-full items-center justify-center">
        <div className="flex flex-row items-center justify-between border-b border-bg-theme-fg-light dark:border-theme-fg-dark w-1/2">
          <p>{t("mode")}</p>
          <ThemeSwitcher />
        </div>
        <div className="flex flex-row items-center justify-between border-b border-bg-theme-fg-light dark:border-theme-fg-dark w-1/2">
          {/* TODO: Native lanugage, learning language, delete account,  */}
        </div>
      </section>
    </main>
  );
};

export default SettingsPage;
