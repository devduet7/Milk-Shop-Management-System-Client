// <== IMPORTS ==>
import { z } from "zod";
import type { ModulePermissions } from "@/stores/useAuthStore";

// <== SHARED PERMISSION LEVEL SCHEMA ==>
const permissionLevelSchema = z.enum(["none", "read", "write", "update"], {
  errorMap: () => ({ message: "Invalid permission level!" }),
});

// <== MODULE PERMISSIONS SCHEMA ==>
const modulePermissionsSchema = z.object({
  // <== SALES MODULE ==>
  sales: permissionLevelSchema,
  // <== PURCHASES MODULE ==>
  purchases: permissionLevelSchema,
  // <== CUSTOMERS MODULE ==>
  customers: permissionLevelSchema,
  // <== EXPENDITURES MODULE ==>
  expenditures: permissionLevelSchema,
  // <== RECOVERIES MODULE ==>
  recoveries: permissionLevelSchema,
  // <== QUICK SALES MODULE ==>
  quickSales: permissionLevelSchema,
  // <== DASHBOARD MODULE ==>
  dashboard: permissionLevelSchema,
  // <== ANALYTICS MODULE ==>
  analytics: permissionLevelSchema,
});

// <== INVITE USER SCHEMA ==>
export const inviteUserSchema = z.object({
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
  // <== ROLE FIELD ==>
  role: z.enum(["admin", "user"], { required_error: "Role is Required!" }),
  // <== PERMISSIONS FIELD ==>
  permissions: modulePermissionsSchema,
});

// <== UPDATE PERMISSIONS SCHEMA ==>
export const updatePermissionsSchema = z.object({
  // <== PERMISSIONS OBJECT — ALL MODULES REQUIRED ==>
  permissions: modulePermissionsSchema,
});

// <== EXPLICIT INVITE USER FORM VALUES TYPE ==>
export type InviteUserFormValues = {
  // <== FULL NAME ==>
  fullName: string;
  // <== EMAIL ==>
  email: string;
  // <== ROLE ==>
  role: "admin" | "user";
  // <== PERMISSIONS ==>
  permissions: ModulePermissions;
};

// <== EXPLICIT UPDATE PERMISSIONS FORM VALUES TYPE ==>
export type UpdatePermissionsFormValues = {
  // <== PERMISSIONS ==>
  permissions: ModulePermissions;
};
