// <== IMPORTS ==>
import {
  setupPasswordSchema,
  type SetupPasswordValues,
} from "@/validators/accountSetupSchemas";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { memo, useState, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Eye, EyeOff, Loader2 } from "lucide-react";

// <== SETUP NEW PASSWORD STEP PROPS ==>
interface SetupNewPasswordStepProps {
  // <== SUBMISSION LOADING STATE ==>
  isLoading: boolean;
  // <== SERVER-SIDE ERROR MESSAGE ==>
  error: string | null;
  // <== SUBMIT CALLBACK ==>
  onSubmit: (newPassword: string) => void;
  // <== CANCEL CALLBACK ==>
  onCancel: () => void;
}

// <== SETUP NEW PASSWORD STEP COMPONENT ==>
const SetupNewPasswordStep = memo(
  ({ isLoading, error, onSubmit, onCancel }: SetupNewPasswordStepProps) => {
    // SHOW NEW PASSWORD STATE
    const [showNew, setShowNew] = useState<boolean>(false);
    // SHOW CONFIRM PASSWORD STATE
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    // FORM SETUP WITH ZOD RESOLVER
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<SetupPasswordValues>({
      // ZOD SCHEMA RESOLVER FOR VALIDATION
      resolver: zodResolver(setupPasswordSchema),
      // VALIDATE AND CLEAR ERRORS ON CHANGE
      mode: "onChange",
    });
    // TOGGLE NEW PASSWORD VISIBILITY
    const handleToggleNew = useCallback((): void => {
      // TOGGLE NEW PASSWORD VISIBILITY
      setShowNew((prev) => !prev);
    }, []);
    // TOGGLE CONFIRM PASSWORD VISIBILITY
    const handleToggleConfirm = useCallback((): void => {
      // TOGGLE CONFIRM PASSWORD VISIBILITY
      setShowConfirm((prev) => !prev);
    }, []);
    // HANDLE FORM SUBMIT
    const handleFormSubmit = useCallback(
      (data: SetupPasswordValues): void => {
        // CALL PARENT SUBMIT WITH NEW PASSWORD
        onSubmit(data.newPassword);
      },
      [onSubmit],
    );
    // RETURNING SETUP NEW PASSWORD STEP
    return (
      // STEP CONTAINER WITH SLIDE-IN ANIMATION
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* STEP HEADER */}
        <div className="text-center mb-8">
          {/* ICON */}
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-7 h-7 text-primary" />
          </div>
          {/* TITLE */}
          <h1 className="font-display text-2xl font-bold">
            Create Your Password
          </h1>
          {/* SUBTITLE */}
          <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
            Choose a password to activate your account. You will be able to log
            in right after this step.
          </p>
        </div>
        {/* SETUP FORM */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* NEW PASSWORD FIELD */}
          <div>
            <Label htmlFor="setup-password">Password</Label>
            <div className="relative mt-1.5">
              <Input
                id="setup-password"
                type={showNew ? "text" : "password"}
                placeholder="Min 8 chars with upper, lower, digit, symbol"
                className="pr-10"
                disabled={isLoading}
                {...register("newPassword")}
              />
              {/* SHOW/HIDE NEW PASSWORD TOGGLE */}
              <button
                type="button"
                onClick={handleToggleNew}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNew ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {/* NEW PASSWORD VALIDATION ERROR */}
            {errors.newPassword && (
              <p className="text-destructive text-xs mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>
          {/* CONFIRM PASSWORD FIELD */}
          <div>
            <Label htmlFor="setup-confirm-password">Confirm Password</Label>
            <div className="relative mt-1.5">
              <Input
                id="setup-confirm-password"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                className="pr-10"
                disabled={isLoading}
                {...register("confirmPassword")}
              />
              {/* SHOW/HIDE CONFIRM PASSWORD TOGGLE */}
              <button
                type="button"
                onClick={handleToggleConfirm}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {/* CONFIRM PASSWORD VALIDATION ERROR */}
            {errors.confirmPassword && (
              <p className="text-destructive text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          {/* SERVER-SIDE ERROR MESSAGE */}
          {error && (
            <p className="text-destructive text-xs text-center">{error}</p>
          )}
          {/* COMPLETE SETUP BUTTON */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Completing Setup...
              </>
            ) : (
              "Complete Setup"
            )}
          </Button>
          {/* CANCEL BUTTON */}
          <Button
            type="button"
            variant="ghost"
            className="w-full text-muted-foreground"
            disabled={isLoading}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </form>
      </motion.div>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
SetupNewPasswordStep.displayName = "SetupNewPasswordStep";

// <== EXPORT ==>
export default SetupNewPasswordStep;
