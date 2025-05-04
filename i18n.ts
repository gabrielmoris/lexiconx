// i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: false,
    interpolation: { escapeValue: false },
    resources: {
      en: {
        translation: {
          welcome: "Welcome to the Vocabulary App",
        },
      },
      fr: {
        translation: {
          welcome: "Bienvenue dans l'application de vocabulaire",
        },
      },
      de: {
        translation: {
          welcome: "Willkommen in der Vokabel-App",
        },
      },
    },
  });

export default i18n;
