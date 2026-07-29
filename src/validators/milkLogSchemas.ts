// <== IMPORTS ==>
import { z } from "zod";

// <== ENTRY TYPE VALIDATOR ==>
const typeSchema = z.enum(["leftover", "yoghurt"], {
  required_error: "Entry Type is Required!",
  invalid_type_error: "Entry Type must be Leftover or Yoghurt!",
});

// <== QUANTITY VALIDATOR ==>
const quantitySchema = z
  .number({
    required_error: "Quantity is Required!",
    invalid_type_error: "Quantity must be a Valid Number!",
  })
  .min(0, { message: "Quantity cannot be Negative!" })
  .max(100_000, { message: "Quantity seems too Large. Please Verify!" });

// <== NOTE VALIDATOR (OPTIONAL) ==>
const noteSchema = z
  .string()
  .max(300, { message: "Note must not exceed 300 Characters!" })
  .optional()
  .or(z.literal(""));

// <== ADD MILK LOG SCHEMA ==>
export const addMilkLogSchema = z.object({
  // <== ENTRY TYPE FIELD (REQUIRED) ==>
  type: typeSchema,
  // <== QUANTITY FIELD (REQUIRED) ==>
  quantity: quantitySchema,
  // <== NOTE FIELD (OPTIONAL) ==>
  note: noteSchema,
});

// <== UPDATE MILK LOG SCHEMA ==>
export const updateMilkLogSchema = z.object({
  // <== ENTRY TYPE FIELD (OPTIONAL UPDATE) ==>
  type: typeSchema.optional(),
  // <== QUANTITY FIELD (OPTIONAL UPDATE) ==>
  quantity: quantitySchema.optional(),
  // <== NOTE FIELD (OPTIONAL UPDATE) ==>
  note: noteSchema,
});

// <== ADD MILK LOG FORM VALUES TYPE ==>
export type AddMilkLogFormValues = z.infer<typeof addMilkLogSchema>;
// <== UPDATE MILK LOG FORM VALUES TYPE ==>
export type UpdateMilkLogFormValues = z.infer<typeof updateMilkLogSchema>;
