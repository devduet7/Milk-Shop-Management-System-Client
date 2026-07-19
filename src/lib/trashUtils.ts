// <== IMPORTS ==>
import {
  Zap,
  Users,
  Wallet,
  Package,
  Receipt,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import type { TrashRecord, TrashCategory } from "@/types/trash-types";

// <== CATEGORY DISPLAY CONFIG TYPE ==>
export type TrashCategoryConfig = {
  // <== DISPLAY LABEL ==>
  label: string;
  // <== LUCIDE ICON ==>
  icon: LucideIcon;
  // <== ICON BADGE COLOR CLASSES ==>
  className: string;
};

// <== CATEGORY DISPLAY CONFIG ==>
export const CATEGORY_CONFIG: Record<TrashCategory, TrashCategoryConfig> = {
  // QUICK SALE
  QuickSale: {
    label: "Quick Sale",
    icon: Zap,
    className: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  },
  // SALE
  Sale: {
    label: "Sale",
    icon: Receipt,
    className: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
  },
  // CUSTOMER
  Customer: {
    label: "Customer",
    icon: Users,
    className: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  },
  // EXPENDITURE
  Expenditure: {
    label: "Expenditure",
    icon: Wallet,
    className: "text-red-600 dark:text-red-400 bg-red-500/10",
  },
  // PURCHASE
  Purchase: {
    label: "Purchase",
    icon: Package,
    className: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
  },
  // STAFF MEMBER
  StaffMember: {
    label: "Staff Member",
    icon: UserCog,
    className: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10",
  },
};

/**
 * GET DISPLAY TITLE FOR A TRASH RECORD FROM ITS SNAPSHOT
 */
// <== GET ITEM TITLE ==>
export const getItemTitle = (record: TrashRecord): string => {
  // SHORTHAND FOR SNAPSHOT
  const s = record.snapshot;
  // SWITCHING ON ENTITY TYPE
  switch (record.entityType) {
    // IF THE ENTITY IS A CUSTOMER
    case "Customer":
      // RETURN THE CUSTOMER'S NAME
      return typeof s.name === "string" ? s.name : "Customer";
    // IF THE ENTITY IS A STAFF MEMBER
    case "StaffMember":
      // RETURN THE STAFF MEMBER'S NAME
      return typeof s.name === "string" ? s.name : "Staff Member";
    // IF THE ENTITY IS A PURCHASE
    case "Purchase":
      // RETURN THE PURCHASE'S SUPPLIER
      return typeof s.supplier === "string" ? s.supplier : "Purchase";
    // IF THE ENTITY IS AN EXPENDITURE
    case "Expenditure":
      // RETURN THE EXPENDITURE'S TITLE
      return typeof s.title === "string" ? s.title : "Expenditure";
    // IF THE ENTITY IS A SALE
    case "Sale":
      // RETURN THE SALE'S CUSTOMER NAME
      return typeof s.customerName === "string" && s.customerName
        ? s.customerName
        : s.saleType === "shop"
          ? "Shop Sale"
          : "Customer Sale";
    // IF THE ENTITY IS A QUICK SALE
    case "QuickSale":
      // RETURN THE QUICK SALE'S TYPE
      return `${s.type === "milk" ? "Milk" : "Yoghurt"} Quick Sale`;
    // IF THE ENTITY IS UNKNOWN
    default:
      // RETURN "RECORD"
      return "Record";
  }
};

// <== HELPER: GET DISPLAY SUBTITLE FOR A TRASH RECORD FROM ITS SNAPSHOT ==>
export const getItemSubtitle = (record: TrashRecord): string => {
  // SHORTHAND FOR SNAPSHOT
  const s = record.snapshot;
  // SWITCHING ON ENTITY TYPE
  switch (record.entityType) {
    // IF THE ENTITY IS A CUSTOMER
    case "Customer":
      // RETURN THE CUSTOMER'S NAME
      return `${(s.dailyMilk as number) ?? "—"}L/day · ₨${(s.pricePerLiter as number) ?? "—"}/L`;
    // IF THE ENTITY IS A STAFF MEMBER
    case "StaffMember":
      // RETURN THE STAFF MEMBER'S NAME
      return `₨${((s.monthlySalary as number) ?? 0).toLocaleString()}/month`;
    // IF THE ENTITY IS A PURCHASE
    case "Purchase":
      // RETURN THE PURCHASE'S SUPPLIER
      return `${(s.milkQuantity as number) ?? "—"}L · ₨${((s.totalCost as number) ?? 0).toLocaleString()}${s.date ? ` · ${s.date}` : ""}`;
    // IF THE ENTITY IS AN EXPENDITURE
    case "Expenditure":
      // RETURN THE EXPENDITURE'S TITLE
      return `${(s.category as string) ?? ""} · ₨${((s.amount as number) ?? 0).toLocaleString()}${s.date ? ` · ${s.date}` : ""}`;
    // IF THE ENTITY IS A SALE
    case "Sale":
      // RETURN THE SALE'S CUSTOMER NAME
      return `${(s.productType as string) ?? ""} · ₨${((s.totalAmount as number) ?? 0).toLocaleString()}${s.date ? ` · ${s.date}` : ""}`;
    // IF THE ENTITY IS A QUICK SALE
    case "QuickSale":
      // RETURN THE QUICK SALE'S TYPE
      return `${(s.quantity as number) ?? "—"}${s.type === "milk" ? "L" : "kg"} · ₨${((s.total as number) ?? 0).toLocaleString()}${s.date ? ` · ${s.date}` : ""}`;
    // IF THE ENTITY IS UNKNOWN
    default:
      // RETURN EMPTY STRING
      return "";
  }
};

/**
 * GET WHOLE DAYS REMAINING UNTIL A TRASH ENTRY IS AUTO-PURGED
 */
// <== GET DAYS UNTIL PURGE ==>
export const getDaysUntilPurge = (expiresAt: string): number => {
  // COMPUTING MILLISECOND DIFFERENCE
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  // CONVERTING TO WHOLE DAYS, NEVER NEGATIVE
  return Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
};
