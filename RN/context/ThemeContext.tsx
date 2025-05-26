import React, { createContext, ReactNode, useState } from "react";

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
