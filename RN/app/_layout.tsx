import { Stack } from "expo-router";
import { FontScaleProvider } from "../context/fontScaleContext";
import { ThemeProvider } from "../context/ThemeContext";
import "../i18n/i18n.config";
import "./globals.css";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <FontScaleProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </FontScaleProvider>
    </ThemeProvider>
  );
}
