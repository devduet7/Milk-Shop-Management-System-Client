// <== SALE TYPE UNION ==>
export type SaleType = "customer" | "shop" | "all";

// <== DASHBOARD PRODUCT FILTER TYPE ==>
export type DashboardProductFilter = "all" | "milk" | "yoghurt";

// <== DASHBOARD EXPENDITURE CATEGORY FILTER ==>
export type DashboardCategoryFilter =
  | "all"
  | "supplies"
  | "meals"
  | "transport"
  | "misc";

// <== DASHBOARD PAGINATION META TYPE ==>
export type DashboardPaginationMeta = {
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

// <== DASHBOARD PAGED RESPONSE WRAPPER ==>
export type DashboardPagedResponse<T> = {
  // <== RECORDS FOR THE CURRENT PAGE ==>
  records: T[];
  // <== SERVER PAGINATION METADATA ==>
  pagination: DashboardPaginationMeta;
};

// <== OVERVIEW STATS TYPE ==>
export type DashboardOverview = {
  // <== TOTAL REVENUE (SALES + QUICK SALES) FOR THE MONTH ==>
  totalRevenue: number;
  // <== TOTAL EXPENSES (PURCHASES + EXPENDITURES + STAFF OUTGO) FOR THE MONTH ==>
  totalExpenses: number;
  // <== NET POSITION (REVENUE - EXPENSES) ==>
  netPosition: number;
  // <== GROSS PROFIT (REVENUE - PURCHASE COST ONLY) ==>
  grossProfit: number;
};

// <== CUSTOMER SALES STATS TYPE ==>
export type CustomerSalesStats = {
  // <== TOTAL CUSTOMER SALES AMOUNT FOR THE MONTH ==>
  totalAmount: number;
  // <== TOTAL CUSTOMER SALES PAID FOR THE MONTH ==>
  paidAmount: number;
  // <== TOTAL CUSTOMER SALES PENDING FOR THE MONTH ==>
  pendingAmount: number;
  // <== TOTAL CUSTOMER MILK SALES FOR THE MONTH ==>
  milkQty: number;
  // <== TOTAL CUSTOMER YOGHURT SALES FOR THE MONTH ==>
  yoghurtQty: number;
  // <== TOTAL CUSTOMER SALES FOR THE MONTH ==>
  count: number;
};

// <== SHOP SALES STATS TYPE ==>
export type ShopSalesStats = {
  // <== TOTAL SHOP SALES AMOUNT FOR THE MONTH ==>
  totalAmount: number;
  // <== TOTAL SHOP SALES PAID FOR THE MONTH ==>
  milkQty: number;
  // <== TOTAL SHOP SALES PENDING FOR THE MONTH ==>
  yoghurtQty: number;
  // <== TOTAL SHOP SALES FOR THE MONTH ==>
  count: number;
};

// <== QUICK SALES STATS TYPE ==>
export type DashboardQuickSalesStats = {
  // <== TOTAL REVENUE FROM QUICK SALES FOR THE MONTH ==>
  totalRevenue: number;
  // <== TOTAL MILK QUICK SALES FOR THE MONTH ==>
  milkRevenue: number;
  // <== TOTAL YOGHURT QUICK SALES FOR THE MONTH ==>
  yoghurtRevenue: number;
  // <== TOTAL MILK QUANTITY FOR THE MONTH ==>
  milkQty: number;
  // <== TOTAL YOGHURT QUANTITY FOR THE MONTH ==>
  yoghurtQty: number;
  // <== TOTAL QUICK SALES FOR THE MONTH ==>
  count: number;
};

// <== PURCHASES STATS TYPE ==>
export type DashboardPurchasesStats = {
  // <== TOTAL REVENUE FROM PURCHASES FOR THE MONTH ==>
  totalSpent: number;
  // <== TOTAL MILK PURCHASES FOR THE MONTH ==>
  totalMilkQty: number;
  // <== TOTAL YOGHURT PURCHASES FOR THE MONTH ==>
  avgCostPerLiter: number;
  // <== TOTAL MILK QUANTITY FOR THE MONTH ==>
  count: number;
};

// <== EXPENDITURES STATS TYPE ==>
export type DashboardExpendituresStats = {
  // <== TOTAL REVENUE FROM EXPENDITURES FOR THE MONTH ==>
  totalAmount: number;
  // <== TOTAL EXPENDITURES BY CATEGORY FOR THE MONTH ==>
  byCategory: {
    // <== TOTAL SUPPLIES EXPENDITURES FOR THE MONTH ==>
    supplies: number;
    // <== TOTAL MEALS EXPENDITURES FOR THE MONTH ==>
    meals: number;
    // <== TOTAL TRANSPORT EXPENDITURES FOR THE MONTH ==>
    transport: number;
    // <== TOTAL MISCELLANEOUS EXPENDITURES FOR THE MONTH ==>
    misc: number;
  };
  // <== TOTAL EXPENDITURES FOR THE MONTH ==>
  count: number;
};

// <== DELIVERIES STATS TYPE ==>
export type DashboardDeliveriesStats = {
  // <== TOTAL CUSTOMERS FOR THE MONTH ==>
  totalCustomers: number;
  // <== TOTAL DELIVERIES FOR THE MONTH ==>
  deliveredDays: number;
  // <== TOTAL MISSED DELIVERIES FOR THE MONTH ==>
  missedDays: number;
  // <== TOTAL MILK DELIVERED FOR THE MONTH ==>
  totalMilkDelivered: number;
  // <== TOTAL BILLING DUE FOR THE MONTH ==>
  monthlyBillingDue: number;
  // <== TOTAL BILLING PAID FOR THE MONTH ==>
  monthlyBillingPaid: number;
  // <== TOTAL BILLING PENDING FOR THE MONTH ==>
  monthlyBillingPending: number;
  // <== DELIVERY RATE FOR THE MONTH ==>
  deliveryRate: number;
};

// <== STAFF STATS TYPE ==>
export type DashboardStaffStats = {
  // <== TOTAL STAFF FOR THE MONTH ==>
  totalStaff: number;
  // <== TOTAL SALARY BILL FOR THE MONTH ==>
  totalSalaryBill: number;
  // <== TOTAL MONTHLY OUTGO FOR THE MONTH ==>
  totalMonthlyOutgo: number;
  // <== TOTAL PAID FOR THE MONTH ==>
  totalPaid: number;
  // <== TOTAL PENDING FOR THE MONTH ==>
  totalPending: number;
  // <== TOTAL EXTRA ALLOCATED FOR THE MONTH ==>
  totalExtraAllocated: number;
  // <== TOTAL CLEARED FOR THE MONTH ==>
  clearedCount: number;
  // <== TOTAL PENDING FOR THE MONTH ==>
  pendingCount: number;
};

// <== RECOVERY STATS TYPE (ALL-TIME) ==>
export type DashboardRecoveryStats = {
  // <== DELIVERY OUTSTANDING FOR ALL-TIME ==>
  deliveryOutstanding: number;
  // <== SALES OUTSTANDING FOR ALL-TIME ==>
  salesOutstanding: number;
  // <== TOTAL OUTSTANDING FOR ALL-TIME ==>
  totalOutstanding: number;
  // <== TOTAL DUE FOR ALL-TIME ==>
  totalAllTimeDue: number;
  // <== TOTAL PAID FOR ALL-TIME ==>
  totalAllTimePaid: number;
  // <== RECOVERY RATE FOR ALL-TIME ==>
  recoveryRate: number;
};

// <== FULL DASHBOARD SUMMARY TYPE ==>
export type DashboardSummary = {
  // <== OVERVIEW STATS FOR THE MONTH ==>
  overview: DashboardOverview;
  // <== SALES STATS FOR THE MONTH ==>
  sales: {
    // <== CUSTOMER SALES FOR THE MONTH ==>
    customerSales: CustomerSalesStats;
    // <== SHOP SALES FOR THE MONTH ==>
    shopSales: ShopSalesStats;
  };
  // <== QUICK SALES STATS FOR THE MONTH ==>
  quickSales: DashboardQuickSalesStats;
  // <== PURCHASES STATS FOR THE MONTH ==>
  purchases: DashboardPurchasesStats;
  // <== EXPENDITURES STATS FOR THE MONTH ==>
  expenditures: DashboardExpendituresStats;
  // <== DELIVERIES STATS FOR THE MONTH ==>
  deliveries: DashboardDeliveriesStats;
  // <== STAFF STATS FOR THE MONTH ==>
  staff: DashboardStaffStats;
  // <== RECOVERY STATS FOR ALL-TIME ==>
  recovery: DashboardRecoveryStats;
  // <== SALES RECORDS FOR THE MONTH ==>
  appliedFilter: {
    // <== SALES RECORDS FOR THE MONTH ==>
    month: string;
    // <== SALES RECORDS FOR THE MONTH ==>
    startDate: string;
    // <== SALES RECORDS FOR THE MONTH ==>
    endDate: string;
  };
};

// <== DASHBOARD SALE RECORD TYPE ==>
export type DashboardSaleRecord = {
  // <== SALE RECORD ID ==>
  _id: string;
  // <== SALE TYPE ==>
  saleType: "customer" | "shop";
  // <== CUSTOMER NAME ==>
  customerName: string | null;
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
  // <== DATE ==>
  date: string;
  // <== NOTE ==>
  note: string | null;
};

// <== DASHBOARD QUICK SALE RECORD TYPE ==>
export type DashboardQuickSaleRecord = {
  // <== QUICK SALE RECORD ID ==>
  _id: string;
  // <== QUICK SALE TYPE ==>
  type: "milk" | "yoghurt";
  // <== QUANTITY ==>
  quantity: number;
  // <== RATE ==>
  rate: number;
  // <== TOTAL ==>
  total: number;
  // <== DATE ==>
  date: string;
  // <== NOTE ==>
  note: string | null;
};

// <== DASHBOARD PURCHASE RECORD TYPE ==>
export type DashboardPurchaseRecord = {
  // <== PURCHASE RECORD ID ==>
  _id: string;
  // <== SUPPLIER ==>
  supplier: string;
  // <== MILK QUANTITY ==>
  milkQuantity: number;
  // <== TOTAL COST ==>
  totalCost: number;
  // <== PRICE PER LITER ==>
  pricePerLiter: number;
  // <== DATE ==>
  date: string;
  // <== NOTE ==>
  note: string | null;
};

// <== DASHBOARD EXPENDITURE RECORD TYPE ==>
export type DashboardExpenditureRecord = {
  // <== EXPENDITURE RECORD ID ==>
  _id: string;
  // <== TITLE ==>
  title: string;
  // <== CATEGORY ==>
  category: "supplies" | "meals" | "transport" | "misc";
  // <== AMOUNT ==>
  amount: number;
  // <== DATE ==>
  date: string;
  // <== NOTE ==>
  note: string | null;
};

// <== DASHBOARD STAFF RECORD TYPE ==>
export type DashboardStaffRecord = {
  // <== STAFF RECORD ID ==>
  _id: string;
  // <== STAFF NAME ==>
  name: string;
  // <== MONTHLY SALARY ==>
  monthlySalary: number;
  // <== NOTE ==>
  note: string | null;
  // <== MONTH RECORD ==>
  monthRecord: {
    // <== PAID AMOUNT ==>
    paidAmount: number;
    // <== STATUS ==>
    status: "pending" | "cleared";
    // <== TOTAL EXTRA ALLOCATED ==>
    totalExtraAllocated: number;
  } | null;
  // <== SALARY DUE ==>
  salaryDue: number;
};

// <== DASHBOARD CUSTOMER RECORD TYPE ==>
export type DashboardCustomerRecord = {
  // <== CUSTOMER RECORD ID ==>
  _id: string;
  // <== CUSTOMER NAME ==>
  name: string;
  // <== CUSTOMER PHONE ==>
  phone: string | null;
  // <== CUSTOMER ADDRESS ==>
  dailyMilk: number;
  // <== PRICE PER LITER ==>
  pricePerLiter: number;
  // <== MONTHLY STATS ==>
  monthStats: {
    // <== DELIVERED DAYS ==>
    deliveredDays: number;
    // <== MISSED DAYS ==>
    missedDays: number;
    // <== TOTAL MILK DELIVERED ==>
    totalMilkDelivered: number;
    // <== MONTHLY TOTAL ==>
    billingDue: number;
    // <== TOTAL PAID ==>
    billingPaid: number;
    // <== PENDING BILLING AMOUNT ==>
    billingPending: number;
  };
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
