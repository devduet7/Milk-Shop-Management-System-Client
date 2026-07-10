// <== IMPORTS ==>
import {
  setupEmailSchema,
  type SetupEmailValues,
} from "@/validators/accountSetupSchemas";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { memo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";

// <== SETUP EMAIL STEP PROPS ==>
interface SetupEmailStepProps {
  // <== EMAIL PRE-FILLED FROM THE INVITE LINK'S QUERY PARAM, IF PRESENT ==>
  initialEmail: string;
  // <== SUBMIT CALLBACK — CALLED WITH THE EMAIL ADDRESS ==>
  onSubmit: (email: string) => void;
}

// <== SETUP EMAIL STEP COMPONENT ==>
const SetupEmailStep = memo(
  ({ initialEmail, onSubmit }: SetupEmailStepProps) => {
    // FORM SETUP WITH ZOD RESOLVER — DEFAULT VALUE PRE-FILLED FROM INVITE LINK IF PRESENT
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<SetupEmailValues>({
      // ZOD SCHEMA RESOLVER FOR VALIDATION
      resolver: zodResolver(setupEmailSchema),
      // VALIDATE AND CLEAR ERRORS ON CHANGE
      mode: "onChange",
      // DEFAULT VALUES — PRE-FILLED FROM QUERY PARAM WHEN THE INVITE LINK WAS USED
      defaultValues: { email: initialEmail },
    });
    // HANDLE FORM SUBMIT — PASS VALIDATED EMAIL TO PARENT, NO API CALL HERE
    const handleFormSubmit = useCallback(
      (data: SetupEmailValues): void => {
        // CALL PARENT SUBMIT WITH VALIDATED EMAIL
        onSubmit(data.email);
      },
      [onSubmit],
    );
    // RETURNING SETUP EMAIL STEP
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
          <h1 className="font-display text-2xl font-bold">
            Complete Your Account
          </h1>
          {/* SUBTITLE */}
          <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
            Confirm the email address your invite was sent to, then enter the
            setup code from that email on the next step.
          </p>
        </div>
        {/* EMAIL FORM */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* EMAIL FIELD */}
          <div>
            <Label htmlFor="setup-email">Email Address</Label>
            <Input
              id="setup-email"
              type="email"
              placeholder="you@milkshop.com"
              className="mt-1.5"
              {...register("email")}
            />
            {/* EMAIL VALIDATION ERROR */}
            {errors.email && (
              <p className="text-destructive text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          {/* CONTINUE BUTTON */}
          <Button type="submit" className="w-full">
            Continue
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
SetupEmailStep.displayName = "SetupEmailStep";

// <== EXPORT ==>
export default SetupEmailStep;
