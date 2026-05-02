// <== QUICK SALE TYPE ==>
export type QuickSaleType = "milk" | "yoghurt";

// <== QUICK SALE FILTER TYPE ==>
export type QuickSaleFilterType = "today" | "week" | "month" | "date";

// <== QUICK SALE PRODUCT FILTER TYPE ==>
export type QuickSaleProductFilter = "all" | "milk" | "yoghurt";

// <== QUICK SALE VIEW MODE TYPE ==>
export type QuickSaleViewMode = "table" | "list" | "grid";

// <== QUICK SALE RECORD TYPE ==>
export type QuickSale = {
  // <== MONGODB ID ==>
  _id: string;
  // <== USER ID ==>
  userId: string;
  // <== PRODUCT TYPE ==>
  type: QuickSaleType;
  // <== QUANTITY (LITERS FOR MILK, KG FOR YOGHURT) ==>
  quantity: number;
  // <== RATE PER UNIT IN RUPEES ==>
  rate: number;
  // <== TOTAL AMOUNT (QUANTITY * RATE — STORED DENORMALISED) ==>
  total: number;
  // <== SALE DATE (YYYY-MM-DD) ==>
  date: string;
  // <== OPTIONAL NOTE ==>
  note: string | null;
  // <== CREATED AT ISO STRING ==>
  createdAt: string;
  // <== UPDATED AT ISO STRING ==>
  updatedAt: string;
};

// <== QUICK SALE STATS TYPE ==>
export type QuickSaleStats = {
  // <== TOTAL COMBINED REVENUE ==>
  totalRevenue: number;
  // <== TOTAL MILK QUANTITY SOLD IN LITERS ==>
  totalMilkQty: number;
  // <== TOTAL YOGHURT QUANTITY SOLD IN KG ==>
  totalYoghurtQty: number;
  // <== MILK REVENUE ==>
  milkRevenue: number;
  // <== YOGHURT REVENUE ==>
  yoghurtRevenue: number;
  // <== TOTAL TRANSACTION COUNT ==>
  totalTransactions: number;
};

// <== QUICK SALE PAGINATION META TYPE ==>
export type QuickSalePaginationMeta = {
  // <== TOTAL MATCHING RECORDS ==>
  total: number;
  // <== CURRENT PAGE ==>
  page: number;
  // <== ITEMS PER PAGE ==>
  limit: number;
  // <== TOTAL PAGES ==>
  totalPages: number;
  // <== WHETHER A NEXT PAGE EXISTS ==>
  hasNextPage: boolean;
  // <== WHETHER A PREVIOUS PAGE EXISTS ==>
  hasPrevPage: boolean;
};

// <== QUICK SALE APPLIED FILTER TYPE ==>
export type QuickSaleAppliedFilter = {
  // <== FILTER TYPE ==>
  filterType: QuickSaleFilterType;
  // <== RANGE START DATE ==>
  startDate: string;
  // <== RANGE END DATE ==>
  endDate: string;
  // <== SELECTED MONTH (ONLY WHEN FILTER IS MONTH) ==>
  month: string | null;
  // <== SELECTED DATE (ONLY WHEN FILTER IS DATE) ==>
  date: string | null;
};

// <== QUICK SALE LIST DATA TYPE ==>
export type QuickSaleListData = {
  // <== PAGINATED QUICK SALE RECORDS ==>
  records: QuickSale[];
  // <== SERVER PAGINATION METADATA ==>
  pagination: QuickSalePaginationMeta;
  // <== COMPUTED STATS FOR THE FULL FILTERED DATASET ==>
  stats: QuickSaleStats;
  // <== APPLIED FILTER DETAILS ==>
  appliedFilter: QuickSaleAppliedFilter;
};

// <== ADD QUICK SALE FORM VALUES TYPE ==>
export type AddQuickSaleFormValues = {
  // <== PRODUCT TYPE ==>
  type: QuickSaleType;
  // <== QUANTITY ==>
  quantity: number;
  // <== RATE PER UNIT ==>
  rate: number;
  // <== OPTIONAL DATE (YYYY-MM-DD) ==>
  date?: string;
  // <== OPTIONAL NOTE ==>
  note?: string;
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
