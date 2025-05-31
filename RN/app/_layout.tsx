import { router, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FontScaleProvider } from "../context/fontScaleContext";
import { SelectionProvider } from "../context/selectionContext";
import { ThemeProvider } from "../context/ThemeContext";
import "../i18n/i18n.config";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const { i18n } = useTranslation();

  useEffect(() => {
    const onFirstAppOpened = async () => {
      const lang = await SecureStore.getItemAsync("language");
      if (lang) {
        i18n.changeLanguage(lang);
      }
      const isFirstTime = await SecureStore.getItemAsync("isFirstTime");
      setIsReady(true);
      if (isFirstTime !== null) {
        router.replace("/home");
      }
    };

    onFirstAppOpened();
  }, []);

  // if (!isReady) return null;

  return (
    <ThemeProvider>
      <FontScaleProvider>
        <SelectionProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="home" options={{ headerShown: false }} />
            <Stack.Screen name="preferences" options={{ headerShown: false }} />
          </Stack>
        </SelectionProvider>
      </FontScaleProvider>
    </ThemeProvider>
  );
}
