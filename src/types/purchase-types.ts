// <== PURCHASE FILTER TYPE ==>
export type PurchaseFilter = "today" | "week" | "month";

// <== VIEW MODE TYPE ==>
export type ViewMode = "table" | "list" | "grid";

// <== PURCHASE TYPE ==>
export type Purchase = {
  // <== MONGODB ID ==>
  _id: string;
  // <== USER ID ==>
  userId: string;
  // <== SUPPLIER NAME ==>
  supplier: string;
  // <== MILK QUANTITY IN LITERS ==>
  milkQuantity: number;
  // <== TOTAL COST IN RUPEES ==>
  totalCost: number;
  // <== PRICE PER LITER ==>
  pricePerLiter: number;
  // <== DATE STRING (YYYY-MM-DD) ==>
  date: string;
  // <== OPTIONAL NOTE ==>
  note: string | null;
  // <== CREATED AT ISO STRING ==>
  createdAt: string;
  // <== UPDATED AT ISO STRING ==>
  updatedAt: string;
};

// <== SUPPLIER BREAKDOWN ENTRY TYPE ==>
export type PurchaseSupplierBreakdown = {
  // <== TOTAL COST FOR THIS SUPPLIER ==>
  totalCost: number;
  // <== TOTAL MILK FROM THIS SUPPLIER ==>
  totalMilk: number;
  // <== NUMBER OF PURCHASES FROM THIS SUPPLIER ==>
  count: number;
};

// <== PURCHASE STATS TYPE ==>
export type PurchaseStats = {
  // <== TOTAL AMOUNT SPENT IN SELECTED PERIOD ==>
  totalSpent: number;
  // <== TOTAL MILK PURCHASED IN LITERS ==>
  totalMilk: number;
  // <== TOTAL NUMBER OF PURCHASE RECORDS ==>
  totalPurchases: number;
  // <== WEIGHTED AVERAGE COST PER LITER IN SELECTED PERIOD ==>
  avgCostPerLiter: number;
  // <== BREAKDOWN OF SPEND AND MILK BY SUPPLIER ==>
  supplierBreakdown: Record<string, PurchaseSupplierBreakdown>;
};

// <== PURCHASE PAGINATION META TYPE ==>
export type PurchasePaginationMeta = {
  // <== TOTAL MATCHING RECORDS ACROSS ALL PAGES ==>
  total: number;
  // <== CURRENT PAGE NUMBER ==>
  page: number;
  // <== ITEMS PER PAGE ==>
  limit: number;
  // <== TOTAL NUMBER OF PAGES ==>
  totalPages: number;
  // <== WHETHER A NEXT PAGE EXISTS ==>
  hasNextPage: boolean;
  // <== WHETHER A PREVIOUS PAGE EXISTS ==>
  hasPrevPage: boolean;
};

// <== APPLIED FILTER TYPE ==>
export type AppliedFilter = {
  // <== FILTER TYPE ==>
  type: PurchaseFilter;
  // <== BILLING MONTH ==>
  month: string | null;
  // <== FILTER RANGE START DATE ==>
  startDate: string;
  // <== FILTER RANGE END DATE ==>
  endDate: string;
};

// <== PURCHASES LIST DATA TYPE ==>
export type PurchasesListData = {
  // <== PAGINATED PURCHASE RECORDS ==>
  records: Purchase[];
  // <== SERVER PAGINATION METADATA ==>
  pagination: PurchasePaginationMeta;
  // <== STATS FOR CURRENT FILTER PERIOD ==>
  stats: PurchaseStats;
  // <== APPLIED FILTER DETAILS ==>
  appliedFilter: AppliedFilter;
};

// <== ADD PURCHASE FORM VALUES TYPE ==>
export type AddPurchaseFormValues = {
  // <== SUPPLIER NAME (REQUIRED) ==>
  supplier: string;
  // <== MILK QUANTITY IN LITERS (REQUIRED) ==>
  milkQuantity: number;
  // <== TOTAL COST IN RUPEES (REQUIRED) ==>
  totalCost: number;
  // <== OPTIONAL NOTE ==>
  note?: string;
};

// <== UPDATE PURCHASE MUTATION VARIABLES TYPE ==>
export type UpdatePurchaseVariables = {
  // <== PURCHASE ID ==>
  id: string;
  // <== PARTIAL UPDATE DATA ==>
  data: Partial<AddPurchaseFormValues>;
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
  // <== ERROR CODE ==>
  code?: string;
  // <== ERROR MESSAGE ==>
  message?: string;
  // <== SUCCESS FLAG ==>
  success?: boolean;
};
