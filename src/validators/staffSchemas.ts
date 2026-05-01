// <== IMPORTS ==>
import { z } from "zod";

// <== NOTE VALIDATOR (OPTIONAL) ==>
const noteSchema = z
  .string()
  .max(300, { message: "Note must not exceed 300 Characters!" })
  .optional()
  .or(z.literal(""));

// <== ADD STAFF SCHEMA ==>
export const addStaffSchema = z.object({
  // <== NAME FIELD (REQUIRED) ==>
  name: z
    .string({ required_error: "Staff Name is Required!" })
    .min(1, { message: "Staff Name is Required!" })
    .max(100, { message: "Staff Name must not exceed 100 Characters!" })
    .trim(),
  // <== MONTHLY SALARY FIELD (REQUIRED) ==>
  monthlySalary: z
    .number({
      required_error: "Monthly Salary is Required!",
      invalid_type_error: "Monthly Salary must be a Valid Number!",
    })
    .min(1, { message: "Monthly Salary must be at least ₨1!" })
    .max(10_000_000, {
      message: "Monthly Salary seems too Large. Please Verify!",
    }),
  // <== OPTIONAL NOTE FIELD ==>
  note: noteSchema,
});

// <== UPDATE STAFF SCHEMA ==>
export const updateStaffSchema = z.object({
  // <== OPTIONAL NAME FIELD ==>
  name: z
    .string()
    .min(1, { message: "Staff Name cannot be Empty!" })
    .max(100, { message: "Staff Name must not exceed 100 Characters!" })
    .trim()
    .optional(),
  // <== OPTIONAL MONTHLY SALARY FIELD ==>
  monthlySalary: z
    .number({
      invalid_type_error: "Monthly Salary must be a Valid Number!",
    })
    .min(1, { message: "Monthly Salary must be at least ₨1!" })
    .max(10_000_000, {
      message: "Monthly Salary seems too Large. Please Verify!",
    })
    .optional(),
  // <== OPTIONAL NOTE FIELD ==>
  note: noteSchema,
});

// <== PAY SALARY SCHEMA ==>
export const paySalarySchema = z.object({
  // <== PAYMENT AMOUNT FIELD (REQUIRED) ==>
  amount: z
    .number({
      required_error: "Payment Amount is Required!",
      invalid_type_error: "Payment Amount must be a Valid Number!",
    })
    .min(1, { message: "Payment Amount must be at least ₨1!" })
    .max(10_000_000, {
      message: "Payment Amount seems too Large. Please Verify!",
    }),
  // <== BILLING MONTH FIELD (REQUIRED) ==>
  month: z
    .string({ required_error: "Billing Month is Required!" })
    .min(1, { message: "Billing Month is Required!" })
    .regex(/^\d{4}-\d{2}$/, {
      message: "Month must be in YYYY-MM Format!",
    }),
});

// <== ADD EXTRA ALLOCATION SCHEMA ==>
export const addExtraAllocationSchema = z.object({
  // <== AMOUNT FIELD (REQUIRED) ==>
  amount: z
    .number({
      required_error: "Amount is Required!",
      invalid_type_error: "Amount must be a Valid Number!",
    })
    .min(1, { message: "Amount must be at least ₨1!" })
    .max(10_000_000, {
      message: "Amount seems too Large. Please Verify!",
    }),
  // <== OPTIONAL DATE FIELD (YYYY-MM-DD) ==>
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Date must be in YYYY-MM-DD Format!",
    })
    .optional()
    .or(z.literal("")),
  // <== OPTIONAL NOTE FIELD ==>
  note: noteSchema,
});

// <== ADD STAFF FORM VALUES TYPE ==>
export type AddStaffFormValues = z.infer<typeof addStaffSchema>;
// <== UPDATE STAFF FORM VALUES TYPE ==>
export type UpdateStaffFormValues = z.infer<typeof updateStaffSchema>;
// <== PAY SALARY FORM VALUES TYPE ==>
export type PaySalaryFormValues = z.infer<typeof paySalarySchema>;
// <== ADD EXTRA ALLOCATION FORM VALUES TYPE ==>
export type AddExtraAllocationFormValues = z.infer<
  typeof addExtraAllocationSchema
>;
