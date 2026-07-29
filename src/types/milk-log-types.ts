// <== MILK LOG ENTRY TYPE ==>
export type MilkLogEntryType = "leftover" | "yoghurt";

// <== MILK LOG FILTER TYPE ==>
export type MilkLogFilterType = "today" | "week" | "month" | "date" | "range";

// <== MILK LOG ENTRY TYPE FILTER ==>
export type MilkLogTypeFilter = "all" | "leftover" | "yoghurt";

// <== MILK LOG VIEW MODE TYPE ==>
export type MilkLogViewMode = "table" | "list" | "grid";

// <== MILK LOG RECORD TYPE ==>
export type MilkLog = {
  // <== MONGODB ID ==>
  _id: string;
  // <== ACCOUNT ID (TENANT THIS RECORD BELONGS TO) ==>
  accountId: string;
  // <== USER ID WHO PERFORMED THIS ENTRY ==>
  performedBy: string;
  // <== ENTRY TYPE — LEFTOVER OR YOGHURT ==>
  type: MilkLogEntryType;
  // <== QUANTITY IN LITERS ==>
  quantity: number;
  // <== ENTRY DATE (YYYY-MM-DD) ==>
  date: string;
  // <== OPTIONAL NOTE ==>
  note: string | null;
  // <== CREATED AT ISO STRING ==>
  createdAt: string;
  // <== UPDATED AT ISO STRING ==>
  updatedAt: string;
};

// <== MILK LOG STATS TYPE ==>
export type MilkLogStats = {
  // <== TOTAL LEFTOVER ACROSS THE FILTERED PERIOD ==>
  totalLeftover: number;
  // <== TOTAL USED FOR YOGHURT ACROSS THE FILTERED PERIOD ==>
  totalYoghurt: number;
  // <== TOTAL NUMBER OF ENTRIES ==>
  totalEntries: number;
  // <== SHARE OF TOTAL LOGGED VOLUME THAT WENT TO YOGHURT (0-100) ==>
  yoghurtSharePercent: number;
};

// <== MILK LOG PAGINATION META TYPE ==>
export type MilkLogPaginationMeta = {
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

// <== MILK LOG APPLIED FILTER TYPE ==>
export type MilkLogAppliedFilter = {
  // <== FILTER TYPE ==>
  filterType: MilkLogFilterType;
  // <== RANGE START DATE ==>
  startDate: string;
  // <== RANGE END DATE ==>
  endDate: string;
  // <== SELECTED MONTH (ONLY WHEN FILTER IS MONTH) ==>
  month: string | null;
  // <== SELECTED DATE (ONLY WHEN FILTER IS DATE) ==>
  date: string | null;
};

// <== MILK LOG LIST DATA TYPE ==>
export type MilkLogListData = {
  // <== PAGINATED MILK LOG RECORDS ==>
  records: MilkLog[];
  // <== SERVER PAGINATION METADATA ==>
  pagination: MilkLogPaginationMeta;
  // <== COMPUTED STATS FOR THE FULL FILTERED DATASET ==>
  stats: MilkLogStats;
  // <== APPLIED FILTER DETAILS ==>
  appliedFilter: MilkLogAppliedFilter;
};

// <== ADD MILK LOG FORM VALUES TYPE ==>
export type AddMilkLogFormValues = {
  // <== ENTRY TYPE ==>
  type: MilkLogEntryType;
  // <== QUANTITY ==>
  quantity: number;
  // <== OPTIONAL NOTE ==>
  note?: string;
};

// <== UPDATE MILK LOG MUTATION VARIABLES TYPE ==>
export type UpdateMilkLogVariables = {
  // <== MILK LOG ID ==>
  id: string;
  // <== PARTIAL UPDATE DATA ==>
  data: Partial<AddMilkLogFormValues>;
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
