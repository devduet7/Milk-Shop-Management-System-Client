// <== IMPORTS ==>
import { Theme, ThemeContext } from "./ThemeContext";
import { memo, useEffect, useState, useCallback } from "react";

// <== THEME PROVIDER PROPS INTERFACE ==>
interface ThemeProviderProps {
  // <== CHILDREN ==>
  children: React.ReactNode;
}

// <== THEME PROVIDER COMPONENT ==>
const ThemeProvider = memo(({ children }: ThemeProviderProps) => {
  // INITIALIZING THEME FROM LOCAL STORAGE OR DEFAULTING TO LIGHT
  const [theme, setTheme] = useState<Theme>(() => {
    // GETTING STORED THEME FROM LOCAL STORAGE
    const stored = localStorage.getItem("milk_shop_theme");
    // RETURNING STORED THEME OR DEFAULT
    return (stored as Theme) || "light";
  });
  // SYNC THEME CLASS AND PERSIST TO LOCAL STORAGE
  useEffect(() => {
    // TOGGLING DARK CLASS ON ROOT ELEMENT
    document.documentElement.classList.toggle("dark", theme === "dark");
    // PERSISTING THEME TO LOCAL STORAGE
    localStorage.setItem("milk_shop_theme", theme);
  }, [theme]);
  // TOGGLE THEME ACTION
  const toggleTheme = useCallback((): void => {
    // TOGGLING THEME
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);
  // RETURNING PROVIDER
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
});
// <== DISPLAY NAME FOR DEVTOOLS ==>
ThemeProvider.displayName = "ThemeProvider";
// <== EXPORT ==>
export { ThemeProvider };
