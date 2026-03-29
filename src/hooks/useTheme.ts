// <== IMPORTS ==>
import { useContext } from "react";
import { ThemeContext, ThemeContextType } from "@/contexts/ThemeContext";

// <== USE THEME HOOK ==>
export const useTheme = (): ThemeContextType => {
  // GETTING THEME CONTEXT
  const ctx = useContext(ThemeContext);
  // THROWING ERROR IF USED OUTSIDE PROVIDER
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  // RETURNING CONTEXT
  return ctx;
};
