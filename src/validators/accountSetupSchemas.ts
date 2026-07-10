// <== IMPORTS ==>
import { z } from "zod";

// <== SETUP EMAIL SCHEMA — STEP 1 OF ACCOUNT SETUP ==>
export const setupEmailSchema = z.object({
  // <== EMAIL FIELD ==>
  email: z
    .string()
    .min(1, { message: "Email is Required!" })
    .email({ message: "Please Provide a Valid Email Address!" }),
});

// <== SETUP PASSWORD SCHEMA — FINAL STEP OF ACCOUNT SETUP ==>
export const setupPasswordSchema = z
  .object({
    // <== NEW PASSWORD FIELD ==>
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 Characters!" })
      .regex(/[A-Z]/, {
        message: "Password must Contain at least One Uppercase Letter!",
      })
      .regex(/[a-z]/, {
        message: "Password must Contain at least One Lowercase Letter!",
      })
      .regex(/[0-9]/, { message: "Password must Contain at least One Digit!" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must Contain at least One Special Character!",
      }),
    // <== CONFIRM PASSWORD FIELD ==>
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not Match!",
    path: ["confirmPassword"],
  });

// <== SETUP EMAIL VALUES TYPE ==>
export type SetupEmailValues = z.infer<typeof setupEmailSchema>;
// <== SETUP PASSWORD VALUES TYPE ==>
export type SetupPasswordValues = z.infer<typeof setupPasswordSchema>;
