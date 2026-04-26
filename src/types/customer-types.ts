// <== VIEW MODE TYPE ==>
export type ViewMode = "table" | "list" | "grid";

// <== DELIVERY STATUS TYPE ==>
export type DeliveryStatus = "delivered" | "missed" | "unmarked";

// <== PAYMENT STATUS TYPE ==>
export type PaymentStatus = "cleared" | "partial" | "unpaid";

// <== MONTHLY STATS TYPE ==>
export type MonthlyStats = {
  // <== BILLING MONTH (YYYY-MM) ==>
  month: string;
  // <== DELIVERED DAYS COUNT ==>
  deliveredDays: number;
  // <== MISSED DAYS COUNT ==>
  missedDays: number;
  // <== TOTAL MILK DELIVERED (LITERS) ==>
  totalMilkDelivered: number;
  // <== MONTHLY TOTAL DUE ==>
  monthlyTotal: number;
  // <== TOTAL PAID THIS MONTH ==>
  totalPaid: number;
  // <== PENDING AMOUNT ==>
  pending: number;
};

// <== MONTHLY BREAKDOWN ENTRY TYPE ==>
export type MonthlyBreakdownEntry = MonthlyStats & {
  // <== PAYMENT STATUS FOR THIS MONTH ==>
  paymentStatus: PaymentStatus;
};

// <== CUSTOMER TYPE (FROM LIST ENDPOINT) ==>
export type Customer = {
  // <== MONGODB ID ==>
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
  // <== CREATED AT ISO STRING ==>
  createdAt: string;
  // <== UPDATED AT ISO STRING ==>
  updatedAt: string;
  // <== MONTHLY STATS FOR SELECTED MONTH ==>
  monthlyStats: MonthlyStats;
  // <== ALL-TIME OUTSTANDING BALANCE ==>
  allTimeOutstanding: number;
};

// <== CUSTOMERS SUMMARY TYPE ==>
export type CustomersSummary = {
  // <== BILLING MONTH ==>
  month: string;
  // <== TOTAL CUSTOMER COUNT ==>
  totalCustomers: number;
  // <== MONTHLY DUE ACROSS ALL CUSTOMERS ==>
  monthlyDue: number;
  // <== MONTHLY RECEIVED ACROSS ALL CUSTOMERS ==>
  monthlyReceived: number;
  // <== MONTHLY PENDING ACROSS ALL CUSTOMERS ==>
  monthlyPending: number;
  // <== ALL-TIME OUTSTANDING ACROSS ALL CUSTOMERS ==>
  totalOutstanding: number;
};

// <== PAGINATION META TYPE (FROM SERVER PAGINATION RESPONSE) ==>
export type PaginationMeta = {
  // <== CURRENT PAGE NUMBER ==>
  page: number;
  // <== ITEMS PER PAGE ==>
  limit: number;
  // <== TOTAL MATCHING ITEMS ACROSS ALL PAGES ==>
  total: number;
  // <== TOTAL NUMBER OF PAGES ==>
  totalPages: number;
  // <== WHETHER A NEXT PAGE EXISTS ==>
  hasNextPage: boolean;
  // <== WHETHER A PREVIOUS PAGE EXISTS ==>
  hasPrevPage: boolean;
};

// <== CUSTOMERS LIST DATA TYPE (GET /customers RESPONSE) ==>
export type CustomersListData = {
  // <== CUSTOMERS ARRAY ==>
  customers: Customer[];
  // <== AGGREGATE SUMMARY ==>
  summary: CustomersSummary;
  // <== SERVER PAGINATION METADATA ==>
  pagination: PaginationMeta;
};

// <== DELIVERY RECORD TYPE ==>
export type DeliveryRecord = {
  // <== RECORD ID ==>
  _id: string;
  // <== CUSTOMER ID ==>
  customerId: string;
  // <== DATE STRING (YYYY-MM-DD) ==>
  date: string;
  // <== DELIVERY STATUS ==>
  status: DeliveryStatus;
  // <== MILK QUANTITY DELIVERED ==>
  milkQuantity: number;
};

// <== PAYMENT TYPE ==>
export type Payment = {
  // <== PAYMENT ID ==>
  _id: string;
  // <== CUSTOMER ID ==>
  customerId: string;
  // <== USER ID ==>
  userId: string;
  // <== PAYMENT AMOUNT ==>
  amount: number;
  // <== BILLING MONTH (YYYY-MM) ==>
  billingMonth: string;
  // <== PAYMENT DATE (YYYY-MM-DD) ==>
  paymentDate: string;
  // <== OPTIONAL NOTE ==>
  note: string | null;
};

// <== CUSTOMER DETAIL BASE TYPE ==>
export type CustomerDetail = {
  // <== MONGODB ID ==>
  _id: string;
  // <== NAME ==>
  name: string;
  // <== PHONE ==>
  phone: string | null;
  // <== ADDRESS ==>
  address: string | null;
  // <== DAILY MILK ==>
  dailyMilk: number;
  // <== PRICE PER LITER ==>
  pricePerLiter: number;
  // <== CREATED AT ==>
  createdAt: string;
  // <== UPDATED AT ==>
  updatedAt: string;
};

// <== CUSTOMER DETAIL RESPONSE DATA TYPE ==>
export type CustomerDetailData = {
  // <== CUSTOMER BASE INFO ==>
  customer: CustomerDetail;
  // <== DELIVERY RECORDS FOR SELECTED MONTH ==>
  deliveryRecords: DeliveryRecord[];
  // <== PAYMENTS FOR SELECTED BILLING MONTH ==>
  payments: Payment[];
  // <== MONTHLY STATS FOR SELECTED MONTH ==>
  monthlyStats: MonthlyStats;
  // <== ALL MONTHS BREAKDOWN ==>
  monthlyBreakdown: MonthlyBreakdownEntry[];
  // <== ALL-TIME OUTSTANDING ==>
  allTimeOutstanding: number;
};

// <== ADD CUSTOMER FORM VALUES TYPE ==>
export type AddCustomerFormValues = {
  // <== NAME (REQUIRED) ==>
  name: string;
  // <== OPTIONAL PHONE ==>
  phone?: string;
  // <== OPTIONAL ADDRESS ==>
  address?: string;
  // <== DAILY MILK IN LITERS ==>
  dailyMilk: number;
  // <== PRICE PER LITER ==>
  pricePerLiter: number;
};

// <== UPDATE CUSTOMER MUTATION VARIABLES TYPE ==>
export type UpdateCustomerVariables = {
  // <== CUSTOMER ID ==>
  id: string;
  // <== PARTIAL UPDATE DATA ==>
  data: Partial<AddCustomerFormValues>;
};

// <== MARK DELIVERY MUTATION VARIABLES TYPE ==>
export type MarkDeliveryVariables = {
  // <== CUSTOMER ID ==>
  customerId: string;
  // <== DATE STRING (YYYY-MM-DD) ==>
  date: string;
  // <== TARGET DELIVERY STATUS ==>
  status: DeliveryStatus;
};

// <== ADD PAYMENT MUTATION VARIABLES TYPE ==>
export type AddPaymentVariables = {
  // <== CUSTOMER ID ==>
  customerId: string;
  // <== PAYMENT AMOUNT ==>
  amount: number;
  // <== BILLING MONTH (YYYY-MM) ==>
  billingMonth: string;
  // <== OPTIONAL PAYMENT DATE ==>
  paymentDate?: string;
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
  // <== OPTIONAL ERROR DATA ==>
  data?: {
    outstandingBalance?: number;
  };
};
