// <== IMPORTS ==>
import { useState, useEffect } from "react";

/**
 * DEBOUNCE A VALUE BY A GIVEN DELAY
 * @param value - VALUE TO DEBOUNCE
 * @param delay - DELAY IN MILLISECONDS
 * @returns DEBOUNCED VALUE
 */
// <== USE DEBOUNCE HOOK ==>
export const useDebounce = <T>(value: T, delay: number = 300): T => {
  // <== DEBOUNCED VALUE STATE ==>
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  // <== DEBOUNCE EFFECT ==>
  useEffect(() => {
    // SET TIMER TO UPDATE DEBOUNCED VALUE AFTER DELAY
    const timer = setTimeout(() => {
      // UPDATE DEBOUNCED VALUE
      setDebouncedValue(value);
    }, delay);
    // CLEAR TIMER ON VALUE OR DELAY CHANGE
    return () => clearTimeout(timer);
  }, [value, delay]);
  // RETURN DEBOUNCED VALUE
  return debouncedValue;
};
