// <== IMPORTS ==>
import {
  forwardRef,
  type WheelEvent,
  type KeyboardEvent,
  type ClipboardEvent,
  type ComponentProps,
} from "react";
import { cn } from "@/lib/utils";

// <== KEYS BLOCKED ON NUMBER INPUTS — PREVENTS NEGATIVE VALUES AND SCIENTIFIC NOTATION BY KEYSTROKE ==>
const BLOCKED_NUMBER_KEYS = ["-", "+", "e", "E"];

// <== NO SPINNER CLASS — HIDES BROWSER NATIVE NUMBER INPUT ARROWS ==>
const NO_SPINNER_CLASS =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

// <== INPUT COMPONENT ==>
const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  ({ className, type, onWheel, onKeyDown, onPaste, ...props }, ref) => {
    // GUARD: IS THIS A NUMBER INPUT — THE GUARDS BELOW ONLY APPLY TO NUMBER INPUT TYPE
    const isNumberType = type === "number";
    // BLUR ON WHEEL — STOPS THE MOUSE WHEEL FROM EVER CHANGING A NUMBER INPUT'S VALUE
    const handleWheel = (e: WheelEvent<HTMLInputElement>): void => {
      // BLURRING REMOVES FOCUS SO THE BROWSER NEVER APPLIES THE WHEEL DELTA TO THE VALUE
      if (isNumberType) e.currentTarget.blur();
      // STILL CALLING ANY CALLER-SUPPLIED HANDLER SO EXISTING PER-FIELD LOGIC KEEPS WORKING
      onWheel?.(e);
    };
    // BLOCK NEGATIVE / SCIENTIFIC NOTATION KEYSTROKES
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
      // PREVENTING THE KEYSTROKE FROM EVER REACHING THE INPUT'S VALUE
      if (isNumberType && BLOCKED_NUMBER_KEYS.includes(e.key)) {
        // BLOCKING THE KEY
        e.preventDefault();
      }
      // STILL CALLING ANY CALLER-SUPPLIED HANDLER
      onKeyDown?.(e);
    };
    // BLOCK PASTED NEGATIVE / SCIENTIFIC NOTATION VALUES
    const handlePaste = (e: ClipboardEvent<HTMLInputElement>): void => {
      // GUARD: ONLY APPLIES TO NUMBER INPUTS
      if (isNumberType) {
        // READING THE PASTED TEXT FROM THE CLIPBOARD
        const pasted = e.clipboardData.getData("text");
        // REJECTING THE PASTE IF IT CONTAINS ANY BLOCKED CHARACTER
        if (BLOCKED_NUMBER_KEYS.some((key) => pasted.includes(key))) {
          // BLOCKING THE PASTE
          e.preventDefault();
        }
      }
      // STILL CALLING ANY CALLER-SUPPLIED HANDLER
      onPaste?.(e);
    };
    // RETURNING INPUT
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          isNumberType && NO_SPINNER_CLASS,
          className,
        )}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        ref={ref}
        {...props}
      />
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
Input.displayName = "Input";

// <== EXPORTS ==>
export { Input };
