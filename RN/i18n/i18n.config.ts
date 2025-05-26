import { initReactI18next } from "react-i18next";

import i18next from "i18next";
import { ar, en } from "./locales";

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

i18next.use(initReactI18next).init({
  resources,
  debug: true,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: "v4",
});

export default i18next;
