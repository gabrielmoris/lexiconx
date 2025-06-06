import { LanguageOption, useLanguage } from "@/context/LanguageToLearnContext";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React, { useState, useRef, useEffect } from "react";

const LanguageToLearn = ({ className }: { className?: string }) => {
  const t = useTranslations("languageToLearn");
  const { selectedLanguage, setSelectedLanguage, languages } = useLanguage();

  const { data: session, status } = useSession();

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

  const handleSelect = async (language: LanguageOption) => {
    setSelectedLanguage(language);
    const apiCall = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        activeLanguage: language.language,
        session,
      }),
    });

    const response = await apiCall.json();

    console.log("mirrorResponse", response);

    setIsOpen(false);
  };

  const SelectedLanguageIcon = selectedLanguage?.icon;

  if (status === "loading") {
    return null; // LoadingComponent
  }

  return (
    <div className={`w-full max-w-sm md:border rounded-sm p-5 relative ${className || ""}`} ref={dropdownRef}>
      <h1 className="text-xl font-bold">{t("title")}</h1>

      {/* Custom Button that acts as the visible dropdown because dropdown doesn't accept img as an option */}
      <div
        className="mt-4 cursor-pointer px-4 py-2 border bg-theme-fg-light text-theme-text-light w-full dark:bg-theme-fg-dark dark:text-white rounded flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0} // Make it focusable
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onKeyDown={(e) => {
          // Keyboard navigation for accessibility
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
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
          aria-labelledby="selected-language-button"
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
              tabIndex={0} // Make each option focusable
              onKeyDown={(e) => {
                // Keyboard navigation for options
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelect(lang);
                }
              }}
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
