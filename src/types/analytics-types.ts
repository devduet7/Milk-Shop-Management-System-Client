// <== DAILY FINANCIALS DATA POINT ==>
export type DailyFinancials = {
  // <== DAY DATE STRING ==>
  day: string;
  // <== TOTAL REVENUE ==>
  revenue: number;
  // <== TOTAL PURCHASES COST ==>
  purchases: number;
  // <== TOTAL EXPENDITURES ==>
  expenditures: number;
};

// <== DAILY QUICK SALES DATA POINT ==>
export type DailyQuickSales = {
  // <== DAY DATE STRING ==>
  day: string;
  // <== MILK REVENUE FOR THE DAY ==>
  milkRevenue: number;
  // <== YOGHURT REVENUE FOR THE DAY ==>
  yoghurtRevenue: number;
  // <== MILK QUANTITY SOLD ==>
  milkQty: number;
  // <== YOGHURT QUANTITY SOLD ==>
  yoghurtQty: number;
};

// <== DAILY PURCHASES DATA POINT ==>
export type DailyPurchases = {
  // <== DAY DATE STRING ==>
  day: string;
  // <== TOTAL PURCHASE COST ==>
  cost: number;
  // <== TOTAL QUANTITY PURCHASED ==>
  qty: number;
  // <== AVERAGE PURCHASE RATE ==>
  avgRate: number;
};

// <== DAILY DELIVERIES DATA POINT ==>
export type DailyDeliveries = {
  // <== DAY DATE STRING ==>
  day: string;
  // <== DELIVERED COUNT ==>
  delivered: number;
  // <== MISSED COUNT ==>
  missed: number;
  // <== MILK QUANTITY DELIVERED ==>
  milkQty: number;
};

// <== SALE BREAKDOWN BUCKET ==>
export type SaleBreakdownBucket = {
  // <== TOTAL AMOUNT ==>
  total: number;
  // <== TOTAL QUANTITY ==>
  qty: number;
  // <== NUMBER OF TRANSACTIONS ==>
  count: number;
};

// <== SALES BREAKDOWN TYPE ==>
export type SalesBreakdown = {
  // <== CUSTOMER MILK BUCKET ==>
  customerMilk: SaleBreakdownBucket;
  // <== CUSTOMER YOGHURT BUCKET ==>
  customerYoghurt: SaleBreakdownBucket;
  // <== SHOP MILK BUCKET ==>
  shopMilk: SaleBreakdownBucket;
  // <== SHOP YOGHURT BUCKET ==>
  shopYoghurt: SaleBreakdownBucket;
};

// <== QUICK SALES BREAKDOWN TYPE ==>
export type QuickSalesBreakdown = {
  // <== MILK QUICK SALES BUCKET ==>
  milk: SaleBreakdownBucket;
  // <== YOGHURT QUICK SALES BUCKET ==>
  yoghurt: SaleBreakdownBucket;
};

// <== EXPENDITURE CATEGORY DATA POINT ==>
export type ExpenditureCategoryDatum = {
  // <== CATEGORY KEY ==>
  category: string;
  // <== DISPLAY LABEL ==>
  label: string;
  // <== TOTAL AMOUNT FOR CATEGORY ==>
  amount: number;
  // <== NUMBER OF ENTRIES ==>
  count: number;
  // <== PERCENTAGE OF TOTAL EXPENDITURES ==>
  percentage: number;
};

// <== STAFF PAYROLL DATUM ==>
export type StaffPayrollDatum = {
  // <== STAFF MEMBER NAME ==>
  name: string;
  // <== BASE SALARY ==>
  salary: number;
  // <== AMOUNT PAID SO FAR ==>
  paid: number;
  // <== EXTRA AMOUNT ==>
  extra: number;
  // <== REMAINING AMOUNT DUE ==>
  due: number;
  // <== WHETHER SALARY IS FULLY CLEARED ==>
  isCleared: boolean;
};

// <== FINANCIAL SUMMARY TYPE ==>
export type FinancialSummary = {
  // <== TOTAL REVENUE ==>
  totalRevenue: number;
  // <== TOTAL SALES REVENUE ==>
  totalSalesRevenue: number;
  // <== TOTAL QUICK SALES REVENUE ==>
  totalQuickSalesRevenue: number;
  // <== TOTAL EXPENSES ==>
  totalExpenses: number;
  // <== TOTAL PURCHASE COST ==>
  totalPurchaseCost: number;
  // <== TOTAL EXPENDITURE AMOUNT ==>
  totalExpenditureAmount: number;
  // <== TOTAL STAFF OUTGO ==>
  totalStaffOutgo: number;
  // <== NET POSITION ==>
  netPosition: number;
  // <== GROSS PROFIT ==>
  grossProfit: number;
};

// <== RECOVERY STATS TYPE ==>
export type AnalyticsRecovery = {
  // <== DELIVERY OUTSTANDING BALANCE ==>
  deliveryOutstanding: number;
  // <== SALES OUTSTANDING BALANCE ==>
  salesOutstanding: number;
  // <== TOTAL OUTSTANDING BALANCE ==>
  totalOutstanding: number;
  // <== TOTAL ALL-TIME AMOUNT DUE ==>
  totalAllTimeDue: number;
  // <== TOTAL ALL-TIME AMOUNT PAID ==>
  totalAllTimePaid: number;
  // <== RECOVERY RATE PERCENTAGE ==>
  recoveryRate: number;
};

// <== APPLIED FILTER TYPE ==>
export type AnalyticsAppliedFilter = {
  // <== BILLING MONTH (YYYY-MM) ==>
  month: string;
  // <== FILTER START DATE ==>
  startDate: string;
  // <== FILTER END DATE ==>
  endDate: string;
  // <== TOTAL DAYS IN RANGE ==>
  totalDays: number;
};

// <== FULL ANALYTICS DATA TYPE ==>
export type AnalyticsData = {
  // <== DAILY FINANCIALS ARRAY ==>
  dailyFinancials: DailyFinancials[];
  // <== DAILY QUICK SALES ARRAY ==>
  dailyQuickSales: DailyQuickSales[];
  // <== DAILY PURCHASES ARRAY ==>
  dailyPurchases: DailyPurchases[];
  // <== DAILY DELIVERIES ARRAY ==>
  dailyDeliveries: DailyDeliveries[];
  // <== SALES BREAKDOWN BY CHANNEL ==>
  salesBreakdown: SalesBreakdown;
  // <== QUICK SALES BREAKDOWN ==>
  quickSalesBreakdown: QuickSalesBreakdown;
  // <== EXPENDITURES GROUPED BY CATEGORY ==>
  expendituresByCategory: ExpenditureCategoryDatum[];
  // <== STAFF PAYROLL DETAILS ==>
  staffPayroll: StaffPayrollDatum[];
  // <== FINANCIAL SUMMARY ==>
  financialSummary: FinancialSummary;
  // <== RECOVERY STATS ==>
  recovery: AnalyticsRecovery;
  // <== APPLIED FILTER DETAILS ==>
  appliedFilter: AnalyticsAppliedFilter;
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
