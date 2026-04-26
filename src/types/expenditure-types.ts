// <== EXPENDITURE CATEGORY TYPE ==>
export type ExpenditureCategory = "supplies" | "meals" | "transport" | "misc";

// <== EXPENDITURE FILTER TYPE ==>
export type ExpenditureFilter = "today" | "week" | "month";

// <== VIEW MODE TYPE ==>
export type ViewMode = "table" | "list" | "grid";

// <== EXPENDITURE TYPE ==>
export type Expenditure = {
  // <== MONGODB ID ==>
  _id: string;
  // <== USER ID ==>
  userId: string;
  // <== TITLE ==>
  title: string;
  // <== CATEGORY ==>
  category: ExpenditureCategory;
  // <== AMOUNT IN RUPEES ==>
  amount: number;
  // <== DATE STRING (YYYY-MM-DD) ==>
  date: string;
  // <== OPTIONAL NOTE ==>
  note: string | null;
  // <== CREATED AT ISO STRING ==>
  createdAt: string;
  // <== UPDATED AT ISO STRING ==>
  updatedAt: string;
};

// <== CATEGORY BREAKDOWN ENTRY TYPE ==>
export type ExpenditureCategoryBreakdown = {
  // <== TOTAL AMOUNT FOR CATEGORY ==>
  amount: number;
  // <== TOTAL RECORD COUNT FOR CATEGORY ==>
  count: number;
};

// <== EXPENDITURE STATS TYPE ==>
export type ExpenditureStats = {
  // <== TOTAL AMOUNT FOR SELECTED PERIOD ==>
  totalAmount: number;
  // <== TOTAL RECORD COUNT FOR SELECTED PERIOD ==>
  totalCount: number;
  // <== AVERAGE AMOUNT FOR SELECTED PERIOD ==>
  avgAmount: number;
  // <== HIGHEST SINGLE AMOUNT IN SELECTED PERIOD ==>
  highestAmount: number;
  // <== BREAKDOWN BY CATEGORY ==>
  categoryBreakdown: Record<string, ExpenditureCategoryBreakdown>;
};

// <== EXPENDITURE PAGINATION META TYPE ==>
export type ExpenditurePaginationMeta = {
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
  type: ExpenditureFilter;
  // <== BILLING MONTH ==>
  month: string | null;
  // <== FILTER RANGE START DATE ==>
  startDate: string;
  // <== FILTER RANGE END DATE ==>
  endDate: string;
};

// <== EXPENDITURES LIST DATA TYPE ==>
export type ExpendituresListData = {
  // <== PAGINATED EXPENDITURE RECORDS ==>
  records: Expenditure[];
  // <== SERVER PAGINATION METADATA ==>
  pagination: ExpenditurePaginationMeta;
  // <== STATS FOR CURRENT FILTER PERIOD ==>
  stats: ExpenditureStats;
  // <== APPLIED FILTER DETAILS ==>
  appliedFilter: AppliedFilter;
};

// <== ADD EXPENDITURE FORM VALUES TYPE ==>
export type AddExpenditureFormValues = {
  // <== TITLE (REQUIRED) ==>
  title: string;
  // <== CATEGORY (REQUIRED) ==>
  category: ExpenditureCategory;
  // <== AMOUNT IN RUPEES (REQUIRED) ==>
  amount: number;
  // <== OPTIONAL NOTE ==>
  note?: string;
};

// <== UPDATE EXPENDITURE MUTATION VARIABLES TYPE ==>
export type UpdateExpenditureVariables = {
  // <== EXPENDITURE ID ==>
  id: string;
  // <== PARTIAL UPDATE DATA ==>
  data: Partial<AddExpenditureFormValues>;
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
