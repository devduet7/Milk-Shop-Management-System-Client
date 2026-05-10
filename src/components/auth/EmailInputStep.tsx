// <== IMPORTS ==>
import {
  forgotPasswordEmailSchema,
  type ForgotPasswordEmailValues,
} from "@/validators/authSchemas";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { memo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Loader2, ArrowLeft } from "lucide-react";

// <== EMAIL INPUT STEP PROPS ==>
interface EmailInputStepProps {
  // <== SUBMISSION LOADING STATE ==>
  isLoading: boolean;
  // <== SERVER-SIDE ERROR MESSAGE ==>
  error: string | null;
  // <== SUBMIT CALLBACK — CALLED WITH THE EMAIL ADDRESS ==>
  onSubmit: (email: string) => void;
}

// <== EMAIL INPUT STEP COMPONENT ==>
const EmailInputStep = memo(
  ({ isLoading, error, onSubmit }: EmailInputStepProps) => {
    // FORM SETUP WITH ZOD RESOLVER
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<ForgotPasswordEmailValues>({
      // ZOD SCHEMA RESOLVER FOR VALIDATION
      resolver: zodResolver(forgotPasswordEmailSchema),
      // VALIDATE AND CLEAR ERRORS ON CHANGE
      mode: "onChange",
      // DEFAULT VALUES
      defaultValues: { email: "" },
    });
    // HANDLE FORM SUBMIT — PASS VALIDATED EMAIL TO PARENT
    const handleFormSubmit = useCallback(
      (data: ForgotPasswordEmailValues): void => {
        // CALL PARENT SUBMIT WITH VALIDATED EMAIL
        onSubmit(data.email);
      },
      [onSubmit],
    );
    // RETURNING EMAIL INPUT STEP
    return (
      // STEP CONTAINER WITH FADE-IN ANIMATION
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
            <Mail className="w-7 h-7 text-primary" />
          </div>
          {/* TITLE */}
          <h1 className="font-display text-2xl font-bold">Forgot Password?</h1>
          {/* SUBTITLE */}
          <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
            Enter the email address linked to your account and we will send you
            a verification code.
          </p>
        </div>
        {/* EMAIL FORM */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* EMAIL FIELD */}
          <div>
            <Label htmlFor="forgot-email">Email Address</Label>
            <Input
              id="forgot-email"
              type="email"
              placeholder="owner@milkshop.com"
              className="mt-1.5"
              disabled={isLoading}
              {...register("email")}
            />
            {/* EMAIL VALIDATION ERROR */}
            {errors.email && (
              <p className="text-destructive text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          {/* SERVER-SIDE ERROR MESSAGE */}
          {error && (
            <p className="text-destructive text-xs text-center">{error}</p>
          )}
          {/* SUBMIT BUTTON */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Code...
              </>
            ) : (
              "Send Verification Code"
            )}
          </Button>
        </form>
        {/* BACK TO LOGIN LINK */}
        <div className="mt-5 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Login
          </Link>
        </div>
      </motion.div>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
EmailInputStep.displayName = "EmailInputStep";

// <== EXPORT ==>
export default EmailInputStep;
