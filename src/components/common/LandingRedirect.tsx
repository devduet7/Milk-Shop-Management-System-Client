// <== IMPORTS ==>
import QuickSales from "@/pages/QuickSales";
import { Navigate } from "react-router-dom";
import { useAuthStore, type ModulePermissions } from "@/stores/useAuthStore";

// <== MODULE-TO-ROUTE MAP ==>
const MODULE_ROUTES: Record<keyof ModulePermissions, string> = {
  quickSales: "/",
  sales: "/sales",
  purchases: "/purchases",
  customers: "/customers",
  expenditures: "/expenditures",
  recoveries: "/recoveries",
  dashboard: "/dashboard",
  analytics: "/analytics",
};

// <== FALLBACK PRIORITY ORDER — TRIED IN THIS SEQUENCE WHEN QUICK SALES IS NOT ACCESSIBLE ==>
const FALLBACK_ORDER: (keyof ModulePermissions)[] = [
  "sales",
  "purchases",
  "customers",
  "expenditures",
  "recoveries",
  "dashboard",
  "analytics",
];

/**
 * LANDING REDIRECT — RESOLVES THE "/" ROUTE TO THE RIGHT DESTINATION FOR THE CURRENT USER
 */
// <== LANDING REDIRECT COMPONENT ==>
export const LandingRedirect = () => {
  // GETTING CURRENT USER FROM AUTH STORE
  const user = useAuthStore((state) => state.user);
  // DEFENSIVE GUARD — PROTECTED ROUTE ALREADY GUARANTEES AUTHENTICATION, BUT THE USER OBJECT
  if (!user) return null;
  // ADMIN-TIER ALWAYS SEES QUICK SALES — THE PERMISSION MATRIX DOES NOT APPLY TO THEM
  if (user.role === "superadmin" || user.role === "admin") {
    // RENDER QUICK SALES DIRECTLY — NO REDIRECT, NO EXTRA HOP
    return <QuickSales />;
  }
  // USER-TIER: CHECK IF THEY CAN VIEW QUICK SALES FIRST (THE COMMON, EXPECTED CASE)
  const quickSalesLevel = user.permissions?.quickSales ?? "none";
  // IF THEY HAVE ANY ACCESS ABOVE "NONE", RENDER DIRECTLY — NO REDIRECT, NO EXTRA HOP
  if (quickSalesLevel !== "none") {
    // RENDER QUICK SALES DIRECTLY — NO REDIRECT, NO EXTRA HOP
    return <QuickSales />;
  }
  // QUICK SALES IS NOT ACCESSIBLE — WALK THE FALLBACK PRIORITY ORDER
  for (const moduleKey of FALLBACK_ORDER) {
    // GETTING THIS MODULE'S PERMISSION LEVEL
    const level = user.permissions?.[moduleKey] ?? "none";
    // IF ACCESSIBLE, REDIRECT HERE
    if (level !== "none") {
      // REDIRECT TO THE FIRST ACCESSIBLE MODULE IN THE FALLBACK ORDER
      return <Navigate to={MODULE_ROUTES[moduleKey]} replace />;
    }
  }
  // NOTHING IN THE MATRIX IS ACCESSIBLE — FALL BACK TO SETTINGS, ALWAYS REACHABLE
  return <Navigate to="/settings" replace />;
};
