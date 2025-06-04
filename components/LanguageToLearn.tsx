import { useTranslations } from "next-intl";
import ChinaFlag from "./Icons/ChinaFlag";
import EnglishFlag from "./Icons/EnglishFlag";
import GermanFlag from "./Icons/GermanFlag";
import React, { useState, useRef, useEffect } from "react";

const LanguageToLearn = () => {
  const t = useTranslations("languageToLearn");

  interface LanguageOption {
    language: "german" | "chinese" | "english";
    icon: React.ComponentType<{ className?: string }>;
    name: string;
  }

  const languages: LanguageOption[] = [
    { language: "chinese", icon: ChinaFlag, name: t("chinese") },
    { language: "german", icon: GermanFlag, name: t("german") },
    { language: "english", icon: EnglishFlag, name: t("english") },
  ];

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption | null>(null);
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
    if (selectedLanguage) {
      console.log(selectedLanguage?.language);
      localStorage.setItem("language", selectedLanguage?.language);
    }
  }, [selectedLanguage]);

  useEffect(() => {
    const language = localStorage.getItem("language");

    const selected = languages.find((lang) => lang.language === language);
    setSelectedLanguage(selected || languages[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (language: LanguageOption) => {
    setSelectedLanguage(language);
    setIsOpen(false);
  };

  const SelectedLanguageIcon = selectedLanguage?.icon;

  return (
    <div className="w-full max-w-sm md:border rounded-sm p-5 relative" ref={dropdownRef}>
      <h1 className="text-xl font-bold">{t("title")}</h1>

      {/* Custom Button that acts as the visible dropdown because dropdown doesn't accept img as an option */}
      <div
        className="mt-4 cursor-pointer px-4 py-2 border bg-theme-fg-light text-theme-text-light w-full dark:bg-theme-fg-dark dark:text-white rounded flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0} // Make it focusable
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {SelectedLanguageIcon ? <SelectedLanguageIcon className="w-6 h-6" /> : null}
          <span>{selectedLanguage?.name}</span>
        </div>
        {isOpen ? "▲" : "▼"}
      </div>

      {isOpen && (
        <ul
          className="absolute z-10 w-full mt-1 border bg-theme-fg-light dark:bg-theme-fg-dark rounded shadow-lg overflow-hidden"
          role="listbox" // Indicate it's a listbox
          tabIndex={-1} // Make it programmatically focusable
        >
          {languages.map((lang) => (
            <li
              key={lang.language}
              className={`px-4 py-2 flex items-center gap-2 cursor-pointer ${
                selectedLanguage?.language === lang.language
                  ? "bg-blue-100 dark:bg-blue-700 text-blue-900 dark:text-white"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => handleSelect(lang)}
              role="option"
              aria-selected={selectedLanguage?.language === lang.language}
            >
              <lang.icon className="w-6 h-6" />
              <span>{lang.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageToLearn;
