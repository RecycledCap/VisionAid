import { router, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { FontScaleProvider } from "../context/fontScaleContext";
import { SelectionProvider } from "../context/selectionContext";
import { ThemeProvider } from "../context/ThemeContext";
import { initI18n } from "../i18n/i18n.config";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const onFirstAppOpened = async () => {
      await initI18n();

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
