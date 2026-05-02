// <== STAFF SALARY STATUS TYPE ==>
export type StaffSalaryStatus = "pending" | "cleared";

// <== STAFF VIEW MODE TYPE ==>
export type StaffViewMode = "table" | "list" | "grid";

// <== STAFF MONTH RECORD TYPE ==>
export type StaffMonthRecord = {
  // <== MONGODB ID ==>
  _id: string;
  // <== BILLING MONTH (YYYY-MM) ==>
  month: string;
  // <== TOTAL SALARY PAID THIS MONTH ==>
  paidAmount: number;
  // <== SALARY STATUS FOR THIS MONTH ==>
  status: StaffSalaryStatus;
  // <== DENORMALISED SUM OF ALL EXTRA ALLOCATIONS THIS MONTH ==>
  totalExtraAllocated: number;
};

// <== STAFF MEMBER TYPE (ENRICHED WITH MONTH DATA) ==>
export type StaffMember = {
  // <== MONGODB ID ==>
  _id: string;
  // <== USER ID ==>
  userId: string;
  // <== STAFF NAME ==>
  name: string;
  // <== FIXED MONTHLY SALARY ==>
  monthlySalary: number;
  // <== OPTIONAL NOTE ==>
  note: string | null;
  // <== MONTH RECORD FOR THE SELECTED BILLING MONTH (NULL IF NO PAYMENT YET) ==>
  monthRecord: StaffMonthRecord | null;
  // <== COMPUTED REMAINING SALARY DUE THIS MONTH ==>
  salaryDue: number;
  // <== CREATED AT ISO STRING ==>
  createdAt: string;
  // <== UPDATED AT ISO STRING ==>
  updatedAt: string;
};

// <== STAFF STATS TYPE ==>
export type StaffStats = {
  // <== TOTAL NUMBER OF STAFF MEMBERS ==>
  totalStaff: number;
  // <== TOTAL COMBINED MONTHLY SALARY BILL ==>
  totalSalaryBill: number;
  // <== TOTAL COMBINED OUTGO — SALARY BILL PLUS ALL EXTRAS FOR THE MONTH ==>
  totalMonthlyOutgo: number;
  // <== TOTAL SALARY PAID THIS MONTH ==>
  totalPaid: number;
  // <== TOTAL SALARY STILL PENDING THIS MONTH ==>
  totalPending: number;
  // <== TOTAL EXTRA MONEY ALLOCATED THIS MONTH ==>
  totalExtraAllocated: number;
  // <== NUMBER OF STAFF WITH SALARY CLEARED THIS MONTH ==>
  clearedCount: number;
  // <== NUMBER OF STAFF WITH SALARY STILL PENDING THIS MONTH ==>
  pendingCount: number;
};

// <== STAFF PAGINATION META TYPE ==>
export type StaffPaginationMeta = {
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

// <== STAFF LIST DATA TYPE ==>
export type StaffListData = {
  // <== PAGINATED STAFF RECORDS ENRICHED WITH MONTH DATA ==>
  records: StaffMember[];
  // <== SERVER PAGINATION METADATA ==>
  pagination: StaffPaginationMeta;
  // <== COMBINED STATS FOR THE SELECTED MONTH ==>
  stats: StaffStats;
  // <== APPLIED FILTER DETAILS ==>
  appliedFilter: { month: string };
};

// <== STAFF EXTRA ALLOCATION TYPE ==>
export type StaffExtraAllocation = {
  // <== MONGODB ID ==>
  _id: string;
  // <== STAFF MEMBER ID ==>
  staffId: string;
  // <== BILLING MONTH (YYYY-MM) ==>
  month: string;
  // <== EXACT DATE OF ALLOCATION (YYYY-MM-DD) ==>
  date: string;
  // <== AMOUNT ALLOCATED ==>
  amount: number;
  // <== OPTIONAL NOTE ==>
  note: string | null;
  // <== CREATED AT ISO STRING ==>
  createdAt: string;
};

// <== EXTRA ALLOCATIONS DATA TYPE ==>
export type ExtraAllocationsData = {
  // <== LIST OF INDIVIDUAL EXTRA ALLOCATION RECORDS ==>
  allocations: StaffExtraAllocation[];
  // <== DENORMALISED TOTAL EXTRA ALLOCATED FOR THE MONTH ==>
  totalExtraAllocated: number;
  // <== STAFF MEMBER REFERENCE ==>
  staffMember: { _id: string; name: string };
  // <== BILLING MONTH ==>
  month: string;
};

// <== ADD STAFF FORM VALUES TYPE ==>
export type AddStaffFormValues = {
  // <== STAFF NAME (REQUIRED) ==>
  name: string;
  // <== MONTHLY SALARY (REQUIRED) ==>
  monthlySalary: number;
  // <== OPTIONAL NOTE ==>
  note?: string;
};

// <== UPDATE STAFF FORM VALUES TYPE ==>
export type UpdateStaffFormValues = {
  // <== OPTIONAL NAME UPDATE ==>
  name?: string;
  // <== OPTIONAL SALARY UPDATE ==>
  monthlySalary?: number;
  // <== OPTIONAL NOTE UPDATE ==>
  note?: string;
};

// <== UPDATE STAFF MUTATION VARIABLES TYPE ==>
export type UpdateStaffVariables = {
  // <== STAFF MEMBER ID ==>
  staffId: string;
  // <== FORM DATA ==>
  data: UpdateStaffFormValues;
};

// <== PAY SALARY FORM VALUES TYPE ==>
export type PaySalaryFormValues = {
  // <== PAYMENT AMOUNT (REQUIRED) ==>
  amount: number;
  // <== BILLING MONTH (YYYY-MM — REQUIRED) ==>
  month: string;
};

// <== PAY SALARY MUTATION VARIABLES TYPE ==>
export type PaySalaryVariables = {
  // <== STAFF MEMBER ID ==>
  staffId: string;
  // <== FORM DATA ==>
  data: PaySalaryFormValues;
};

// <== ADD EXTRA ALLOCATION FORM VALUES TYPE ==>
export type AddExtraAllocationFormValues = {
  // <== AMOUNT (REQUIRED) ==>
  amount: number;
  // <== OPTIONAL DATE (YYYY-MM-DD) ==>
  date?: string;
  // <== OPTIONAL NOTE ==>
  note?: string;
};

// <== ADD EXTRA ALLOCATION MUTATION VARIABLES TYPE ==>
export type AddExtraAllocationVariables = {
  // <== STAFF MEMBER ID ==>
  staffId: string;
  // <== BILLING MONTH ==>
  month: string;
  // <== FORM DATA ==>
  data: AddExtraAllocationFormValues;
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
  // <== OPTIONAL BUSINESS ERROR DATA ==>
  data?: {
    // <== BILLING MONTH ==>
    month?: string;
    // <== MONTHLY SALARY ==>
    monthlySalary?: number;
    // <== PAID AMOUNT ==>
    paidAmount?: number;
    // <== REMAINING PENDING ==>
    pending?: number;
  };
};
