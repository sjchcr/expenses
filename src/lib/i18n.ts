import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "@/locales/en.json";
import es from "@/locales/es.json";

const LANGUAGE_KEY = "language-preference";

const languageDetector = new LanguageDetector();

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "es"],
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: LANGUAGE_KEY,
    },
    interpolation: {
      escapeValue: false,
    },
  });

// Change language and save to localStorage
// The Settings page will sync this with the database
export const changeLanguage = async (lng: string) => {
  localStorage.setItem(LANGUAGE_KEY, lng);
  await i18n.changeLanguage(lng);
};

export const getCurrentLanguage = () => i18n.language;

export default i18n;
