import React, { createContext, ReactNode, useContext, useState } from 'react';

const FONT_SCALES = [0.8, 1, 1.2, 1.4, 1.6];

type FontScaleContextType = {
  fontScale: number;
  increaseFont: () => void;
  decreaseFont: () => void;
};

const FontScaleContext = createContext<FontScaleContextType>({
  fontScale: 1,
  increaseFont: () => {},
  decreaseFont: () => {},
});

export const useFontScale = () => useContext(FontScaleContext);

export const FontScaleProvider = ({ children }: { children: ReactNode }) => {
  const [scaleIndex, setScaleIndex] = useState(1); // default is 1 (index of 1)

  const increaseFont = () => {
    setScaleIndex((prev) => Math.min(prev + 1, FONT_SCALES.length - 1));
  };

  const decreaseFont = () => {
    setScaleIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <FontScaleContext.Provider
      value={{
        fontScale: FONT_SCALES[scaleIndex],
        increaseFont,
        decreaseFont,
      }}
    >
      {children}
    </FontScaleContext.Provider>
  );
};