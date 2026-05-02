// <== IMPORTS ==>
import { z } from "zod";

// <== ADD QUICK SALE SCHEMA ==>
export const addQuickSaleSchema = z.object({
  // <== TYPE FIELD ==>
  type: z.enum(["milk", "yoghurt"], {
    required_error: "Sale type is required!",
    invalid_type_error: "Sale type must be milk or yoghurt!",
  }),
  // <== QUANTITY FIELD ==>
  quantity: z
    .number({
      required_error: "Quantity is Required!",
      invalid_type_error: "Quantity must be a Valid Number!",
    })
    .min(0.1, { message: "Quantity must be at least 0.1!" })
    .max(10_000, { message: "Quantity seems too Large. Please Verify!" }),
  // <== RATE FIELD ==>
  rate: z
    .number({
      required_error: "Rate is Required!",
      invalid_type_error: "Rate must be a Valid Number!",
    })
    .min(1, { message: "Rate must be at least ₨1!" })
    .max(100_000, { message: "Rate seems too Large. Please Verify!" }),
  // <== OPTIONAL DATE FIELD ==>
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Date must be in YYYY-MM-DD Format!",
    })
    .optional()
    .or(z.literal("")),
  // <== OPTIONAL NOTE FIELD ==>
  note: z
    .string()
    .max(300, { message: "Note must not exceed 300 Characters!" })
    .optional()
    .or(z.literal("")),
});

// <== EDIT QUICK SALE FORM SCHEMA ==>
export const editQuickSaleSchema = z.object({
  // <== QUANTITY FIELD (REQUIRED) ==>
  quantity: z
    .number({
      required_error: "Quantity is Required!",
      invalid_type_error: "Quantity must be a Valid Number!",
    })
    .min(0.1, { message: "Quantity must be at least 0.1!" })
    .max(10_000, { message: "Quantity seems too Large. Please Verify!" }),
  // <== RATE FIELD (REQUIRED) ==>
  rate: z
    .number({
      required_error: "Rate is Required!",
      invalid_type_error: "Rate must be a Valid Number!",
    })
    .min(1, { message: "Rate must be at least ₨1!" })
    .max(100_000, { message: "Rate seems too Large. Please Verify!" }),
  // <== OPTIONAL DATE FIELD ==>
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Date must be in YYYY-MM-DD Format!",
    })
    .optional()
    .or(z.literal("")),
  // <== OPTIONAL NOTE FIELD ==>
  note: z
    .string()
    .max(300, { message: "Note must not exceed 300 Characters!" })
    .optional()
    .or(z.literal("")),
});

// <== ADD QUICK SALE FORM VALUES TYPE ==>
export type AddQuickSaleFormValues = z.infer<typeof addQuickSaleSchema>;
// <== EDIT QUICK SALE FORM VALUES TYPE ==>
export type EditQuickSaleFormValues = z.infer<typeof editQuickSaleSchema>;
