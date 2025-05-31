import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";


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

  useEffect(() => {
    const loadFontScale = async () => {
      let tmpFontScaleIdx = await SecureStore.getItemAsync("fontScaleIndex");
      if (tmpFontScaleIdx)
        setScaleIndex(parseInt(tmpFontScaleIdx));
      else
        setScaleIndex(1);
    };
    loadFontScale();
  }, []);

  useEffect(() => {
    const saveFontScale = async () => {
      await SecureStore.setItemAsync("fontScaleIndex", `${scaleIndex}`);
    };
    saveFontScale();
  }, [scaleIndex]);

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
