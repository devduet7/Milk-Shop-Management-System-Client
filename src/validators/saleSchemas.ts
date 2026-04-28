// <== IMPORTS ==>
import { z } from "zod";

// <== PRODUCT TYPE VALIDATOR ==>
const productTypeSchema = z.enum(["milk", "yoghurt"], {
  required_error: "Product Type is Required!",
  invalid_type_error: "Please Select a Valid Product Type!",
});

// <== QUANTITY VALIDATOR ==>
const quantitySchema = z
  .number({
    required_error: "Quantity is Required!",
    invalid_type_error: "Quantity must be a Valid Number!",
  })
  .min(0.1, { message: "Quantity must be at least 0.1!" })
  .max(1_000_000, { message: "Quantity seems too Large. Please Verify!" });

// <== PRICE PER UNIT VALIDATOR ==>
const pricePerUnitSchema = z
  .number({
    required_error: "Price per Unit is Required!",
    invalid_type_error: "Price per Unit must be a Valid Number!",
  })
  .min(1, { message: "Price per Unit must be at least ₨1!" })
  .max(1_000_000, {
    message: "Price per Unit seems too Large. Please Verify!",
  });

// <== NOTE VALIDATOR (OPTIONAL) ==>
const noteSchema = z
  .string()
  .max(300, { message: "Note must not exceed 300 Characters!" })
  .optional()
  .or(z.literal(""));

// <== ADD CUSTOMER SALE SCHEMA ==>
export const addCustomerSaleSchema = z
  .object({
    // <== CUSTOMER NAME FIELD (REQUIRED) ==>
    customerName: z
      .string()
      .min(1, { message: "Customer Name is Required!" })
      .min(2, { message: "Customer Name must be at least 2 Characters!" })
      .max(150, { message: "Customer Name must not exceed 150 Characters!" }),
    // <== PRODUCT TYPE FIELD (REQUIRED) ==>
    productType: productTypeSchema,
    // <== QUANTITY FIELD (REQUIRED) ==>
    quantity: quantitySchema,
    // <== PRICE PER UNIT FIELD (REQUIRED) ==>
    pricePerUnit: pricePerUnitSchema,
    // <== PAID AMOUNT FIELD (REQUIRED — 0 <= PAID AMOUNT <= TOTAL AMOUNT) ==>
    paidAmount: z
      .number({
        required_error: "Paid Amount is Required!",
        invalid_type_error: "Paid Amount must be a Valid Number!",
      })
      .min(0, { message: "Paid Amount cannot be Negative!" }),
    // <== NOTE FIELD (OPTIONAL) ==>
    note: noteSchema,
  })
  // <== CROSS-FIELD VALIDATION: PAID AMOUNT CANNOT EXCEED COMPUTED TOTAL AMOUNT ==>
  .superRefine((data, ctx) => {
    // COMPUTE TOTAL AMOUNT FROM QUANTITY AND PRICE
    const total = (data.quantity || 0) * (data.pricePerUnit || 0);
    // VALIDATE PAID AMOUNT DOES NOT EXCEED TOTAL
    if ((data.paidAmount || 0) > total) {
      // ADD CUSTOM ERROR
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Paid Amount cannot Exceed the Total Amount!",
        path: ["paidAmount"],
      });
    }
  });

// <== UPDATE CUSTOMER SALE SCHEMA ==>
export const updateCustomerSaleSchema = z
  .object({
    // <== CUSTOMER NAME FIELD (OPTIONAL UPDATE) ==>
    customerName: z
      .string()
      .min(2, { message: "Customer Name must be at least 2 Characters!" })
      .max(150, { message: "Customer Name must not exceed 150 Characters!" })
      .optional(),
    // <== PRODUCT TYPE FIELD (OPTIONAL UPDATE) ==>
    productType: productTypeSchema.optional(),
    // <== QUANTITY FIELD (OPTIONAL UPDATE) ==>
    quantity: quantitySchema.optional(),
    // <== PRICE PER UNIT FIELD (OPTIONAL UPDATE) ==>
    pricePerUnit: pricePerUnitSchema.optional(),
    // <== PAID AMOUNT FIELD (OPTIONAL UPDATE) ==>
    paidAmount: z
      .number({ invalid_type_error: "Paid Amount must be a Valid Number!" })
      .min(0, { message: "Paid Amount cannot be Negative!" })
      .optional(),
    // <== NOTE FIELD (OPTIONAL UPDATE) ==>
    note: noteSchema,
  })
  // <== CROSS-FIELD VALIDATION: PAID AMOUNT CANNOT EXCEED COMPUTED TOTAL AMOUNT ==>
  .superRefine((data, ctx) => {
    // ONLY VALIDATE WHEN BOTH QUANTITY, PRICE, AND PAID ARE PROVIDED TOGETHER
    if (
      data.quantity !== undefined &&
      data.pricePerUnit !== undefined &&
      data.paidAmount !== undefined
    ) {
      // COMPUTE TOTAL FROM NEW VALUES
      const total = data.quantity * data.pricePerUnit;
      // VALIDATE PAID AMOUNT
      if (data.paidAmount > total) {
        // ADD CUSTOM ERROR
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Paid Amount cannot Exceed the Total Amount!",
          path: ["paidAmount"],
        });
      }
    }
  });

// <== ADD SHOP SALE SCHEMA ==>
export const addShopSaleSchema = z.object({
  // <== PRODUCT TYPE FIELD (REQUIRED) ==>
  productType: productTypeSchema,
  // <== QUANTITY FIELD (REQUIRED) ==>
  quantity: quantitySchema,
  // <== PRICE PER UNIT FIELD (REQUIRED) ==>
  pricePerUnit: pricePerUnitSchema,
  // <== NOTE FIELD (OPTIONAL) ==>
  note: noteSchema,
});

// <== UPDATE SHOP SALE SCHEMA ==>
export const updateShopSaleSchema = z.object({
  // <== PRODUCT TYPE FIELD (OPTIONAL UPDATE) ==>
  productType: productTypeSchema.optional(),
  // <== QUANTITY FIELD (OPTIONAL UPDATE) ==>
  quantity: quantitySchema.optional(),
  // <== PRICE PER UNIT FIELD (OPTIONAL UPDATE) ==>
  pricePerUnit: pricePerUnitSchema.optional(),
  // <== NOTE FIELD (OPTIONAL UPDATE) ==>
  note: noteSchema,
});

// <== ADD CUSTOMER SALE FORM VALUES TYPE ==>
export type AddCustomerSaleFormValues = z.infer<typeof addCustomerSaleSchema>;
// <== UPDATE CUSTOMER SALE FORM VALUES TYPE ==>
export type UpdateCustomerSaleFormValues = z.infer<
  typeof updateCustomerSaleSchema
>;
// <== ADD SHOP SALE FORM VALUES TYPE ==>
export type AddShopSaleFormValues = z.infer<typeof addShopSaleSchema>;
// <== UPDATE SHOP SALE FORM VALUES TYPE ==>
export type UpdateShopSaleFormValues = z.infer<typeof updateShopSaleSchema>;
