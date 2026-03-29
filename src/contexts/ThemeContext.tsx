// <== IMPORTS ==>
import { createContext } from "react";
// <== THEME TYPE ==>
export type Theme = "light" | "dark";

// <== THEME CONTEXT TYPE ==>
export interface ThemeContextType {
  // <== CURRENT THEME ==>
  theme: Theme;
  // <== TOGGLE THEME ACTION ==>
  toggleTheme: () => void;
}

// <== THEME CONTEXT ==>
export const ThemeContext = createContext<ThemeContextType | null>(null);
