// <== SALE TYPE ==>
export type SaleType = "customer" | "shop";

// <== SALE PRODUCT TYPE ==>
export type SaleProductType = "milk" | "yoghurt";

// <== SALE FILTER TYPE ==>
export type SaleFilter = "today" | "week" | "month";

// <== VIEW MODE TYPE ==>
export type ViewMode = "table" | "list" | "grid";

// <== SALE TYPE ==>
export type Sale = {
  // <== MONGODB ID ==>
  _id: string;
  // <== USER ID ==>
  userId: string;
  // <== SALE TYPE (customer | shop) ==>
  saleType: SaleType;
  // <== CUSTOMER NAME (NULL FOR SHOP SALES) ==>
  customerName: string | null;
  // <== PRODUCT TYPE (MILK | YOGHURT) ==>
  productType: SaleProductType;
  // <== QUANTITY (L FOR MILK, KG FOR YOGHURT) ==>
  quantity: number;
  // <== PRICE PER UNIT (₨) ==>
  pricePerUnit: number;
  // <== TOTAL AMOUNT (QUANTITY × PRICE PER UNIT — STORED DENORMALISED) ==>
  totalAmount: number;
  // <== PAID AMOUNT (= TOTAL AMOUNT FOR SHOP | PARTIAL OR FULL FOR CUSTOMER) ==>
  paidAmount: number;
  // <== PENDING AMOUNT (= 0 FOR SHOP | TOTAL AMOUNT - PAID AMOUNT FOR CUSTOMER) ==>
  pendingAmount: number;
  // <== DATE STRING (YYYY-MM-DD) ==>
  date: string;
  // <== OPTIONAL NOTE ==>
  note: string | null;
  // <== CREATED AT ISO STRING ==>
  createdAt: string;
  // <== UPDATED AT ISO STRING ==>
  updatedAt: string;
};

// <== SALE STATS TYPE (ALWAYS COMBINED — ALL SALE TYPES FOR THE PERIOD) ==>
export type SaleStats = {
  // <== TOTAL REVENUE ACROSS ALL SALES ==>
  totalRevenue: number;
  // <== TOTAL MILK SOLD IN LITERS (BOTH TYPES) ==>
  totalMilkSold: number;
  // <== TOTAL YOGHURT SOLD IN KG (BOTH TYPES) ==>
  totalYoghurtSold: number;
  // <== TOTAL OUTSTANDING PENDING BALANCE (CUSTOMER SALES ONLY) ==>
  totalPending: number;
  // <== TOTAL NUMBER OF SALE RECORDS ==>
  totalSales: number;
};

// <== SALE PAGINATION META TYPE ==>
export type SalePaginationMeta = {
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
  type: SaleFilter;
  // <== BILLING MONTH (ONLY WHEN FILTER IS MONTH) ==>
  month: string | null;
  // <== FILTER RANGE START DATE ==>
  startDate: string;
  // <== FILTER RANGE END DATE ==>
  endDate: string;
};

// <== SALES LIST DATA TYPE ==>
export type SalesListData = {
  // <== PAGINATED SALE RECORDS FOR REQUESTED SALE TYPE ==>
  records: Sale[];
  // <== SERVER PAGINATION METADATA ==>
  pagination: SalePaginationMeta;
  // <== COMBINED STATS FOR ALL SALE TYPES IN THE PERIOD ==>
  stats: SaleStats;
  // <== APPLIED FILTER DETAILS ==>
  appliedFilter: AppliedFilter;
};

// <== ADD CUSTOMER SALE FORM VALUES TYPE ==>
export type AddCustomerSaleFormValues = {
  // <== CUSTOMER NAME (REQUIRED FOR CUSTOMER SALES) ==>
  customerName: string;
  // <== PRODUCT TYPE ==>
  productType: SaleProductType;
  // <== QUANTITY (L OR KG) ==>
  quantity: number;
  // <== PRICE PER UNIT (₨) ==>
  pricePerUnit: number;
  // <== AMOUNT PAID AT TIME OF SALE ==>
  paidAmount: number;
  // <== OPTIONAL NOTE ==>
  note?: string;
};

// <== ADD SHOP SALE FORM VALUES TYPE ==>
export type AddShopSaleFormValues = {
  // <== PRODUCT TYPE ==>
  productType: SaleProductType;
  // <== QUANTITY (L OR KG) ==>
  quantity: number;
  // <== PRICE PER UNIT (₨) ==>
  pricePerUnit: number;
  // <== OPTIONAL NOTE ==>
  note?: string;
};

// <== UPDATE SALE MUTATION VARIABLES TYPE ==>
export type UpdateSaleVariables = {
  // <== SALE ID ==>
  id: string;
  // <== PARTIAL UPDATE DATA ==>
  data: Partial<AddCustomerSaleFormValues & AddShopSaleFormValues>;
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
  // <== OPTIONAL ERROR DATA ==>
  data?: {
    totalAmount?: number;
  };
};
