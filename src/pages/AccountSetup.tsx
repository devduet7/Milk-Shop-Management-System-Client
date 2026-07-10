// <== IMPORTS ==>
import {
  useCompleteAccountSetup,
  type ApiErrorResponse,
} from "@/hooks/useAuth";
import { toast } from "sonner";
import { type AxiosError } from "axios";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SetupOtpStep from "@/components/auth/SetupOtpStep";
import SetupEmailStep from "@/components/auth/SetupEmailStep";
import { useNavigate, useSearchParams } from "react-router-dom";
import SetupNewPasswordStep from "@/components/auth/SetupNewPasswordStep";

// <== ACCOUNT SETUP STAGE TYPE ==>
type AccountSetupStage = "email" | "otp" | "password";

// <== ACCOUNT SETUP PAGE COMPONENT ==>
const AccountSetup = memo(() => {
  // SEARCH PARAMS HOOK — USED TO RETRIEVE THE EMAIL FROM THE INVITE LINK
  const [searchParams] = useSearchParams();
  // EXTRACTING AND DECODING THE EMAIL QUERY PARAM, IF PRESENT
  const emailFromLink = searchParams.get("email") ?? "";
  // CURRENT STAGE OF THE SETUP FLOW
  const [stage, setStage] = useState<AccountSetupStage>("email");
  // EMAIL CONFIRMED IN STEP 1 — RETAINED FOR THE FINAL API CALL
  const [submittedEmail, setSubmittedEmail] = useState<string>("");
  // INVITE OTP CODE ENTERED IN STEP 2 — RETAINED FOR THE FINAL API CALL
  const [submittedCode, setSubmittedCode] = useState<string>("");
  // INLINE ERROR FOR THE OTP STEP
  const [otpError, setOtpError] = useState<string | null>(null);
  // INLINE ERROR FOR THE PASSWORD STEP
  const [passwordError, setPasswordError] = useState<string | null>(null);
  // NAVIGATE HOOK
  const navigate = useNavigate();
  // THEME HOOK
  const { theme, toggleTheme } = useTheme();
  // COMPLETE ACCOUNT SETUP MUTATION — CALLED ONLY ON THE FINAL STEP
  const setupMutation = useCompleteAccountSetup();
  // HANDLE EMAIL STEP — STORES EMAIL AND ADVANCES
  const handleEmailSubmit = useCallback((email: string): void => {
    // STORING EMAIL FOR USE IN THE FINAL API CALL
    setSubmittedEmail(email);
    // ADVANCING TO OTP STEP
    setStage("otp");
  }, []);
  // HANDLE OTP STEP — STORES CODE AND ADVANCES
  const handleOtpSubmit = useCallback((code: string): void => {
    // CLEARING ANY PREVIOUS OTP ERROR
    setOtpError(null);
    // STORING CODE FOR USE IN THE FINAL API CALL
    setSubmittedCode(code);
    // ADVANCING TO PASSWORD STEP
    setStage("password");
  }, []);
  // HANDLE PASSWORD STEP — MAKES THE API CALL WITH ALL THREE COLLECTED PIECES
  const handlePasswordSubmit = useCallback(
    (newPassword: string): void => {
      // CLEARING PREVIOUS PASSWORD ERROR
      setPasswordError(null);
      // CALLING SETUP API WITH STORED EMAIL, STORED CODE, AND NEW PASSWORD
      setupMutation.mutate(
        { email: submittedEmail, code: submittedCode, newPassword },
        {
          // ON SUCCESS
          onSuccess: (data) => {
            // SHOW SUCCESS TOAST
            toast.success(
              data.message || "Account setup complete! You can now log in.",
            );
            // NAVIGATE TO LOGIN — USER MUST LOG IN WITH THEIR NEW PASSWORD
            navigate("/login", { replace: true });
          },
          // ON ERROR
          onError: (error: AxiosError<ApiErrorResponse>) => {
            // GETTING ERROR CODE FROM SERVER RESPONSE
            const errorCode = error.response?.data?.code;
            // GETTING ERROR MESSAGE FROM SERVER RESPONSE
            const errorMessage =
              error.response?.data?.message ||
              "Account setup failed. Please try again.";
            // IF THE CODE WAS REJECTED — SEND USER BACK TO OTP STEP WITH INLINE ERROR
            if (errorCode === "INVALID_CODE") {
              // SETTING OTP STEP ERROR SO IT DISPLAYS WHEN THE USER RETURNS
              setOtpError(errorMessage);
              // RETURNING TO OTP STEP
              setStage("otp");
              // RETURNING FROM FUNCTION
              return;
            }
            // FOR ALL OTHER ERRORS — DISPLAY ON THE CURRENT PASSWORD STEP
            setPasswordError(errorMessage);
          },
        },
      );
    },
    [setupMutation, submittedEmail, submittedCode, navigate],
  );
  // HANDLE CANCEL — NAVIGATES TO LOGIN WITHOUT CLEANING UP SERVER CODES
  const handleCancel = useCallback((): void => {
    // NAVIGATE TO LOGIN PAGE
    navigate("/login", { replace: true });
  }, [navigate]);
  // RETURNING ACCOUNT SETUP PAGE
  return (
    // MAIN CONTAINER — MATCHES FORGOT PASSWORD PAGE LAYOUT
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
            {/* EMAIL STEP */}
            {stage === "email" && (
              <SetupEmailStep
                key="email"
                initialEmail={emailFromLink}
                onSubmit={handleEmailSubmit}
              />
            )}
            {/* OTP STEP */}
            {stage === "otp" && (
              <SetupOtpStep
                key="otp"
                sentToEmail={submittedEmail}
                error={otpError}
                onSubmit={handleOtpSubmit}
                onCancel={handleCancel}
              />
            )}
            {/* PASSWORD STEP */}
            {stage === "password" && (
              <SetupNewPasswordStep
                key="password"
                isLoading={setupMutation.isPending}
                error={passwordError}
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
AccountSetup.displayName = "AccountSetup";

// <== MEMOIZED EXPORT TO PREVENT UNNECESSARY RE-RENDERS ==>
export default AccountSetup;
