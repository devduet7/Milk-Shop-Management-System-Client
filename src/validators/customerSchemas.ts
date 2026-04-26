// <== IMPORTS ==>
import { z } from "zod";

// <== CUSTOMER NAME VALIDATOR ==>
const customerNameSchema = z
  .string()
  .min(1, { message: "Customer Name is Required!" })
  .min(2, { message: "Customer Name must be at least 2 Characters!" })
  .max(50, { message: "Customer Name must not exceed 50 Characters!" })
  .regex(/^[a-zA-Z\s'-]+$/, {
    message:
      "Customer Name may only contain Letters, Spaces, Hyphens, and Apostrophes!",
  });

// <== PHONE VALIDATOR (PAKISTANI FORMAT — OPTIONAL) ==>
const phoneSchema = z
  .string()
  .regex(/^((\+92|0092|92)?[-.\s]?)?0?[3][0-9]{2}[-.\s]?[0-9]{7}$/, {
    message:
      "Please Provide a Valid Pakistani Phone Number (e.g. 0300-1234567)!",
  })
  .optional()
  .or(z.literal(""));

// <== ADDRESS VALIDATOR ==>
const addressSchema = z
  .string()
  .max(200, { message: "Address must not exceed 200 Characters!" })
  .optional()
  .or(z.literal(""));

// <== DAILY MILK VALIDATOR ==>
const dailyMilkSchema = z
  .number({
    required_error: "Daily Milk Quantity is Required!",
    invalid_type_error: "Daily Milk must be a Valid Number!",
  })
  .min(0.5, { message: "Daily Milk must be at least 0.5 Liters!" })
  .max(100, { message: "Daily Milk cannot exceed 100 Liters!" })
  .multipleOf(0.5, { message: "Daily Milk must be in 0.5L Increments!" });

// <== PRICE PER LITER VALIDATOR ==>
const pricePerLiterSchema = z
  .number({
    required_error: "Price per Liter is Required!",
    invalid_type_error: "Price per Liter must be a Valid Number!",
  })
  .min(1, { message: "Price per Liter must be at least ₨1!" })
  .max(10000, { message: "Price per Liter cannot exceed ₨10,000!" });

// <== DATE STRING VALIDATOR (YYYY-MM-DD) ==>
const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  // <== MESSAGE FOR DATE STRING VALIDATOR ==>
  message: "Date must be in YYYY-MM-DD Format!",
});

// <== BILLING MONTH VALIDATOR (YYYY-MM) ==>
const billingMonthSchema = z.string().regex(/^\d{4}-\d{2}$/, {
  // <== MESSAGE FOR BILLING MONTH VALIDATOR ==>
  message: "Billing Month must be in YYYY-MM Format!",
});

// <== ADD CUSTOMER SCHEMA ==>
export const addCustomerSchema = z.object({
  // <== NAME FIELD (REQUIRED) ==>
  name: customerNameSchema,
  // <== PHONE FIELD (OPTIONAL) ==>
  phone: phoneSchema,
  // <== ADDRESS FIELD (OPTIONAL) ==>
  address: addressSchema,
  // <== DAILY MILK FIELD (REQUIRED) ==>
  dailyMilk: dailyMilkSchema,
  // <== PRICE PER LITER FIELD (REQUIRED) ==>
  pricePerLiter: pricePerLiterSchema,
});

// <== UPDATE CUSTOMER SCHEMA ==>
export const updateCustomerSchema = z.object({
  // <== NAME FIELD (OPTIONAL UPDATE) ==>
  name: customerNameSchema.optional(),
  // <== PHONE FIELD (OPTIONAL UPDATE) ==>
  phone: phoneSchema,
  // <== ADDRESS FIELD (OPTIONAL UPDATE) ==>
  address: addressSchema,
  // <== DAILY MILK FIELD (OPTIONAL UPDATE) ==>
  dailyMilk: dailyMilkSchema.optional(),
  // <== PRICE PER LITER FIELD (OPTIONAL UPDATE) ==>
  pricePerLiter: pricePerLiterSchema.optional(),
});

// <== MARK DELIVERY SCHEMA ==>
export const markDeliverySchema = z.object({
  // <== DATE FIELD (YYYY-MM-DD) ==>
  date: dateStringSchema,
  // <== STATUS FIELD (ENUM) ==>
  status: z.enum(["delivered", "missed", "unmarked"], {
    required_error: "Delivery Status is Required!",
    invalid_type_error:
      "Delivery Status must be delivered, missed, or unmarked!",
  }),
});

// <== ADD PAYMENT SCHEMA ==>
export const addPaymentSchema = z.object({
  // <== PAYMENT AMOUNT (REQUIRED, POSITIVE) ==>
  amount: z
    .number({
      required_error: "Payment Amount is Required!",
      invalid_type_error: "Payment Amount must be a Valid Number!",
    })
    .min(1, { message: "Payment Amount must be at least ₨1!" })
    .max(10_000_000, {
      message: "Payment Amount seems too large. Please verify!",
    }),
  // <== BILLING MONTH (YYYY-MM) ==>
  billingMonth: billingMonthSchema,
  // <== OPTIONAL PAYMENT DATE (YYYY-MM-DD) ==>
  paymentDate: dateStringSchema.optional().or(z.literal("")),
  // <== OPTIONAL NOTE ==>
  note: z
    .string()
    .max(500, { message: "Note must not exceed 500 Characters!" })
    .optional()
    .or(z.literal("")),
});

// <== ADD CUSTOMER FORM VALUES TYPE ==>
export type AddCustomerFormValues = z.infer<typeof addCustomerSchema>;
// <== UPDATE CUSTOMER FORM VALUES TYPE ==>
export type UpdateCustomerFormValues = z.infer<typeof updateCustomerSchema>;
// <== MARK DELIVERY FORM VALUES TYPE ==>
export type MarkDeliveryFormValues = z.infer<typeof markDeliverySchema>;
// <== ADD PAYMENT FORM VALUES TYPE ==>
export type AddPaymentFormValues = z.infer<typeof addPaymentSchema>;
