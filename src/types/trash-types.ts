// <== TRASH CATEGORY TYPE ==>
export type TrashCategory =
  | "QuickSale"
  | "Sale"
  | "Customer"
  | "Expenditure"
  | "Purchase"
  | "StaffMember";

// <== TRASH SNAPSHOT TYPE ==>
export type TrashSnapshot = Record<string, unknown>;

// <== TRASH RECORD TYPE ==>
export type TrashRecord = {
  // <== TRASH ENTRY ID ==>
  _id: string;
  // <== ACCOUNT ID ==>
  accountId: string;
  // <== CATEGORY THIS ITEM BELONGS TO ==>
  entityType: TrashCategory;
  // <== ORIGINAL DOCUMENT ID ==>
  entityId: string;
  // <== SNAPSHOT OF THE ORIGINAL DOCUMENT AT DELETION TIME ==>
  snapshot: TrashSnapshot;
  // <== USER WHO DELETED THIS ITEM ==>
  deletedBy: { _id: string; fullName: string; email: string } | null;
  // <== WHEN THIS ITEM WAS DELETED ==>
  deletedAt: string;
  // <== WHEN THIS ITEM WILL BE AUTO-PURGED ==>
  expiresAt: string;
};

// <== TRASH PAGINATION META TYPE ==>
export type TrashPaginationMeta = {
  // <== CURRENT PAGE ==>
  page: number;
  // <== ROWS PER PAGE ==>
  limit: number;
  // <== TOTAL MATCHING RECORDS ==>
  total: number;
  // <== TOTAL PAGES ==>
  totalPages: number;
  // <== WHETHER A NEXT PAGE EXISTS ==>
  hasNextPage: boolean;
  // <== WHETHER A PREVIOUS PAGE EXISTS ==>
  hasPrevPage: boolean;
};

// <== TRASH LIST DATA TYPE ==>
export type TrashListData = {
  // <== PAGINATED TRASH RECORDS ==>
  records: TrashRecord[];
  // <== ALL VALID CATEGORY VALUES ==>
  categories: TrashCategory[];
  // <== PAGINATION METADATA ==>
  pagination: TrashPaginationMeta;
};

// <== GENERIC API RESPONSE WRAPPER ==>
export type ApiResponse<T> = {
  // <== SUCCESS FLAG ==>
  success: boolean;
  // <== SERVER MESSAGE ==>
  message: string;
  // <== RESPONSE PAYLOAD ==>
  data: T;
};

// <== API ERROR RESPONSE TYPE ==>
export type ApiErrorResponse = {
  // <== ERROR MESSAGE ==>
  message?: string;
  // <== SUCCESS FLAG ==>
  success?: boolean;
};
