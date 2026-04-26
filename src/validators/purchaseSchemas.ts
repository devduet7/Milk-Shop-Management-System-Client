// <== IMPORTS ==>
import { z } from "zod";

// <== SUPPLIER NAME VALIDATOR ==>
const supplierSchema = z
  .string()
  .min(1, { message: "Supplier Name is Required!" })
  .min(2, { message: "Supplier Name must be at least 2 Characters!" })
  .max(150, { message: "Supplier Name must not exceed 150 Characters!" });

// <== MILK QUANTITY VALIDATOR ==>
const milkQuantitySchema = z
  .number({
    required_error: "Milk Quantity is Required!",
    invalid_type_error: "Milk Quantity must be a Valid Number!",
  })
  .min(0.5, { message: "Milk Quantity must be at least 0.5 Liters!" })
  .max(100_000, { message: "Milk Quantity seems too Large. Please Verify!" });

// <== TOTAL COST VALIDATOR ==>
const totalCostSchema = z
  .number({
    required_error: "Total Cost is Required!",
    invalid_type_error: "Total Cost must be a Valid Number!",
  })
  .min(1, { message: "Total Cost must be at least ₨1!" })
  .max(100_000_000, {
    message: "Total Cost seems too Large. Please Verify!",
  });

// <== NOTE VALIDATOR (OPTIONAL) ==>
const noteSchema = z
  .string()
  .max(300, { message: "Note must not exceed 300 Characters!" })
  .optional()
  .or(z.literal(""));

// <== ADD PURCHASE SCHEMA ==>
export const addPurchaseSchema = z.object({
  // <== SUPPLIER NAME FIELD (REQUIRED) ==>
  supplier: supplierSchema,
  // <== MILK QUANTITY FIELD (REQUIRED) ==>
  milkQuantity: milkQuantitySchema,
  // <== TOTAL COST FIELD (REQUIRED) ==>
  totalCost: totalCostSchema,
  // <== NOTE FIELD (OPTIONAL) ==>
  note: noteSchema,
});

// <== UPDATE PURCHASE SCHEMA ==>
export const updatePurchaseSchema = z.object({
  // <== SUPPLIER NAME FIELD (OPTIONAL UPDATE) ==>
  supplier: supplierSchema.optional(),
  // <== MILK QUANTITY FIELD (OPTIONAL UPDATE) ==>
  milkQuantity: milkQuantitySchema.optional(),
  // <== TOTAL COST FIELD (OPTIONAL UPDATE) ==>
  totalCost: totalCostSchema.optional(),
  // <== NOTE FIELD (OPTIONAL UPDATE) ==>
  note: noteSchema,
});

// <== ADD PURCHASE FORM VALUES TYPE ==>
export type AddPurchaseFormValues = z.infer<typeof addPurchaseSchema>;
// <== UPDATE PURCHASE FORM VALUES TYPE ==>
export type UpdatePurchaseFormValues = z.infer<typeof updatePurchaseSchema>;
