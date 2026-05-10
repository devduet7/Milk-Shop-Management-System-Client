// <== IMPORTS ==>
import {
  useResetForgotPassword,
  useCancelForgotPassword,
  useInitiateForgotPassword,
  useVerifyForgotPasswordOtp,
} from "@/hooks/useAuth";
import { toast } from "sonner";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OtpVerifyStep from "@/components/auth/OtpVerifyStep";
import EmailInputStep from "@/components/auth/EmailInputStep";
import NewPasswordStep from "@/components/auth/NewPasswordStep";

// <== FORGOT PASSWORD STAGE TYPE ==>
type ForgotPasswordStage = "email" | "otp" | "password";

// <== FORGOT PASSWORD PAGE COMPONENT ==>
const ForgotPassword = memo(() => {
  // CURRENT STAGE OF THE FORGOT PASSWORD FLOW
  const [stage, setStage] = useState<ForgotPasswordStage>("email");
  // EMAIL SUBMITTED IN STEP 1 — RETAINED FOR USE IN STEPS 2 AND 3
  const [submittedEmail, setSubmittedEmail] = useState<string>("");
  // INLINE OTP ERROR — CLEARED BEFORE EACH VERIFY ATTEMPT
  const [otpError, setOtpError] = useState<string | null>(null);
  // INLINE RESET ERROR
  const [resetError, setResetError] = useState<string | null>(null);
  // INLINE EMAIL ERROR
  const [emailError, setEmailError] = useState<string | null>(null);
  // NAVIGATE HOOK
  const navigate = useNavigate();
  // THEME HOOK
  const { theme, toggleTheme } = useTheme();
  // INITIATE FORGOT PASSWORD MUTATION
  const initiateMutation = useInitiateForgotPassword();
  // VERIFY FORGOT PASSWORD OTP MUTATION
  const verifyMutation = useVerifyForgotPasswordOtp();
  // RESET FORGOT PASSWORD MUTATION
  const resetMutation = useResetForgotPassword();
  // CANCEL FORGOT PASSWORD MUTATION
  const cancelMutation = useCancelForgotPassword();
  // HANDLE EMAIL STEP SUBMIT — SENDS OTP AND ADVANCES TO OTP STAGE
  const handleEmailSubmit = useCallback(
    (email: string): void => {
      // CLEAR PREVIOUS EMAIL ERROR
      setEmailError(null);
      // CALL INITIATE MUTATION
      initiateMutation.mutate(
        { email },
        {
          // ON SUCCESS
          onSuccess: () => {
            // STORE EMAIL FOR SUBSEQUENT STEPS
            setSubmittedEmail(email);
            // ADVANCE TO OTP STAGE
            setStage("otp");
          },
          // ON ERROR
          onError: (error) => {
            // SHOW INLINE ERROR
            setEmailError(
              error.response?.data?.message ||
                "Failed to send verification code. Please try again.",
            );
          },
        },
      );
    },
    [initiateMutation],
  );
  // HANDLE OTP STEP SUBMIT — VERIFIES CODE AND ADVANCES TO PASSWORD STAGE
  const handleOtpSubmit = useCallback(
    (code: string): void => {
      // CLEAR PREVIOUS OTP ERROR BEFORE EACH ATTEMPT
      setOtpError(null);
      // CALL VERIFY MUTATION WITH STORED EMAIL AND ENTERED CODE
      verifyMutation.mutate(
        { email: submittedEmail, code },
        {
          // ON SUCCESS
          onSuccess: () => {
            // OTP VERIFIED — ADVANCE TO PASSWORD RESET STAGE
            setStage("password");
          },
          // ON ERROR
          onError: (error) => {
            // SHOW INLINE ERROR WITH ATTEMPT REMAINING INFO FROM SERVER
            setOtpError(
              error.response?.data?.message ||
                "Invalid code. Please try again.",
            );
          },
        },
      );
    },
    [verifyMutation, submittedEmail],
  );
  // HANDLE PASSWORD STEP SUBMIT — RESETS PASSWORD AND NAVIGATES TO LOGIN
  const handlePasswordSubmit = useCallback(
    (newPassword: string): void => {
      // CLEAR PREVIOUS RESET ERROR
      setResetError(null);
      // CALL RESET MUTATION WITH STORED EMAIL AND NEW PASSWORD
      resetMutation.mutate(
        { email: submittedEmail, newPassword },
        {
          // ON SUCCESS
          onSuccess: (data) => {
            // SHOW SUCCESS TOAST
            toast.success(
              data.message || "Password reset successfully! Please log in.",
            );
            // NAVIGATE TO LOGIN PAGE
            navigate("/login", { replace: true });
          },
          // ON ERROR
          onError: (error) => {
            // SHOW INLINE ERROR
            setResetError(
              error.response?.data?.message ||
                "Failed to reset password. Please start again.",
            );
          },
        },
      );
    },
    [resetMutation, submittedEmail, navigate],
  );
  // HANDLE CANCEL — CLEANS UP SERVER-SIDE CODES AND NAVIGATES TO LOGIN
  const handleCancel = useCallback((): void => {
    // CALL CANCEL MUTATION BEST-EFFORT — SILENTLY FAILS IF SERVER UNAVAILABLE
    cancelMutation.mutate(
      { email: submittedEmail },
      {
        // ON SETTLED
        onSettled: () => {
          // NAVIGATE TO LOGIN REGARDLESS OF CANCEL OUTCOME
          navigate("/login", { replace: true });
        },
      },
    );
  }, [cancelMutation, submittedEmail, navigate]);
  // RETURNING FORGOT PASSWORD PAGE
  return (
    // MAIN CONTAINER — MATCHES LOGIN PAGE LAYOUT
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* THEME TOGGLE — FIXED TO CORNER ON ALL SCREEN SIZES */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-8 w-8 sm:h-10 sm:w-10"
        >
          {theme === "light" ? (
            <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          ) : (
            <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          )}
        </Button>
      </div>
      {/* BACKGROUND BLUR CIRCLE — TOP LEFT */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
      {/* BACKGROUND BLUR CIRCLE — BOTTOM RIGHT */}
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
      {/* PAGE CARD */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* GLASS CARD WRAPPER */}
        <div className="glass-card p-6 sm:p-8">
          {/* ANIMATED STAGE CONTENT — SWAPS BETWEEN STEPS */}
          <AnimatePresence mode="wait">
            {/* EMAIL INPUT STEP */}
            {stage === "email" && (
              <EmailInputStep
                key="email"
                isLoading={initiateMutation.isPending}
                error={emailError}
                onSubmit={handleEmailSubmit}
              />
            )}
            {/* OTP VERIFY STEP */}
            {stage === "otp" && (
              <OtpVerifyStep
                key="otp"
                sentToEmail={submittedEmail}
                isLoading={verifyMutation.isPending}
                error={otpError}
                isCancelling={cancelMutation.isPending}
                onSubmit={handleOtpSubmit}
                onCancel={handleCancel}
              />
            )}
            {/* NEW PASSWORD STEP */}
            {stage === "password" && (
              <NewPasswordStep
                key="password"
                isLoading={resetMutation.isPending}
                error={resetError}
                isCancelling={cancelMutation.isPending}
                onSubmit={handlePasswordSubmit}
                onCancel={handleCancel}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
ForgotPassword.displayName = "ForgotPassword";

// <== MEMOIZED EXPORT TO PREVENT UNNECESSARY RE-RENDERS ==>
export default ForgotPassword;
