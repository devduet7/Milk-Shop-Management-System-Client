// <== IMPORTS ==>
import { type ModulePermissions, type UserRole } from "@/stores/useAuthStore";

// <== RE-EXPORT FOR CONVENIENCE ==>
export type { ModulePermissions, UserRole };

// <== TEAM MEMBER TYPE ==>
export type TeamMember = {
  // <== MONGODB ID ==>
  _id: string;
  // <== FULL NAME ==>
  fullName: string;
  // <== EMAIL ==>
  email: string;
  // <== ROLE ==>
  role: UserRole;
  // <== MODULE PERMISSIONS ==>
  permissions: ModulePermissions | null;
  // <== ACTIVE STATUS ==>
  isActive: boolean;
  // <== WHETHER THE USER HAS COMPLETED ACCOUNT SETUP ==>
  hasSetPassword: boolean;
  // <== CREATOR ==>
  createdBy: { _id: string; fullName: string } | null;
  // <== CREATED AT ==>
  createdAt: string;
  // <== UPDATED AT ==>
  updatedAt: string;
};

// <== TEAM STATS TYPE ==>
export type TeamStats = {
  // <== TOTAL MEMBER COUNT ==>
  totalMembers: number;
  // <== ACTIVE MEMBER COUNT ==>
  activeMembers: number;
  // <== MEMBERS WHO HAVE NOT YET COMPLETED ACCOUNT SETUP ==>
  pendingSetup: number;
  // <== SUPERADMIN + ADMIN COUNT ==>
  adminsCount: number;
};

// <== TEAM LIST FILTERS TYPE ==>
export type TeamFilters = {
  // <== SEARCH QUERY ==>
  search: string;
  // <== ROLE FILTER ==>
  role: string;
  // <== PAGE ==>
  page: number;
  // <== LIMIT ==>
  limit: number;
};

// <== TEAM LIST DATA TYPE ==>
export type TeamListData = {
  // <== PAGINATED RECORDS ==>
  records: TeamMember[];
  // <== PAGINATION METADATA ==>
  pagination: {
    // <== TOTAL RECORDS ==>
    total: number;
    // <== CURRENT PAGE ==>
    page: number;
    // <== RECORDS PER PAGE ==>
    limit: number;
    // <== TOTAL PAGES ==>
    totalPages: number;
    // <== WHETHER THERE IS A NEXT PAGE ==>
    hasNextPage: boolean;
    // <== WHETHER THERE IS A PREVIOUS PAGE ==>
    hasPrevPage: boolean;
  };
  // <== ACCOUNT-WIDE STATS ==>
  stats: TeamStats;
};

// <== INVITE USER VARIABLES TYPE ==>
export type InviteUserVariables = {
  // <== FULL NAME ==>
  fullName: string;
  // <== EMAIL ==>
  email: string;
  // <== ROLE ==>
  role: "admin" | "user";
  // <== MODULE PERMISSIONS ==>
  permissions?: ModulePermissions;
};

// <== UPDATE PERMISSIONS VARIABLES TYPE ==>
export type UpdatePermissionsVariables = {
  // <== TARGET USER ID ==>
  id: string;
  // <== NEW PERMISSIONS ==>
  permissions: ModulePermissions;
};

// <== UPDATE STATUS VARIABLES TYPE ==>
export type UpdateStatusVariables = {
  // <== TARGET USER ID ==>
  id: string;
  // <== NEW ACTIVE STATUS ==>
  isActive: boolean;
};

// <== API RESPONSE GENERIC WRAPPER ==>
export type ApiResponse<T> = {
  // <== SERVER MESSAGE ==>
  message: string;
  // <== SUCCESS FLAG ==>
  success: boolean;
  // <== RESPONSE DATA ==>
  data: T;
};

// <== API ERROR RESPONSE ==>
export type ApiErrorResponse = {
  // <== ERROR CODE ==>
  code?: string;
  // <== ERROR MESSAGE ==>
  message?: string;
  // <== SUCCESS FLAG ==>
  success?: boolean;
};

// <== TEAM VIEW MODE TYPE ==>
export type TeamViewMode = "table" | "list" | "grid";

// <== PERMISSION LEVEL SELECT OPTIONS ==>
export const PERMISSION_LEVEL_OPTIONS = [
  { value: "none", label: "No Access" },
  { value: "read", label: "View Only" },
  { value: "write", label: "View & Add" },
  { value: "update", label: "View, Add & Edit" },
] as const;

// <== MODULE DISPLAY LABELS ==>
export const MODULE_DISPLAY_LABELS: Record<keyof ModulePermissions, string> = {
  sales: "Sales",
  purchases: "Purchases",
  customers: "Customers",
  expenditures: "Expenditures",
  recoveries: "Recoveries",
  quickSales: "Quick Sales",
  dashboard: "Dashboard",
  analytics: "Analytics",
};

// <== MODULE KEYS ==>
export const MODULE_KEYS = Object.keys(
  MODULE_DISPLAY_LABELS,
) as (keyof ModulePermissions)[];

// <== DEFAULT PERMISSIONS ==>
export const DEFAULT_PERMISSIONS: ModulePermissions = {
  sales: "none",
  purchases: "none",
  customers: "none",
  expenditures: "none",
  recoveries: "none",
  quickSales: "none",
  dashboard: "none",
  analytics: "none",
};

// <== ROLE DISPLAY LABELS ==>
export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  user: "Team Member",
};
