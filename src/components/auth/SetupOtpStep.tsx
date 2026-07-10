// <== IMPORTS ==>
import {
  memo,
  useRef,
  useState,
  useEffect,
  useCallback,
  type ChangeEvent,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

// <== OTP LENGTH CONSTANT ==>
const OTP_LENGTH = 6;

// <== SETUP OTP STEP PROPS ==>
interface SetupOtpStepProps {
  // <== EMAIL THE INVITE CODE WAS SENT TO ==>
  sentToEmail: string;
  // <== INLINE ERROR ==>
  error: string | null;
  // <== SUBMIT CALLBACK ==>
  onSubmit: (code: string) => void;
  // <== CANCEL CALLBACK ==>
  onCancel: () => void;
}

// <== SETUP OTP STEP COMPONENT ==>
const SetupOtpStep = memo(
  ({ sentToEmail, error, onSubmit, onCancel }: SetupOtpStepProps) => {
    // OTP DIGIT ARRAY STATE — 6 INDIVIDUAL CHARACTERS
    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    // REFS FOR EACH OTP INPUT BOX
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    // FOCUS FIRST BOX ON MOUNT
    useEffect(() => {
      // WAIT FOR REFS TO BE SET
      setTimeout(() => inputRefs.current[0]?.focus(), 80);
    }, []);
    // DERIVED JOINED CODE
    const code = digits.join("");
    // IS CODE COMPLETE — ALL 6 DIGITS FILLED
    const isComplete = code.length === OTP_LENGTH;
    // HANDLE INDIVIDUAL DIGIT INPUT CHANGE
    const handleChange = useCallback(
      (index: number, e: ChangeEvent<HTMLInputElement>): void => {
        // STRIP NON-DIGITS AND TAKE ONLY LAST CHARACTER — HANDLES MOBILE AUTO-FILL
        const val = e.target.value.replace(/\D/g, "").slice(-1);
        // UPDATE DIGITS ARRAY IMMUTABLY
        setDigits((prev) => {
          // SPREAD PREVIOUS ARRAY
          const next = [...prev];
          // REPLACE DIGIT AT INDEX
          next[index] = val;
          // RETURN NEW ARRAY
          return next;
        });
        // AUTO-ADVANCE TO NEXT BOX WHEN DIGIT ENTERED
        if (val && index < OTP_LENGTH - 1) {
          // FOCUS NEXT BOX
          inputRefs.current[index + 1]?.focus();
        }
      },
      [],
    );
    // HANDLE KEYBOARD NAVIGATION
    const handleKeyDown = useCallback(
      (index: number, e: KeyboardEvent<HTMLInputElement>): void => {
        // BACKSPACE ON EMPTY BOX — MOVE TO PREVIOUS AND CLEAR IT
        if (e.key === "Backspace" && !digits[index] && index > 0) {
          setDigits((prev) => {
            // SPREAD PREVIOUS ARRAY
            const next = [...prev];
            // CLEAR DIGIT AT INDEX
            next[index - 1] = "";
            // RETURN NEW ARRAY
            return next;
          });
          // FOCUS PREVIOUS BOX
          inputRefs.current[index - 1]?.focus();
          // RETURN TO PREVENT DEFAULT BACKSPACE BEHAVIOUR
          return;
        }
        // LEFT ARROW — MOVE TO PREVIOUS BOX
        if (e.key === "ArrowLeft" && index > 0) {
          // FOCUS PREVIOUS BOX
          inputRefs.current[index - 1]?.focus();
          // RETURN TO PREVENT DEFAULT LEFT ARROW BEHAVIOUR
          return;
        }
        // RIGHT ARROW — MOVE TO NEXT BOX
        if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
          // FOCUS NEXT BOX
          inputRefs.current[index + 1]?.focus();
          // RETURN TO PREVENT DEFAULT RIGHT ARROW BEHAVIOUR
          return;
        }
        // ENTER ON COMPLETE CODE — SUBMIT
        if (e.key === "Enter" && isComplete) {
          // CALL PARENT SUBMIT
          onSubmit(code);
        }
      },
      [digits, isComplete, code, onSubmit],
    );
    // HANDLE PASTE — DISTRIBUTE DIGITS ACROSS BOXES
    const handlePaste = useCallback(
      (e: ClipboardEvent<HTMLInputElement>): void => {
        // PREVENT DEFAULT BROWSER PASTE BEHAVIOUR
        e.preventDefault();
        // EXTRACT NUMERIC CHARACTERS FROM PASTED TEXT
        const pasted = e.clipboardData
          .getData("text")
          .replace(/\D/g, "")
          .slice(0, OTP_LENGTH);
        // GUARD: NOTHING USABLE WAS PASTED
        if (!pasted) return;
        // FILL DIGITS ARRAY FROM PASTED STRING
        setDigits((prev) => {
          // SPREAD PREVIOUS ARRAY
          const next = [...prev];
          // ITERATE THROUGH PASTED STRING
          pasted.split("").forEach((char, i) => {
            // REPLACE DIGIT AT INDEX
            next[i] = char;
          });
          // RETURN NEW ARRAY
          return next;
        });
        // FOCUS THE BOX AFTER THE LAST PASTED DIGIT
        const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
        // FOCUS BOX AFTER THE LAST PASTED DIGIT
        inputRefs.current[focusIndex]?.focus();
      },
      [],
    );
    // RETURNING SETUP OTP STEP
    return (
      // STEP CONTAINER WITH SLIDE-IN ANIMATION
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* STEP HEADER */}
        <div className="text-center mb-6">
          {/* ICON */}
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          {/* TITLE */}
          <h1 className="font-display text-2xl font-bold">
            Enter Your Setup Code
          </h1>
          {/* SUBTITLE */}
          <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
            Enter the 6-digit code sent to{" "}
            <strong className="text-foreground">{sentToEmail}</strong>
          </p>
        </div>
        {/* OTP INPUT BOXES */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-2">
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digits[i]}
              onChange={(e) => handleChange(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className={cn(
                "w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border-2 outline-none",
                "bg-background transition-all duration-200",
                digits[i]
                  ? "border-primary text-primary"
                  : "border-border text-foreground",
                "focus:border-primary focus:ring-2 focus:ring-primary/20",
                error && "border-destructive",
              )}
            />
          ))}
        </div>
        {/* EXPIRY AND ATTEMPT HINT */}
        <p className="text-center text-[11px] text-muted-foreground mb-4">
          Code expires 48 hours after your invite was sent · 5 attempts allowed
        </p>
        {/* INLINE ERROR */}
        {error && (
          <p className="text-destructive text-xs text-center mb-3">{error}</p>
        )}
        {/* CONTINUE BUTTON */}
        <Button
          className="w-full"
          disabled={!isComplete}
          onClick={() => onSubmit(code)}
        >
          Continue
        </Button>
        {/* CANCEL BUTTON */}
        <Button
          variant="ghost"
          className="w-full mt-2 text-muted-foreground"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </motion.div>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
SetupOtpStep.displayName = "SetupOtpStep";

// <== EXPORT ==>
export default SetupOtpStep;
