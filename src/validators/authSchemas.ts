// <== IMPORTS ==>
import { z } from "zod";

// <== LOGIN SCHEMA ==>
export const loginSchema = z.object({
  // <== EMAIL FIELD ==>
  email: z
    .string()
    .min(1, { message: "Email is Required!" })
    .email({ message: "Please Provide a Valid Email Address!" }),
  // <== PASSWORD FIELD ==>
  password: z.string().min(1, { message: "Password is Required!" }),
});

// <== SHARED PASSWORD STRENGTH RULES FOR FORGOT PASSWORD RESET ==>
const forgotResetPasswordRules = z
  .string({ required_error: "Password is Required!" })
  .min(8, { message: "Password must be at least 8 Characters!" })
  .regex(/[A-Z]/, { message: "One uppercase letter is Required!" })
  .regex(/[a-z]/, { message: "One lowercase letter is Required!" })
  .regex(/[0-9]/, { message: "One digit is Required!" })
  .regex(/[^A-Za-z0-9]/, { message: "One special character is Required!" });

// <== FORGOT PASSWORD EMAIL SCHEMA ==>
export const forgotPasswordEmailSchema = z.object({
  // <== EMAIL FIELD ==>
  email: z
    .string({ required_error: "Email is Required!" })
    .email({ message: "Please provide a Valid Email Address!" }),
});

// <== FORGOT PASSWORD RESET SCHEMA ==>
export const forgotPasswordResetSchema = z
  .object({
    // <== NEW PASSWORD FIELD ==>
    newPassword: forgotResetPasswordRules,
    // <== CONFIRM PASSWORD FIELD ==>
    confirmPassword: z.string({
      required_error: "Please Confirm your Password!",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not Match!",
    path: ["confirmPassword"],
  });

// <== INFERRED LOGIN TYPE FROM LOGIN SCHEMA ==>
export type LoginFormValues = z.infer<typeof loginSchema>;
// <== INFERRED FORGOT PASSWORD EMAIL TYPE FROM FORGOT PASSWORD EMAIL SCHEMA ==>
export type ForgotPasswordEmailValues = z.infer<
  typeof forgotPasswordEmailSchema
>;
// <== INFERRED FORGOT PASSWORD RESET TYPE FROM FORGOT PASSWORD RESET SCHEMA ==>
export type ForgotPasswordResetValues = z.infer<
  typeof forgotPasswordResetSchema
>;
