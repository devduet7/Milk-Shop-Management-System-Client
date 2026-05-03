// <== IMPORTS ==>
import { z } from "zod";

// <== FULL NAME SCHEMA ==>
export const fullNameSchema = z.object({
  // <== FULL NAME FIELD (REQUIRED) ==>
  fullName: z
    .string({ required_error: "Full Name is Required!" })
    .min(2, { message: "Full Name must be at least 2 Characters!" })
    .max(50, { message: "Full Name must not exceed 50 Characters!" })
    .trim(),
});

// <== ADDRESS SCHEMA ==>
export const addressSchema = z.object({
  // <== OPTIONAL ADDRESS FIELD ==>
  address: z
    .string()
    .max(300, { message: "Address must not exceed 300 Characters!" })
    .optional()
    .or(z.literal("")),
});

// <== PHONE SCHEMA ==>
export const phoneSchema = z.object({
  // <== NEW PHONE NUMBER FIELD (E.164 FORMAT) ==>
  newPhone: z
    .string({ required_error: "Phone Number is Required!" })
    .regex(/^\+[1-9]\d{1,14}$/, {
      message:
        "Valid phone number with country code is Required (e.g., +923001234567)!",
    }),
});

// <== EMAIL SCHEMA ==>
export const emailSchema = z.object({
  // <== NEW EMAIL FIELD ==>
  newEmail: z
    .string({ required_error: "Email Address is Required!" })
    .email({ message: "Please provide a Valid Email Address!" }),
});

// <== PASSWORD STRENGTH RULES (SHARED) ==>
const passwordRules = z
  .string({ required_error: "Password is Required!" })
  .min(8, { message: "Password must be at least 8 Characters!" })
  .regex(/[A-Z]/, { message: "One uppercase letter is Required!" })
  .regex(/[a-z]/, { message: "One lowercase letter is Required!" })
  .regex(/[0-9]/, { message: "One digit is Required!" })
  .regex(/[^A-Za-z0-9]/, { message: "One special character is Required!" });

// <== PASSWORD CHANGE SCHEMA ==>
export const passwordChangeSchema = z
  .object({
    // <== NEW PASSWORD FIELD ==>
    newPassword: passwordRules,
    // <== CONFIRM PASSWORD FIELD ==>
    confirmPassword: z.string({
      required_error: "Please Confirm your Password!",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not Match!",
    path: ["confirmPassword"],
  });

// <== PRICING SCHEMA ==>
export const pricingSchema = z.object({
  // <== MILK RATE (OPTIONAL) ==>
  milkRate: z
    .number({ invalid_type_error: "Milk Rate must be a Number!" })
    .min(1, { message: "Milk Rate must be at least ₨1!" })
    .max(100_000, { message: "Milk Rate seems too Large. Please Verify!" })
    .optional(),
  // <== YOGHURT RATE (OPTIONAL) ==>
  yoghurtRate: z
    .number({ invalid_type_error: "Yoghurt Rate must be a Number!" })
    .min(1, { message: "Yoghurt Rate must be at least ₨1!" })
    .max(100_000, { message: "Yoghurt Rate seems too Large. Please Verify!" })
    .optional(),
});

// <== FULL NAME FORM VALUES TYPE ==>
export type FullNameFormValues = z.infer<typeof fullNameSchema>;
// <== ADDRESS FORM VALUES TYPE ==>
export type AddressFormValues = z.infer<typeof addressSchema>;
// <== PHONE FORM VALUES TYPE ==>
export type PhoneFormValues = z.infer<typeof phoneSchema>;
// <== EMAIL FORM VALUES TYPE ==>
export type EmailFormValues = z.infer<typeof emailSchema>;
// <== PASSWORD CHANGE FORM VALUES TYPE ==>
export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;
// <== PRICING FORM VALUES TYPE ==>
export type PricingFormValues = z.infer<typeof pricingSchema>;
