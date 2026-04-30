// <== IMPORTS ==>
import { z } from "zod";

// <== BILLING MONTH VALIDATOR (YYYY-MM) ==>
const billingMonthSchema = z
  .string()
  .min(1, { message: "Billing Month is Required!" })
  .regex(/^\d{4}-\d{2}$/, {
    message: "Billing Month must be in YYYY-MM Format!",
  });

// <== PAYMENT DATE VALIDATOR (YYYY-MM-DD — OPTIONAL) ==>
const paymentDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Payment Date must be in YYYY-MM-DD Format!",
  })
  .optional()
  .or(z.literal(""));

// <== NOTE VALIDATOR (OPTIONAL) ==>
const noteSchema = z
  .string()
  .max(300, { message: "Note must not exceed 300 Characters!" })
  .optional()
  .or(z.literal(""));

// <== ADD DELIVERY PAYMENT SCHEMA ==>
export const addDeliveryPaymentSchema = z.object({
  // <== PAYMENT AMOUNT FIELD (REQUIRED, POSITIVE) ==>
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
  billingMonth: billingMonthSchema,
  // <== OPTIONAL PAYMENT DATE FIELD ==>
  paymentDate: paymentDateSchema,
  // <== OPTIONAL NOTE FIELD ==>
  note: noteSchema,
});

// <== UPDATE SALE PAYMENT SCHEMA ==>
export const updateSalePaymentSchema = z.object({
  // <== PAID AMOUNT FIELD ==>
  paidAmount: z
    .number({
      required_error: "Paid Amount is Required!",
      invalid_type_error: "Paid Amount must be a Valid Number!",
    })
    .min(0, { message: "Paid Amount cannot be Negative!" })
    .max(10_000_000, {
      message: "Paid Amount seems too Large. Please Verify!",
    }),
});

// <== ADD DELIVERY PAYMENT FORM VALUES TYPE ==>
export type AddDeliveryPaymentFormValues = z.infer<
  typeof addDeliveryPaymentSchema
>;
// <== UPDATE SALE PAYMENT FORM VALUES TYPE ==>
export type UpdateSalePaymentFormValues = z.infer<
  typeof updateSalePaymentSchema
>;
