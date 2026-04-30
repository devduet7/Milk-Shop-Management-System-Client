// <== RECOVERY TAB TYPE ==>
export type RecoveryTab = "deliveries" | "sales";

// <== RECOVERY STATUS FILTER TYPE ==>
export type RecoveryStatus = "all" | "pending" | "cleared";

// <== RECOVERY FILTER TYPE ==>
export type RecoveryFilter = "today" | "week" | "month";

// <== VIEW MODE TYPE ==>
export type ViewMode = "table" | "list" | "grid";

// <== MONTHLY STATS TYPE ==>
export type RecoveryMonthlyStats = {
  // <== BILLING MONTH (YYYY-MM) ==>
  month: string;
  // <== DELIVERED DAYS COUNT ==>
  deliveredDays: number;
  // <== MISSED DAYS COUNT ==>
  missedDays: number;
  // <== TOTAL MILK DELIVERED IN LITERS ==>
  totalMilkDelivered: number;
  // <== MONTHLY TOTAL DUE ==>
  monthlyTotal: number;
  // <== TOTAL PAID THIS MONTH ==>
  totalPaid: number;
  // <== PENDING AMOUNT FOR THIS MONTH ==>
  pending: number;
};

// <== DELIVERY RECOVERY RECORD TYPE ==>
export type DeliveryRecovery = {
  // <== CUSTOMER MONGODB ID ==>
  _id: string;
  // <== CUSTOMER NAME ==>
  name: string;
  // <== PHONE NUMBER ==>
  phone: string | null;
  // <== ADDRESS ==>
  address: string | null;
  // <== DAILY MILK QUANTITY ==>
  dailyMilk: number;
  // <== PRICE PER LITER ==>
  pricePerLiter: number;
  // <== MONTHLY STATS FOR THE SELECTED BILLING MONTH ==>
  monthlyStats: RecoveryMonthlyStats;
  // <== ALL-TIME TOTAL DUE ACROSS ALL MONTHS ==>
  allTimeDue: number;
  // <== ALL-TIME TOTAL PAID ACROSS ALL MONTHS ==>
  allTimePaid: number;
  // <== ALL-TIME OUTSTANDING BALANCE ==>
  allTimeOutstanding: number;
  // <== CREATED AT ISO STRING ==>
  createdAt: string;
  // <== UPDATED AT ISO STRING ==>
  updatedAt: string;
};

// <== SALE RECOVERY RECORD TYPE ==>
export type SaleRecovery = {
  // <== SALE MONGODB ID ==>
  _id: string;
  // <== USER ID ==>
  userId: string;
  // <== SALE TYPE — ALWAYS CUSTOMER FOR RECOVERIES ==>
  saleType: "customer";
  // <== CUSTOMER NAME ==>
  customerName: string;
  // <== PRODUCT TYPE ==>
  productType: "milk" | "yoghurt";
  // <== QUANTITY ==>
  quantity: number;
  // <== PRICE PER UNIT ==>
  pricePerUnit: number;
  // <== TOTAL AMOUNT ==>
  totalAmount: number;
  // <== PAID AMOUNT ==>
  paidAmount: number;
  // <== PENDING AMOUNT ==>
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

// <== RECOVERY STATS TYPE ==>
export type RecoveryStats = {
  // <== ALL-TIME OUTSTANDING FROM DELIVERY CUSTOMERS ==>
  deliveryOutstanding: number;
  // <== ALL-TIME OUTSTANDING FROM CUSTOMER SALES ==>
  salesOutstanding: number;
  // <== TOTAL COMBINED OUTSTANDING ==>
  totalOutstanding: number;
  // <== TOTAL COMBINED AMOUNT DUE (FOR RECOVERY RATE) ==>
  totalDue: number;
  // <== RECOVERY RATE AS PERCENTAGE ==>
  recoveryRate: number;
};

// <== RECOVERY PAGINATION META TYPE ==>
export type RecoveryPaginationMeta = {
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

// <== RECOVERY APPLIED FILTER TYPE ==>
export type RecoveryAppliedFilter = {
  // <== FILTER TYPE ==>
  type: RecoveryFilter;
  // <== DERIVED BILLING MONTH (YYYY-MM) ==>
  billingMonth: string;
  // <== SELECTED MONTH (ONLY WHEN FILTER IS MONTH) ==>
  month: string | null;
  // <== FILTER RANGE START DATE ==>
  startDate: string;
  // <== FILTER RANGE END DATE ==>
  endDate: string;
};

// <== RECOVERIES LIST DATA TYPE (GET /recoveries RESPONSE) ==>
export type RecoveriesListData = {
  // <== PAGINATED RECOVERY RECORDS FOR THE ACTIVE TAB ==>
  records: DeliveryRecovery[] | SaleRecovery[];
  // <== SERVER PAGINATION METADATA ==>
  pagination: RecoveryPaginationMeta;
  // <== COMBINED ALL-TIME STATS ==>
  stats: RecoveryStats;
  // <== APPLIED FILTER DETAILS ==>
  appliedFilter: RecoveryAppliedFilter;
};

// <== ADD DELIVERY PAYMENT FORM VALUES TYPE ==>
export type AddDeliveryPaymentFormValues = {
  // <== PAYMENT AMOUNT (REQUIRED) ==>
  amount: number;
  // <== BILLING MONTH (YYYY-MM — REQUIRED) ==>
  billingMonth: string;
  // <== OPTIONAL PAYMENT DATE (YYYY-MM-DD) ==>
  paymentDate?: string;
  // <== OPTIONAL NOTE ==>
  note?: string;
};

// <== UPDATE SALE PAYMENT FORM VALUES TYPE ==>
export type UpdateSalePaymentFormValues = {
  // <== NEW PAID AMOUNT (0 to totalAmount) ==>
  paidAmount: number;
};

// <== ADD DELIVERY PAYMENT MUTATION VARIABLES TYPE ==>
export type AddDeliveryPaymentVariables = {
  // <== CUSTOMER ID ==>
  customerId: string;
  // <== FORM DATA ==>
  data: AddDeliveryPaymentFormValues;
};

// <== UPDATE SALE PAYMENT MUTATION VARIABLES TYPE ==>
export type UpdateSalePaymentVariables = {
  // <== SALE ID ==>
  saleId: string;
  // <== FORM DATA ==>
  data: UpdateSalePaymentFormValues;
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
    // <== TOTAL AMOUNT ==>
    totalAmount?: number;
    // <== OUTSTANDING BALANCE ==>
    pending?: number;
    // <== BILLING MONTH ==>
    billingMonth?: string;
    // <== MONTHLY TOTAL ==>
    monthlyTotal?: number;
    // <== TOTAL PAID ==>
    totalPaid?: number;
  };
};
