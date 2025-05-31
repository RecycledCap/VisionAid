import * as SecureStore from "expo-secure-store";
import React, { createContext, ReactNode, useEffect, useState } from "react";

export type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDMode, setisDMode] = useState(false);

  const toggleTheme = () => {
    setisDMode(!isDMode);
  };

  useEffect(() => {
    const loadTheme = async () => {
      const tempIsDMode = await SecureStore.getItemAsync("isDarkMode");
      setisDMode(tempIsDMode == "yes");
    };
    loadTheme();
  }, []);

  useEffect(() => {
    const saveIsDMode = async () => {
      await SecureStore.setItemAsync("isDarkMode", `${isDMode ? "yes" : "no"}`);
    };
    saveIsDMode();
  }, [isDMode]);

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode: isDMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
