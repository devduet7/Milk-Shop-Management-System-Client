// <== IMPORTS ==>
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  memo,
  useRef,
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  KeyboardEvent,
  ClipboardEvent,
} from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";

// <== OTP LENGTH CONSTANT ==>
const OTP_LENGTH = 6;

// <== OTP MODAL PROPS ==>
interface OtpModalProps {
  // <== MODAL OPEN STATE ==>
  open: boolean;
  // <== MODAL TITLE ==>
  title: string;
  // <== DESCRIPTIVE SUBTITLE BELOW TITLE ==>
  description: string;
  // <== EMAIL ADDRESS THE CODE WAS SENT TO (SHOWN TO USER) ==>
  sentToEmail: string;
  // <== SUBMISSION LOADING STATE ==>
  isLoading: boolean;
  // <== SERVER-SIDE ERROR MESSAGE TO DISPLAY INLINE ==>
  error: string | null;
  // <== SUBMIT CALLBACK — CALLED WITH THE JOINED 6-DIGIT CODE ==>
  onSubmit: (code: string) => void;
  // <== CANCEL CALLBACK ==>
  onCancel: () => void;
}

// <== OTP MODAL COMPONENT ==>
const OtpModal = memo(
  ({
    open,
    title,
    description,
    sentToEmail,
    isLoading,
    error,
    onSubmit,
    onCancel,
  }: OtpModalProps) => {
    // OTP DIGIT ARRAY STATE — 6 INDIVIDUAL CHARACTERS
    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    // REFS FOR EACH OTP INPUT BOX
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    // RESET DIGITS WHEN MODAL OPENS
    useEffect(() => {
      // RESET DIGITS ARRAY
      if (open) setDigits(Array(OTP_LENGTH).fill(""));
    }, [open]);
    // FOCUS FIRST BOX WHEN MODAL OPENS
    useEffect(() => {
      // IF MODAL IS OPEN
      if (open) {
        // WAIT FOR DOM TO UPDATE
        setTimeout(() => inputRefs.current[0]?.focus(), 80);
      }
    }, [open]);
    // DERIVED COMPLETE CODE — JOIN ALL DIGITS
    const code = digits.join("");
    // IS CODE COMPLETE — ALL 6 DIGITS FILLED
    const isComplete = code.length === OTP_LENGTH;
    // HANDLE DIGIT INPUT CHANGE
    const handleChange = useCallback(
      (index: number, e: ChangeEvent<HTMLInputElement>): void => {
        // EXTRACT ONLY LAST CHARACTER TO HANDLE MOBILE AUTO-FILL
        const val = e.target.value.replace(/\D/g, "").slice(-1);
        // UPDATE DIGITS ARRAY
        setDigits((prev) => {
          // SPREAD PREVIOUS ARRAY
          const next = [...prev];
          // REPLACE DIGIT AT INDEX
          next[index] = val;
          // RETURN NEW ARRAY
          return next;
        });
        // AUTO-ADVANCE TO NEXT BOX IF DIGIT WAS ENTERED
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
          // UPDATE DIGITS ARRAY
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
          // RETURN EARLY
          return;
        }
        // LEFT ARROW — MOVE TO PREVIOUS BOX
        if (e.key === "ArrowLeft" && index > 0) {
          // FOCUS PREVIOUS BOX
          inputRefs.current[index - 1]?.focus();
          // RETURN EARLY
          return;
        }
        // RIGHT ARROW — MOVE TO NEXT BOX
        if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
          // FOCUS NEXT BOX
          inputRefs.current[index + 1]?.focus();
          // RETURN EARLY
          return;
        }
        // ENTER ON COMPLETE CODE — SUBMIT
        if (e.key === "Enter" && isComplete) {
          // CALL SUBMIT CALLBACK
          onSubmit(code);
        }
      },
      [digits, isComplete, code, onSubmit],
    );
    // HANDLE PASTE — DISTRIBUTE DIGITS ACROSS BOXES
    const handlePaste = useCallback(
      (e: ClipboardEvent<HTMLInputElement>): void => {
        // PREVENT DEFAULT PASTE
        e.preventDefault();
        // EXTRACT PASTED DIGITS ONLY
        const pasted = e.clipboardData
          .getData("text")
          .replace(/\D/g, "")
          .slice(0, OTP_LENGTH);
        // GUARD: NOTHING TO PASTE
        if (!pasted) return;
        // FILL DIGITS ARRAY FROM PASTED STRING
        setDigits((prev) => {
          // SPREAD PREVIOUS ARRAY
          const next = [...prev];
          // LOOP THROUGH PASTED STRING
          pasted.split("").forEach((char, i) => {
            // UPDATE DIGIT AT INDEX
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
    // RETURNING OTP MODAL
    return (
      // DIALOG WRAPPER — CLOSE BLOCKED WHILE LOADING
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v && !isLoading) onCancel();
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md">
          {/* DIALOG HEADER */}
          <DialogHeader className="text-center">
            {/* SHIELD ICON */}
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-7 h-7 text-primary" />
            </div>
            <DialogTitle className="font-display text-lg text-center">
              {title}
            </DialogTitle>
            <DialogDescription className="text-center text-sm">
              {description}
            </DialogDescription>
          </DialogHeader>
          {/* EMAIL HINT */}
          <p className="text-center text-xs text-muted-foreground mt-1">
            Code sent to{" "}
            <strong className="text-foreground">{sentToEmail}</strong>
          </p>
          {/* OTP INPUT BOXES */}
          <div className="flex justify-center gap-2 sm:gap-3 mt-2">
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
                  "w-10 h-12 sm:w-11 sm:h-13 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-200 bg-background",
                  digits[i]
                    ? "border-primary text-primary"
                    : "border-border text-foreground",
                  "focus:border-primary focus:ring-2 focus:ring-primary/20",
                  error && "border-destructive",
                  isLoading && "opacity-50 cursor-not-allowed",
                )}
                disabled={isLoading}
              />
            ))}
          </div>
          {/* SERVER-SIDE ERROR MESSAGE */}
          {error && (
            <p className="text-destructive text-xs text-center mt-1">{error}</p>
          )}
          {/* ACTION BUTTONS */}
          <div className="flex gap-3 mt-4">
            {/* CANCEL BUTTON */}
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            {/* VERIFY BUTTON */}
            <Button
              className="flex-1"
              disabled={!isComplete || isLoading}
              onClick={() => onSubmit(code)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>
          </div>
          {/* EXPIRY HINT */}
          <p className="text-center text-[11px] text-muted-foreground mt-1">
            Code expires in 10 minutes · 5 attempts allowed
          </p>
        </DialogContent>
      </Dialog>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
OtpModal.displayName = "OtpModal";

// <== EXPORT ==>
export default OtpModal;
