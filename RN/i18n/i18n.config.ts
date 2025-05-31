import * as SecureStore from "expo-secure-store";
import { initReactI18next } from "react-i18next";

import i18next from "i18next";
import { ar, en } from "./locales";

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

// i18next.use(initReactI18next).init({
//   resources,
//   debug: true,
//   lng: "en",
//   fallbackLng: "en",
//   interpolation: {
//     escapeValue: false,
//   },
//   compatibilityJSON: "v4",
// });
let initDone = false;
export const initI18n = async () => {
  if (!initDone) {
    const storedLang = await SecureStore.getItemAsync("isDarkMode");
    const defaultLang = storedLang ?? "en";

    await i18next.use(initReactI18next).init({
      resources,
      debug: true,
      lng: defaultLang,
      fallbackLng: "en",
      interpolation: {
        escapeValue: false,
      },
      compatibilityJSON: "v4",
    });

    initDone = true;
  }
};

// export default i18next;
