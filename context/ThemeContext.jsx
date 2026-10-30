import { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { LIGHT_COLORS, DARK_COLORS } from "../constants/colors";

const THEME_STORAGE_KEY = "app_theme_mode_v1";

const ThemeContext = createContext({
  theme: "light",
  isDark: false,
  colors: LIGHT_COLORS,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState("light");

  useEffect(() => {
    const loadTheme = async () => {
      try {
        if (Platform.OS !== "web") {
          const savedTheme = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
          if (savedTheme === "dark" || savedTheme === "light") {
            setThemeState(savedTheme);
          }
        } else if (typeof window !== "undefined" && window.localStorage) {
          const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
          if (savedTheme === "dark" || savedTheme === "light") {
            setThemeState(savedTheme);
          }
        }
      } catch (err) {
        console.warn("Could not load theme:", err);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (newTheme) => {
    if (newTheme !== "light" && newTheme !== "dark") return;
    setThemeState(newTheme);
    try {
      if (Platform.OS !== "web") {
        await SecureStore.setItemAsync(THEME_STORAGE_KEY, newTheme);
      } else if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      }
    } catch (err) {
      console.warn("Could not save theme:", err);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  const isDark = theme === "dark";
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <ThemeContext.Provider value={{ theme, isDark, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

