// <== IMPORTS ==>
import { z } from "zod";

// <== EXPENDITURE CATEGORY ENUM VALUES ==>
const EXPENDITURE_CATEGORIES = [
  "supplies",
  "meals",
  "transport",
  "misc",
] as const;

// <== TITLE VALIDATOR ==>
const titleSchema = z
  .string()
  .min(1, { message: "Title is Required!" })
  .min(2, { message: "Title must be at least 2 Characters!" })
  .max(150, { message: "Title must not exceed 150 Characters!" });

// <== CATEGORY VALIDATOR ==>
const categorySchema = z.enum(EXPENDITURE_CATEGORIES, {
  required_error: "Category is Required!",
  invalid_type_error: "Please Select a Valid Category!",
});

// <== AMOUNT VALIDATOR ==>
const amountSchema = z
  .number({
    required_error: "Amount is Required!",
    invalid_type_error: "Amount must be a Valid Number!",
  })
  .min(1, { message: "Amount must be at least ₨1!" })
  .max(10_000_000, {
    message: "Amount seems too Large. Please Verify!",
  });

// <== NOTE VALIDATOR (OPTIONAL) ==>
const noteSchema = z
  .string()
  .max(300, { message: "Note must not exceed 300 Characters!" })
  .optional()
  .or(z.literal(""));

// <== ADD EXPENDITURE SCHEMA ==>
export const addExpenditureSchema = z.object({
  // <== TITLE FIELD (REQUIRED) ==>
  title: titleSchema,
  // <== CATEGORY FIELD (REQUIRED) ==>
  category: categorySchema,
  // <== AMOUNT FIELD (REQUIRED) ==>
  amount: amountSchema,
  // <== NOTE FIELD (OPTIONAL) ==>
  note: noteSchema,
});

// <== UPDATE EXPENDITURE SCHEMA ==>
export const updateExpenditureSchema = z.object({
  // <== TITLE FIELD (OPTIONAL UPDATE) ==>
  title: titleSchema.optional(),
  // <== CATEGORY FIELD (OPTIONAL UPDATE) ==>
  category: categorySchema.optional(),
  // <== AMOUNT FIELD (OPTIONAL UPDATE) ==>
  amount: amountSchema.optional(),
  // <== NOTE FIELD (OPTIONAL UPDATE) ==>
  note: noteSchema,
});

// <== ADD EXPENDITURE FORM VALUES TYPE ==>
export type AddExpenditureFormValues = z.infer<typeof addExpenditureSchema>;
// <== UPDATE EXPENDITURE FORM VALUES TYPE ==>
export type UpdateExpenditureFormValues = z.infer<
  typeof updateExpenditureSchema
>;
