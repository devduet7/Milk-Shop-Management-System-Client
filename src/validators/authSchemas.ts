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
// <== REGISTER SCHEMA ==>
export const registerSchema = z.object({
  // <== FULL NAME FIELD ==>
  fullName: z
    .string()
    .min(2, { message: "Full Name must be at least 2 Characters!" })
    .max(50, { message: "Full Name must not exceed 50 Characters!" }),
  // <== EMAIL FIELD ==>
  email: z
    .string()
    .min(1, { message: "Email is Required!" })
    .email({ message: "Please Provide a Valid Email Address!" }),
  // <== PASSWORD FIELD ==>
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 Characters Long!" })
    .regex(/[A-Z]/, {
      message: "Password must Contain at least One Uppercase Letter!",
    })
    .regex(/[a-z]/, {
      message: "Password must Contain at least One Lowercase Letter!",
    })
    .regex(/[0-9]/, { message: "Password must Contain at least One Digit!" })
    .regex(/[^A-Za-z0-9]/, {
      message: "Password must Contain at least one Special Character!",
    }),
  // <== PHONE NUMBER FIELD (OPTIONAL) ==>
  phoneNumber: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, {
      message:
        "Please Provide a Valid Phone number with Country Code (e.g., +1234567890)!",
    })
    .optional()
    .or(z.literal("")),
});

// <== INFERRED LOGIN TYPE FROM LOGIN SCHEMA ==>
export type LoginFormValues = z.infer<typeof loginSchema>;
// <== INFERRED REGISTER TYPE FROM REGISTER SCHEMA ==>
export type RegisterFormValues = z.infer<typeof registerSchema>;
