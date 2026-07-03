// <== IMPORTS ==>
import { useAuthStore, type ModulePermissions } from "@/stores/useAuthStore";

// <== MODULE KEY TYPE — ONE OF THE 8 KEYS IN THE PERMISSION MATRIX ==>
type ModuleKey = keyof ModulePermissions;

// <== PERMISSION RESULT TYPE ==>
interface PermissionResult {
  // <== CURRENT USER'S ROLE ==>
  role: "superadmin" | "admin" | "user" | undefined;
  // <== TRUE IF SUPERADMIN OR ADMIN — THESE ROLES BYPASS THE PERMISSION MATRIX ENTIRELY ==>
  isAdminTier: boolean;
  // <== RAW PERMISSION LEVEL FOR THIS MODULE — ONLY MEANINGFUL FOR USER-TIER (ADMIN-TIER IGNORES THIS) ==>
  level: "none" | "read" | "write" | "update";
  // <== CAN VIEW THE MODULE AT ALL (READ AND ABOVE, OR ADMIN-TIER) ==>
  canView: boolean;
  // <== CAN CREATE NEW RECORDS (WRITE AND ABOVE, OR ADMIN-TIER) ==>
  canCreate: boolean;
  // <== CAN EDIT EXISTING RECORDS (UPDATE ONLY, OR ADMIN-TIER) ==>
  canEdit: boolean;
  // <== CAN DELETE RECORDS — NEVER GOVERNED BY THE PERMISSION MATRIX, ADMIN-TIER ONLY, ALWAYS ==>
  canDelete: boolean;
}

/**
 * DERIVES CLIENT-SIDE PERMISSION FLAGS FOR A GIVEN MODULE
 * THIS IS A UI-CONVENIENCE LAYER ONLY — REAL AUTHORIZATION IS ENFORCED SERVER-SIDE.
 * HIDING A BUTTON HERE DOES NOT MAKE THE UNDERLYING ENDPOINT SAFE ON ITS OWN.
 * @param {ModuleKey} moduleKey - THE MODULE TO CHECK PERMISSIONS FOR
 * @returns {PermissionResult} DERIVED PERMISSION FLAGS
 */
// <== USE PERMISSION HOOK ==>
export const usePermission = (moduleKey: ModuleKey): PermissionResult => {
  // GETTING CURRENT USER FROM AUTH STORE
  const user = useAuthStore((state) => state.user);
  // EXTRACTING ROLE
  const role = user?.role;
  // SUPERADMIN AND ADMIN BYPASS THE PERMISSION MATRIX ENTIRELY — IT DOES NOT APPLY TO THEM
  const isAdminTier = role === "superadmin" || role === "admin";
  // EXTRACTING THE RAW PERMISSION LEVEL FOR THIS MODULE — DEFAULTS TO "NONE" IF UNSET
  const level = user?.permissions?.[moduleKey] ?? "none";
  // CAN VIEW — ADMIN-TIER ALWAYS, OTHERWISE ANY LEVEL ABOVE "NONE"
  const canView = isAdminTier || level !== "none";
  // CAN CREATE — ADMIN-TIER ALWAYS, OTHERWISE "WRITE" OR "UPDATE"
  const canCreate = isAdminTier || level === "write" || level === "update";
  // CAN EDIT — ADMIN-TIER ALWAYS, OTHERWISE ONLY "UPDATE"
  const canEdit = isAdminTier || level === "update";
  // CAN DELETE — ADMIN-TIER ONLY, ALWAYS. NEVER DERIVED FROM LEVEL
  const canDelete = isAdminTier;
  // RETURNING DERIVED PERMISSION FLAGS
  return { role, isAdminTier, level, canView, canCreate, canEdit, canDelete };
};
