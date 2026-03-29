// <== IMPORTS ==>
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

// <== MERGING CLASSES UTILITY FUNCTION ==>
export function cn(...inputs: ClassValue[]) {
  // MERGING CLASSES
  return twMerge(clsx(inputs));
}
