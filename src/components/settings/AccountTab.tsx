// <== IMPORTS ==>
import {
  useUpdateAddress,
  useUpdateFullName,
  useVerifyNewEmail,
  useVerifyPhoneChange,
  useVerifyCurrentEmail,
  useCancelSecurityCode,
  useInitiatePhoneChange,
  useInitiateEmailChange,
  useVerifyPasswordChange,
  useInitiatePasswordChange,
} from "@/hooks/useSettings";
import OtpModal from "./OtpModal";
import { motion } from "framer-motion";
import AvatarUpload from "./AvatarUpload";
import EditableField from "./EditableField";
import { memo, useCallback, useState } from "react";
import { useGetProfile } from "@/hooks/useSettings";
import { useAuthStore } from "@/stores/useAuthStore";
import { Separator } from "@/components/ui/separator";
import type { EmailChangeStage } from "@/types/settings-types";
import PasswordChangeSection from "@/components/settings/PasswordChangeSection";

// <== PHONE REGEX FOR CLIENT-SIDE VALIDATION ==>
const PHONE_REGEX = /^\+[1-9]\d{1,14}$/;
// <== EMAIL REGEX FOR CLIENT-SIDE VALIDATION ==>
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// <== ACCOUNT TAB COMPONENT ==>
const AccountTab = memo(() => {
  // FETCH FULL PROFILE
  const { data: profile } = useGetProfile();
  // USER FROM AUTH STORE (FOR EMAIL DISPLAYED IN OTP MODAL)
  const user = useAuthStore((state) => state.user);
  // UPDATE FULL NAME MUTATION
  const updateName = useUpdateFullName();
  // UPDATE ADDRESS MUTATION
  const updateAddress = useUpdateAddress();
  // INITIATE PHONE CHANGE MUTATION
  const initiatePhone = useInitiatePhoneChange();
  // VERIFY PHONE CHANGE MUTATION
  const verifyPhone = useVerifyPhoneChange();
  // INITIATE EMAIL CHANGE MUTATION
  const initiateEmail = useInitiateEmailChange();
  // VERIFY CURRENT EMAIL MUTATION
  const verifyCurrentEmail = useVerifyCurrentEmail();
  // VERIFY NEW EMAIL MUTATION
  const verifyNewEmail = useVerifyNewEmail();
  // INITIATE PASSWORD CHANGE
  const initiatePassword = useInitiatePasswordChange();
  // VERIFY PASSWORD CHANGE MUTATION
  const verifyPassword = useVerifyPasswordChange();
  // CANCEL SECURITY CODE MUTATION
  const cancelCode = useCancelSecurityCode();
  // PHONE OTP MODAL STATE
  const [phoneOtpOpen, setPhoneOtpOpen] = useState<boolean>(false);
  // PHONE OTP ERROR STATE
  const [phoneOtpError, setPhoneOtpError] = useState<string | null>(null);
  // EMAIL CHANGE STAGE STATE
  const [emailStage, setEmailStage] = useState<EmailChangeStage>("idle");
  // EMAIL CHANGE OTP ERROR STATE
  const [emailOtpError, setEmailOtpError] = useState<string | null>(null);
  // PENDING NEW EMAIL STATE
  const [pendingNewEmail, setPendingNewEmail] = useState<string>("");
  // PASSWORD OTP MODAL STATE
  const [passwordOtpOpen, setPasswordOtpOpen] = useState<boolean>(false);
  // PASSWORD OTP ERROR STATE
  const [passwordOtpError, setPasswordOtpError] = useState<string | null>(null);
  // HANDLE NAME SAVE
  const handleNameSave = useCallback(
    (value: string): void => {
      // EXIT FUNCTION IF NO VALUE
      if (!value) return;
      // UPDATE NAME
      updateName.mutate({ fullName: value });
    },
    [updateName],
  );
  // HANDLE ADDRESS SAVE
  const handleAddressSave = useCallback(
    (value: string): void => {
      // EXIT FUNCTION IF NO VALUE
      if (!value) return;
      // UPDATE ADDRESS
      updateAddress.mutate({ address: value || null });
    },
    [updateAddress],
  );
  // HANDLE PHONE SAVE — INITIATES OTP FLOW
  const handlePhoneSave = useCallback(
    (value: string): void => {
      // EXIT FUNCTION IF NO VALUE
      if (!value) return;
      // INITIATE PHONE CHANGE
      initiatePhone.mutate(
        { newPhone: value },
        {
          // ON SUCCESS
          onSuccess: () => {
            // SET PHONE OTP ERROR TO NULL
            setPhoneOtpError(null);
            // OPEN PHONE OTP MODAL
            setPhoneOtpOpen(true);
          },
        },
      );
    },
    [initiatePhone],
  );
  // HANDLE PHONE OTP SUBMIT
  const handlePhoneOtpSubmit = useCallback(
    (code: string): void => {
      // EXIT FUNCTION IF NO VALUE
      if (!code) return;
      // SET PHONE OTP ERROR TO NULL
      setPhoneOtpError(null);
      // VERIFY PHONE
      verifyPhone.mutate(
        { code },
        {
          // ON SUCCESS, SET PHONE OTP OPEN TO FALSE
          onSuccess: () => setPhoneOtpOpen(false),
          // ON ERROR
          onError: (err) => {
            // SET PHONE OTP ERROR
            setPhoneOtpError(
              err.response?.data?.message || "Invalid code. Please try again.",
            );
          },
        },
      );
    },
    [verifyPhone],
  );
  // HANDLE PHONE OTP CANCEL
  const handlePhoneOtpCancel = useCallback((): void => {
    // SET PHONE OTP OPEN TO FALSE
    setPhoneOtpOpen(false);
    // SET PHONE OTP ERROR TO NULL
    setPhoneOtpError(null);
    // CANCEL SECURITY CODE
    cancelCode.mutate("phone_change");
  }, [cancelCode]);
  // HANDLE EMAIL SAVE — INITIATES OTP FLOW (STEP 1)
  const handleEmailSave = useCallback(
    (value: string): void => {
      // IF NO VALUE, EXIT FUNCTION
      if (!value) return;
      // EXIT FUNCTION IF NO VALUE
      setPendingNewEmail(value);
      // INITIATE EMAIL CHANGE
      initiateEmail.mutate(
        { newEmail: value },
        {
          // ON SUCCESS
          onSuccess: () => {
            // SET EMAIL OTP ERROR TO NULL
            setEmailOtpError(null);
            // SET EMAIL STAGE TO CURRENT
            setEmailStage("current");
          },
        },
      );
    },
    [initiateEmail],
  );
  // HANDLE EMAIL CURRENT OTP SUBMIT (STEP 2)
  const handleEmailCurrentOtpSubmit = useCallback(
    (code: string): void => {
      // EXIT FUNCTION IF NO VALUE
      if (!code) return;
      // SET EMAIL OTP ERROR TO NULL
      setEmailOtpError(null);
      // VERIFY CURRENT EMAIL
      verifyCurrentEmail.mutate(
        { code },
        {
          // ON SUCCESS
          onSuccess: () => {
            // SET EMAIL STAGE TO NEW
            setEmailOtpError(null);
            // SET EMAIL STAGE TO NEW
            setEmailStage("new");
          },
          // ON ERROR
          onError: (err) => {
            // SET EMAIL OTP ERROR
            setEmailOtpError(
              err.response?.data?.message || "Invalid code. Please try again.",
            );
          },
        },
      );
    },
    [verifyCurrentEmail],
  );
  // HANDLE EMAIL NEW OTP SUBMIT (STEP 3 — FINALISES CHANGE)
  const handleEmailNewOtpSubmit = useCallback(
    (code: string): void => {
      // EXIT FUNCTION IF NO VALUE
      if (!code) return;
      // SET EMAIL OTP ERROR TO NULL
      setEmailOtpError(null);
      // VERIFY NEW EMAIL
      verifyNewEmail.mutate(
        { code },
        {
          // ON SUCCESS
          onSuccess: () => {
            // SET EMAIL STAGE TO IDLE
            setEmailStage("idle");
            // SET EMAIL OTP ERROR TO NULL
            setPendingNewEmail("");
          },
          // ON ERROR
          onError: (err) => {
            // SET EMAIL OTP ERROR
            setEmailOtpError(
              err.response?.data?.message || "Invalid code. Please try again.",
            );
          },
        },
      );
    },
    [verifyNewEmail],
  );
  // HANDLE EMAIL OTP CANCEL — CLEAN UP ALL EMAIL CHANGE CODES
  const handleEmailOtpCancel = useCallback((): void => {
    // SET EMAIL STAGE TO IDLE
    setEmailStage("idle");
    // SET EMAIL OTP ERROR TO NULL
    setEmailOtpError(null);
    // SET PENDING NEW EMAIL TO EMPTY
    setPendingNewEmail("");
    // CANCEL SECURITY CODE
    cancelCode.mutate("email_change_current");
  }, [cancelCode]);
  // HANDLE PASSWORD INITIATE
  const handlePasswordInitiate = useCallback(
    (newPassword: string): void => {
      // EXIT FUNCTION IF NO VALUE
      if (!newPassword) return;
      // INITIATE PASSWORD
      initiatePassword.mutate(
        { newPassword },
        {
          // ON SUCCESS
          onSuccess: () => {
            // SET PASSWORD OTP ERROR TO NULL
            setPasswordOtpError(null);
            // OPEN PASSWORD OTP
            setPasswordOtpOpen(true);
          },
        },
      );
    },
    [initiatePassword],
  );
  // HANDLE PASSWORD OTP SUBMIT
  const handlePasswordOtpSubmit = useCallback(
    (code: string): void => {
      // EXIT FUNCTION IF NO VALUE
      if (!code) return;
      // SET PASSWORD OTP ERROR TO NULL
      setPasswordOtpError(null);
      // VERIFY PASSWORD
      verifyPassword.mutate(
        { code },
        {
          // ON SUCCESS, CLOSE PASSWORD OTP
          onSuccess: () => setPasswordOtpOpen(false),
          // ON ERROR
          onError: (err) => {
            // SET PASSWORD OTP ERROR
            setPasswordOtpError(
              err.response?.data?.message || "Invalid code. Please try again.",
            );
          },
        },
      );
    },
    [verifyPassword],
  );
  // HANDLE PASSWORD OTP CANCEL
  const handlePasswordOtpCancel = useCallback((): void => {
    // CLOSE PASSWORD OTP
    setPasswordOtpOpen(false);
    // SET PASSWORD OTP ERROR TO NULL
    setPasswordOtpError(null);
    // CANCEL SECURITY CODE
    cancelCode.mutate("password_change");
  }, [cancelCode]);
  // RETURNING ACCOUNT TAB
  return (
    // ACCOUNT TAB CARD
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 md:p-6 space-y-6"
    >
      {/* SECTION: AVATAR AND IDENTITY */}
      <div>
        <h2 className="font-display font-semibold text-lg">Account</h2>
        <p className="text-sm text-muted-foreground">
          Manage your profile information
        </p>
      </div>
      <Separator />
      {/* AVATAR UPLOAD */}
      <div className="flex justify-center">
        <AvatarUpload profile={profile} />
      </div>
      <Separator />
      {/* PROFILE FIELDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {/* FULL NAME */}
        <EditableField
          id="settings-name"
          label="Full Name"
          value={profile?.fullName ?? ""}
          placeholder="Enter your full name"
          isLoading={updateName.isPending}
          validate={(v) =>
            v.length < 2
              ? "Name must be at least 2 characters"
              : v.length > 50
                ? "Name must not exceed 50 characters"
                : null
          }
          onSave={handleNameSave}
        />
        {/* EMAIL */}
        <EditableField
          id="settings-email"
          label="Email Address"
          value={profile?.email ?? ""}
          placeholder="Enter your email"
          inputType="email"
          requiresOtp
          isLoading={initiateEmail.isPending}
          validate={(v) =>
            !EMAIL_REGEX.test(v) ? "Please enter a valid email address" : null
          }
          onSave={handleEmailSave}
          disabled={emailStage !== "idle"}
        />
        {/* PHONE NUMBER */}
        <EditableField
          id="settings-phone"
          label="Phone Number"
          value={profile?.phoneNumber ?? ""}
          placeholder="+923001234567"
          inputType="tel"
          requiresOtp
          isLoading={initiatePhone.isPending}
          validate={(v) =>
            v && !PHONE_REGEX.test(v)
              ? "Enter a valid phone number with country code (e.g. +923001234567)"
              : null
          }
          onSave={handlePhoneSave}
          disabled={phoneOtpOpen}
        />
        {/* ADDRESS */}
        <EditableField
          id="settings-address"
          label="Address"
          value={profile?.address ?? ""}
          placeholder="Enter your address"
          isLoading={updateAddress.isPending}
          validate={(v) =>
            v.length > 300 ? "Address must not exceed 300 characters" : null
          }
          onSave={handleAddressSave}
        />
      </div>
      <Separator />
      {/* PASSWORD CHANGE SECTION */}
      <PasswordChangeSection
        onInitiate={handlePasswordInitiate}
        isLoading={initiatePassword.isPending}
        disabled={passwordOtpOpen}
      />
      {/* PHONE OTP MODAL */}
      <OtpModal
        open={phoneOtpOpen}
        title="Verify Phone Change"
        description="Enter the 6-digit code sent to your email to confirm your new phone number."
        sentToEmail={user?.email ?? ""}
        isLoading={verifyPhone.isPending}
        error={phoneOtpError}
        onSubmit={handlePhoneOtpSubmit}
        onCancel={handlePhoneOtpCancel}
      />
      {/* EMAIL CHANGE — STEP 1: VERIFY CURRENT EMAIL */}
      <OtpModal
        open={emailStage === "current"}
        title="Confirm Your Identity"
        description="Enter the code sent to your current email address to verify your identity."
        sentToEmail={user?.email ?? ""}
        isLoading={verifyCurrentEmail.isPending}
        error={emailOtpError}
        onSubmit={handleEmailCurrentOtpSubmit}
        onCancel={handleEmailOtpCancel}
      />
      {/* EMAIL CHANGE — STEP 2: VERIFY NEW EMAIL */}
      <OtpModal
        open={emailStage === "new"}
        title="Verify New Email"
        description="Enter the code sent to your new email address to complete the change."
        sentToEmail={pendingNewEmail}
        isLoading={verifyNewEmail.isPending}
        error={emailOtpError}
        onSubmit={handleEmailNewOtpSubmit}
        onCancel={handleEmailOtpCancel}
      />
      {/* PASSWORD OTP MODAL */}
      <OtpModal
        open={passwordOtpOpen}
        title="Confirm Password Change"
        description="Enter the 6-digit code sent to your email to apply your new password."
        sentToEmail={user?.email ?? ""}
        isLoading={verifyPassword.isPending}
        error={passwordOtpError}
        onSubmit={handlePasswordOtpSubmit}
        onCancel={handlePasswordOtpCancel}
      />
    </motion.div>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
AccountTab.displayName = "AccountTab";

// <== EXPORT ==>
export default AccountTab;
