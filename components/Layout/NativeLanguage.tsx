"use client";

import { useToastContext } from "@/context/ToastContext";
import { useSession } from "next-auth/react";
import { Locale, useLocale, useTranslations } from "next-intl";
import React, { useState, useRef, useEffect, useCallback } from "react";
// Import all necessary assets from your files
import { languages } from "../Onboarding/LocaleSwitcher";
import LoadingComponent from "./LoadingComponen";
import { locales } from "@/src/i18n/routing";
import { Locale as ILocale, Language } from "@/types/Words";
import { updateUserData } from "@/lib/apis";
import { Link, usePathname } from "@/src/i18n/navigation";

type ILanguage = (typeof languages)[keyof typeof languages];

const NativeLanguage = ({ className }: { className?: string }) => {
  const currentLocale = useLocale() as ILocale;
  const [selectedLanguage, setSelectedLanguage] = useState<ILanguage>(languages[currentLocale]);
  const t = useTranslations("NativeLanguage");
  const { showToast } = useToastContext();
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const languageByLocale = languages[currentLocale];
    if (languageByLocale) {
      setSelectedLanguage(languageByLocale);
    }
  }, [currentLocale]);

  const handleSelect = useCallback(
    async (language: ILanguage) => {
      setSelectedLanguage(language);
      setIsOpen(false);

      try {
        if (!session) throw new Error("Session not found");
        await updateUserData(session, { nativeLanguage: language.name as Language });
      } catch (error) {
        console.error("Failed to select language:", error);
        showToast({
          message: t("error-changing-language"),
          variant: "error",
          duration: 3000,
        });
      }
    },
    [session, showToast, t]
  );

  const SelectedLanguageIcon = selectedLanguage?.icon;

  if (status === "loading") {
    return <LoadingComponent />;
  }

  return (
    <div className={`p-2 relative ${className || ""}`} ref={dropdownRef}>
      <div
        className="cursor-pointer gap-2   rounded flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby="selected-language-button" // Add a unique ID for ARIA
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <div className="flex items-center">{SelectedLanguageIcon ? <SelectedLanguageIcon className="w-6 h-6" /> : null}</div>
        {isOpen ? "▲" : "▼"}
      </div>

      {isOpen && (
        <ul
          className="absolute z-10 w-full mt-1 border bg-theme-fg-light dark:bg-theme-fg-dark rounded shadow-lg overflow-hidden"
          role="listbox"
          tabIndex={-1}
        >
          {locales.map((langKey: Locale) => {
            const lang = languages[langKey as "en" | "es" | "de" | "zh"];
            if (!lang) return null;
            const LanguageIcon = lang.icon;
            return (
              <Link
                href={`/${pathname.split("/")[1]}`}
                locale={langKey}
                key={langKey}
                className={`px-4 py-2 flex items-center gap-2 cursor-pointer ${
                  selectedLanguage?.name === lang.name
                    ? "bg-blue-100 dark:bg-blue-700 text-blue-900 dark:text-white"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => handleSelect(lang)}
                role="option"
                aria-selected={selectedLanguage?.name === lang.name}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect(lang);
                  }
                }}
              >
                {LanguageIcon && <LanguageIcon className="w-6 h-6" />}
              </Link>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default NativeLanguage;
