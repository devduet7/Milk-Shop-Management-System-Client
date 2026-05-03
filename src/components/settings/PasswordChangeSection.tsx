// <== IMPORTS ==>
import {
  Eye,
  EyeOff,
  Loader2,
  KeyRound,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  passwordChangeSchema,
  type PasswordChangeFormValues,
} from "@/validators/settingsSchemas";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { memo, useRef, useState, useEffect, useCallback } from "react";

// <== PASSWORD CHANGE SECTION PROPS ==>
interface PasswordChangeSectionProps {
  // <== INITIATE CALLBACK — CALLED WITH NEW PLAINTEXT PASSWORD ==>
  onInitiate: (newPassword: string) => void;
  // <== INITIATE LOADING STATE ==>
  isLoading: boolean;
  // <== DISABLE FORM (E.G. WHILE OTP MODAL IS OPEN) ==>
  disabled?: boolean;
}

// <== PASSWORD CHANGE SECTION COMPONENT ==>
const PasswordChangeSection = memo(
  ({ onInitiate, isLoading, disabled = false }: PasswordChangeSectionProps) => {
    // SECTION EXPAND STATE — COLLAPSED BY DEFAULT
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    // SHOW/HIDE NEW PASSWORD
    const [showNew, setShowNew] = useState<boolean>(false);
    // SHOW/HIDE CONFIRM PASSWORD
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    // TRACKS WHETHER A SUBMIT WAS INITIATED — USED TO DETECT COMPLETION
    const wasSubmittedRef = useRef<boolean>(false);
    // FORM SETUP
    const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<PasswordChangeFormValues>({
      resolver: zodResolver(passwordChangeSchema),
      mode: "onChange",
    });
    // RESET FIELDS ONCE LOADING ENDS AFTER A SUBMIT (OTP MODAL CLOSED)
    useEffect(() => {
      if (wasSubmittedRef.current && !isLoading) {
        // CLEAR BOTH PASSWORD FIELDS
        reset();
        // CLEAR SUBMITTED FLAG
        wasSubmittedRef.current = false;
      }
    }, [isLoading, reset]);
    // HANDLE SECTION TOGGLE
    const handleToggle = useCallback((): void => {
      // TOGGLE STATE FOR EXPANSION OF SECTION
      setIsExpanded((prev) => {
        // RESET FORM WHEN COLLAPSING
        if (prev) reset();
        // INVERT STATE
        return !prev;
      });
    }, [reset]);
    // HANDLE FORM SUBMIT
    const onSubmit = useCallback(
      (data: PasswordChangeFormValues): void => {
        // MARK SUBMIT AS INITIATED
        wasSubmittedRef.current = true;
        // CALL INITIATE CALLBACK
        onInitiate(data.newPassword);
      },
      [onInitiate],
    );
    // RETURNING PASSWORD CHANGE SECTION
    return (
      // SECTION CONTAINER
      <div className="rounded-xl border border-border overflow-hidden">
        {/* TOGGLE HEADER */}
        <button
          type="button"
          onClick={handleToggle}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            {/* KEY ICON */}
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4 text-primary" />
            </div>
            {/* LABEL */}
            <div className="text-left">
              <p className="text-sm font-medium">Change Password</p>
              <p className="text-xs text-muted-foreground">
                Requires email verification
              </p>
            </div>
          </div>
          {/* CHEVRON */}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        {/* COLLAPSIBLE FORM */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-2 border-t border-border space-y-3">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {/* NEW PASSWORD FIELD */}
              <div>
                <Label className="text-xs" htmlFor="new-password">
                  New Password
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="new-password"
                    type={showNew ? "text" : "password"}
                    placeholder="Min 8 chars with upper, lower, digit, symbol"
                    className="pr-10"
                    disabled={isLoading || disabled}
                    {...register("newPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNew ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>
              {/* CONFIRM PASSWORD FIELD */}
              <div>
                <Label className="text-xs" htmlFor="confirm-password">
                  Confirm New Password
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter new password"
                    className="pr-10"
                    disabled={isLoading || disabled}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              {/* ACTION BUTTONS */}
              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleToggle}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading || disabled}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
PasswordChangeSection.displayName = "PasswordChangeSection";

// <== EXPORT ==>
export default PasswordChangeSection;
