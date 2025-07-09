"use client";
import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import ChinaFlag from "@/components/Icons/ChinaFlag";
import EnglishFlag from "@/components/Icons/EnglishFlag";
import GermanFlag from "@/components/Icons/GermanFlag";
import { useTranslations } from "next-intl";
import SpanishFlag from "@/components/Icons/SpanishFlag";
import { Language } from "@/types/Words";

export interface LanguageOption {
  language: Language;
  icon: React.ComponentType<{ className?: string }>;
  name: string;
}

interface LanguageContextType {
  selectedLanguage: LanguageOption;
  setSelectedLanguage: (language: LanguageOption) => void;
  languages: LanguageOption[];
  isSelectedLanguageLoading: boolean;
}

const LanguageToLearnContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * LanguageProvider component to wrap your application or specific parts.
 * It manages the selected language state using localStorage and provides it via Context.
 * @param children The React nodes to be rendered within the provider's scope.
 */

export function LanguageToLearnProvider({ children }: { children: ReactNode }) {
  const t = useTranslations("languageToLearn");

  const languages: LanguageOption[] = useMemo(
    () => [
      { language: "中文", icon: ChinaFlag, name: t("chinese"), tts: "zh-CN" },
      { language: "Deutsch", icon: GermanFlag, name: t("german"), tts: "de-DE" },
      { language: "English", icon: EnglishFlag, name: t("english"), tts: "en-US" },
      { language: "Español", icon: SpanishFlag, name: t("spanish"), tts: "es-ES" },
    ],
    [t]
  );

  const { storedValue: storedLangCode, setValue: setStoredLangCode } = useLocalStorage<LanguageOption["language"]>("language", languages[0].language);
  const [isSelectedLanguageLoading, setIsSelectedLanguageLoading] = useState(true);

  const selectedLanguage = useMemo(() => {
    return languages.find((lang) => lang.language === storedLangCode) || languages[0];
  }, [storedLangCode, languages]);

  useEffect(() => {
    if (storedLangCode !== undefined) {
      setIsSelectedLanguageLoading(false);
    }
  }, [storedLangCode]);

  const setSelectedLanguage = (language: LanguageOption) => {
    setStoredLangCode(language.language);
  };

  const contextValue = useMemo(
    () => ({
      selectedLanguage,
      setSelectedLanguage,
      languages,
      isSelectedLanguageLoading,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedLanguage, languages, isSelectedLanguageLoading]
  );

  return <LanguageToLearnContext.Provider value={contextValue}>{children}</LanguageToLearnContext.Provider>;
}

/**
 * Custom hook to consume the LanguageContext.
 * Throws an error if used outside of a LanguageProvider.
 * @returns The LanguageContextType value.
 */
export function useLanguage() {
  const context = useContext(LanguageToLearnContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
