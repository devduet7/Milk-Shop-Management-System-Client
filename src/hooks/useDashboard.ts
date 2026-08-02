// <== IMPORTS ==>
import type {
  SaleType,
  ApiResponse,
  ApiErrorResponse,
  DashboardSummary,
  DashboardFilterType,
  DashboardSaleRecord,
  DashboardStaffRecord,
  DashboardMilkLogRecord,
  DashboardPagedResponse,
  DashboardProductFilter,
  DashboardCategoryFilter,
  DashboardPurchaseRecord,
  DashboardCustomerRecord,
  DashboardQuickSaleRecord,
  DashboardExpenditureRecord,
} from "../types/dashboard-types";
import { useEffect } from "react";
import { AxiosError } from "axios";
import apiClient from "../lib/apiClient";
import { useAuthStore } from "../stores/useAuthStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// <== QUERY KEY FACTORY ==>
export const dashboardKeys = {
  // <== ROOT KEY FOR ALL DASHBOARD QUERIES ==>
  all: ["dashboard"] as const,
  // <== SUMMARY KEY — INCLUDES THE FULL DATE FILTER SHAPE ==>
  summary: (
    filterType: DashboardFilterType,
    month: string,
    date: string,
    rangeStart: string,
    rangeEnd: string,
  ) =>
    [
      ...dashboardKeys.all,
      "summary",
      filterType,
      month,
      date,
      rangeStart,
      rangeEnd,
    ] as const,
  // <== SALES KEY ==>
  sales: (
    filterType: DashboardFilterType,
    month: string,
    date: string,
    rangeStart: string,
    rangeEnd: string,
    saleType: SaleType,
    page: number,
    limit: number,
  ) =>
    [
      ...dashboardKeys.all,
      "sales",
      filterType,
      month,
      date,
      rangeStart,
      rangeEnd,
      saleType,
      page,
      limit,
    ] as const,
  // <== QUICK SALES KEY ==>
  quickSales: (
    filterType: DashboardFilterType,
    month: string,
    date: string,
    rangeStart: string,
    rangeEnd: string,
    productType: DashboardProductFilter,
    page: number,
    limit: number,
  ) =>
    [
      ...dashboardKeys.all,
      "quickSales",
      filterType,
      month,
      date,
      rangeStart,
      rangeEnd,
      productType,
      page,
      limit,
    ] as const,
  // <== PURCHASES KEY ==>
  purchases: (
    filterType: DashboardFilterType,
    month: string,
    date: string,
    rangeStart: string,
    rangeEnd: string,
    page: number,
    limit: number,
  ) =>
    [
      ...dashboardKeys.all,
      "purchases",
      filterType,
      month,
      date,
      rangeStart,
      rangeEnd,
      page,
      limit,
    ] as const,
  // <== EXPENDITURES KEY ==>
  expenditures: (
    filterType: DashboardFilterType,
    month: string,
    date: string,
    rangeStart: string,
    rangeEnd: string,
    category: DashboardCategoryFilter,
    page: number,
    limit: number,
  ) =>
    [
      ...dashboardKeys.all,
      "expenditures",
      filterType,
      month,
      date,
      rangeStart,
      rangeEnd,
      category,
      page,
      limit,
    ] as const,
  // <== STAFF KEY — MONTH-ONLY, NO DAILY GRANULARITY IN STAFF MONTH RECORD ==>
  staff: (month: string, page: number, limit: number) =>
    [...dashboardKeys.all, "staff", month, page, limit] as const,
  // <== CUSTOMERS KEY — MONTH-ONLY, BILLING STATS ARE KEYED TO A BILLING MONTH ==>
  customers: (month: string, page: number, limit: number) =>
    [...dashboardKeys.all, "customers", month, page, limit] as const,
  // <== MILK LOGS KEY ==>
  milkLogs: (
    filterType: DashboardFilterType,
    month: string,
    date: string,
    rangeStart: string,
    rangeEnd: string,
    page: number,
    limit: number,
  ) =>
    [
      ...dashboardKeys.all,
      "milkLogs",
      filterType,
      month,
      date,
      rangeStart,
      rangeEnd,
      page,
      limit,
    ] as const,
};

// <== SHARED QUERY CONFIG ==>
const SHARED_CONFIG = {
  // <== STALE TIME: 2 MINUTES ==>
  staleTime: 2 * 60 * 1000,
  // <== GC TIME: 5 MINUTES ==>
  gcTime: 5 * 60 * 1000,
  // <== REFETCH ON MOUNT ==>
  refetchOnMount: true,
  // <== NO REFETCH ON WINDOW FOCUS ==>
  refetchOnWindowFocus: false,
  // <== REFETCH ON RECONNECT ==>
  refetchOnReconnect: true,
  // <== RETRY LOGIC ==>
  retry: (failureCount: number, error: AxiosError<ApiErrorResponse>) => {
    // DON'T RETRY ON 404
    if (error?.response?.status === 404) return false;
    // RETRY UP TO 3 TIMES
    return failureCount < 3;
  },
};

// <== HELPER: BUILD SHARED DATE FILTER REQUEST PARAMS ==>
const buildDateFilterParams = (
  filterType: DashboardFilterType,
  month: string,
  date: string,
  rangeStart: string,
  rangeEnd: string,
): Record<string, string> => {
  // BASE PARAMS OBJECT
  const params: Record<string, string> = { filterType };
  // ONLY INCLUDE MONTH WHEN FILTER TYPE IS MONTH
  if (filterType === "month" && month) params.month = month;
  // ONLY INCLUDE DATE WHEN FILTER TYPE IS DATE
  if (filterType === "date" && date) params.date = date;
  // ONLY INCLUDE RANGE BOUNDS WHEN FILTER TYPE IS RANGE
  if (filterType === "range") {
    // INCLUDING RANGE START IF PRESENT
    if (rangeStart) params.rangeStart = rangeStart;
    // INCLUDING RANGE END IF PRESENT
    if (rangeEnd) params.rangeEnd = rangeEnd;
  }
  // RETURNING BUILT PARAMS
  return params;
};

/**
 * FETCH AND CACHE COMPREHENSIVE DASHBOARD SUMMARY FOR THE SELECTED FILTER
 */
// <== USE DASHBOARD SUMMARY HOOK ==>
export const useDashboardSummary = (
  filterType: DashboardFilterType,
  month: string,
  date: string,
  rangeStart: string,
  rangeEnd: string,
) => {
  // GET AUTH STATE FROM STORE
  const { isAuthenticated, isLoggingOut } = useAuthStore();
  // RETURN QUERY
  return useQuery<DashboardSummary, AxiosError<ApiErrorResponse>>({
    // <== QUERY KEY ==>
    queryKey: dashboardKeys.summary(
      filterType,
      month,
      date,
      rangeStart,
      rangeEnd,
    ),
    // <== QUERY FUNCTION ==>
    queryFn: async () => {
      // BUILDING REQUEST PARAMS — MONTH IS ALWAYS SENT, SHARED PARAMS COVER THE REST
      const params: Record<string, string> = {
        ...buildDateFilterParams(filterType, month, date, rangeStart, rangeEnd),
        month,
      };
      // MAKE REQUEST TO GET DASHBOARD SUMMARY
      const response = await apiClient.get<ApiResponse<DashboardSummary>>(
        "/dashboard",
        { params },
      );
      // RETURN DATA
      return response.data.data;
    },
    // <== ENABLE QUERY IF AUTHENTICATED
    enabled: isAuthenticated && !isLoggingOut,
    // <== SHARED QUERY CONFIG
    ...SHARED_CONFIG,
  });
};

/**
 * FETCH AND CACHE PAGINATED SALES RECORDS FOR THE SELECTED FILTER
 * NEXT PAGE SILENTLY PREFETCHED AFTER CURRENT PAGE LOADS
 */
// <== USE DASHBOARD SALES HOOK ==>
export const useDashboardSales = (
  filterType: DashboardFilterType,
  month: string,
  date: string,
  rangeStart: string,
  rangeEnd: string,
  saleType: SaleType,
  page: number,
  limit: number,
) => {
  // GET AUTH STATE FROM STORE
  const { isAuthenticated, isLoggingOut } = useAuthStore();
  // USING THE QUERY CLIENT TO FETCH DATA
  const queryClient = useQueryClient();
  // RETURN QUERY
  const query = useQuery<
    DashboardPagedResponse<DashboardSaleRecord>,
    AxiosError<ApiErrorResponse>
  >({
    // <== QUERY KEY ==>
    queryKey: dashboardKeys.sales(
      filterType,
      month,
      date,
      rangeStart,
      rangeEnd,
      saleType,
      page,
      limit,
    ),
    // <== QUERY FUNCTION ==>
    queryFn: async () => {
      // BUILDING PARAMS TO GET DASHBOARD SALES
      const params: Record<string, string> = {
        ...buildDateFilterParams(filterType, month, date, rangeStart, rangeEnd),
        saleType,
        page: String(page),
        limit: String(limit),
      };
      // MAKING REQUEST TO GET DASHBOARD SALES
      const response = await apiClient.get<
        ApiResponse<DashboardPagedResponse<DashboardSaleRecord>>
      >("/dashboard/sales", { params });
      // RETURN DATA
      return response.data.data;
    },
    // <== ENABLE QUERY IF AUTHENTICATED
    enabled: isAuthenticated && !isLoggingOut,
    // <== SHARED QUERY CONFIG
    ...SHARED_CONFIG,
  });
  // SILENTLY PREFETCH NEXT PAGE
  useEffect(() => {
    // IF NEXT PAGE EXISTS
    if (query.data?.pagination?.hasNextPage) {
      // SILENTLY PREFETCH NEXT PAGE
      queryClient.prefetchQuery({
        // <== QUERY KEY ==>
        queryKey: dashboardKeys.sales(
          filterType,
          month,
          date,
          rangeStart,
          rangeEnd,
          saleType,
          page + 1,
          limit,
        ),
        // <== QUERY FUNCTION ==>
        queryFn: async () => {
          // MAKING REQUEST TO GET DASHBOARD SALES
          const response = await apiClient.get<
            ApiResponse<DashboardPagedResponse<DashboardSaleRecord>>
          >("/dashboard/sales", {
            params: {
              ...buildDateFilterParams(
                filterType,
                month,
                date,
                rangeStart,
                rangeEnd,
              ),
              saleType,
              page: String(page + 1),
              limit: String(limit),
            },
          });
          // RETURN DATA
          return response.data.data;
        },
        // <== STAKE TIME FROM SHARED QUERY CONFIG ==>
        staleTime: SHARED_CONFIG.staleTime,
      });
    }
  }, [
    query.data,
    filterType,
    month,
    date,
    rangeStart,
    rangeEnd,
    saleType,
    page,
    limit,
    queryClient,
  ]);
  // RETURN QUERY
  return query;
};

/**
 * FETCH AND CACHE PAGINATED QUICK SALE RECORDS FOR THE SELECTED FILTER
 */
// <== USE DASHBOARD QUICK SALES HOOK ==>
export const useDashboardQuickSales = (
  filterType: DashboardFilterType,
  month: string,
  date: string,
  rangeStart: string,
  rangeEnd: string,
  productType: DashboardProductFilter,
  page: number,
  limit: number,
) => {
  // GET AUTH STATE FROM STORE
  const { isAuthenticated, isLoggingOut } = useAuthStore();
  // USING THE QUERY CLIENT TO FETCH DATA
  const queryClient = useQueryClient();
  // RETURN QUERY
  const query = useQuery<
    DashboardPagedResponse<DashboardQuickSaleRecord>,
    AxiosError<ApiErrorResponse>
  >({
    // <== QUERY KEY ==>
    queryKey: dashboardKeys.quickSales(
      filterType,
      month,
      date,
      rangeStart,
      rangeEnd,
      productType,
      page,
      limit,
    ),
    // <== QUERY FUNCTION ==>
    queryFn: async () => {
      // MAKING REQUEST TO GET DASHBOARD QUICK SALES
      const response = await apiClient.get<
        ApiResponse<DashboardPagedResponse<DashboardQuickSaleRecord>>
      >("/dashboard/quick-sales", {
        params: {
          ...buildDateFilterParams(
            filterType,
            month,
            date,
            rangeStart,
            rangeEnd,
          ),
          productType,
          page: String(page),
          limit: String(limit),
        },
      });
      // RETURN DATA
      return response.data.data;
    },
    // <== ENABLE QUERY IF AUTHENTICATED ==>
    enabled: isAuthenticated && !isLoggingOut,
    // <== SHARED QUERY CONFIG ==>
    ...SHARED_CONFIG,
  });
  // SILENTLY PREFETCH NEXT PAGE
  useEffect(() => {
    // IF NEXT PAGE EXISTS
    if (query.data?.pagination?.hasNextPage) {
      // SILENTLY PREFETCH NEXT PAGE
      queryClient.prefetchQuery({
        // <== QUERY KEY ==>
        queryKey: dashboardKeys.quickSales(
          filterType,
          month,
          date,
          rangeStart,
          rangeEnd,
          productType,
          page + 1,
          limit,
        ),
        // <== QUERY FUNCTION ==>
        queryFn: async () => {
          // MAKING REQUEST TO GET DASHBOARD QUICK SALES
          const response = await apiClient.get<
            ApiResponse<DashboardPagedResponse<DashboardQuickSaleRecord>>
          >("/dashboard/quick-sales", {
            params: {
              ...buildDateFilterParams(
                filterType,
                month,
                date,
                rangeStart,
                rangeEnd,
              ),
              productType,
              page: String(page + 1),
              limit: String(limit),
            },
          });
          // RETURN DATA
          return response.data.data;
        },
        // <== STAKE TIME FROM SHARED QUERY CONFIG ==>
        staleTime: SHARED_CONFIG.staleTime,
      });
    }
  }, [
    query.data,
    filterType,
    month,
    date,
    rangeStart,
    rangeEnd,
    productType,
    page,
    limit,
    queryClient,
  ]);
  // RETURN QUERY
  return query;
};

/**
 * FETCH AND CACHE PAGINATED PURCHASE RECORDS FOR THE SELECTED FILTER
 */
// <== USE DASHBOARD PURCHASES HOOK ==>
export const useDashboardPurchases = (
  filterType: DashboardFilterType,
  month: string,
  date: string,
  rangeStart: string,
  rangeEnd: string,
  page: number,
  limit: number,
) => {
  // GET AUTH STATE FROM STORE
  const { isAuthenticated, isLoggingOut } = useAuthStore();
  // USING THE QUERY CLIENT TO FETCH DATA
  const queryClient = useQueryClient();
  // RETURN QUERY
  const query = useQuery<
    DashboardPagedResponse<DashboardPurchaseRecord>,
    AxiosError<ApiErrorResponse>
  >({
    // <== QUERY KEY ==>
    queryKey: dashboardKeys.purchases(
      filterType,
      month,
      date,
      rangeStart,
      rangeEnd,
      page,
      limit,
    ),
    // <== QUERY FUNCTION ==>
    queryFn: async () => {
      // MAKING REQUEST TO GET DASHBOARD PURCHASES
      const response = await apiClient.get<
        ApiResponse<DashboardPagedResponse<DashboardPurchaseRecord>>
      >("/dashboard/purchases", {
        params: {
          ...buildDateFilterParams(
            filterType,
            month,
            date,
            rangeStart,
            rangeEnd,
          ),
          page: String(page),
          limit: String(limit),
        },
      });
      // RETURN DATA
      return response.data.data;
    },
    // <== ENABLE QUERY IF AUTHENTICATED ==>
    enabled: isAuthenticated && !isLoggingOut,
    // <== SHARED QUERY CONFIG ==>
    ...SHARED_CONFIG,
  });
  // SILENTLY PREFETCH NEXT PAGE
  useEffect(() => {
    // IF NEXT PAGE EXISTS
    if (query.data?.pagination?.hasNextPage) {
      // SILENTLY PREFETCH NEXT PAGE
      queryClient.prefetchQuery({
        // <== QUERY KEY ==>
        queryKey: dashboardKeys.purchases(
          filterType,
          month,
          date,
          rangeStart,
          rangeEnd,
          page + 1,
          limit,
        ),
        // <== QUERY FUNCTION ==>
        queryFn: async () => {
          // MAKING REQUEST TO GET DASHBOARD PURCHASES
          const response = await apiClient.get<
            ApiResponse<DashboardPagedResponse<DashboardPurchaseRecord>>
          >("/dashboard/purchases", {
            params: {
              ...buildDateFilterParams(
                filterType,
                month,
                date,
                rangeStart,
                rangeEnd,
              ),
              page: String(page + 1),
              limit: String(limit),
            },
          });
          // RETURN DATA
          return response.data.data;
        },
        // <== STAKE TIME FROM SHARED QUERY CONFIG ==>
        staleTime: SHARED_CONFIG.staleTime,
      });
    }
  }, [
    query.data,
    filterType,
    month,
    date,
    rangeStart,
    rangeEnd,
    page,
    limit,
    queryClient,
  ]);
  // RETURN QUERY
  return query;
};

/**
 * FETCH AND CACHE PAGINATED EXPENDITURE RECORDS FOR THE SELECTED FILTER
 */
// <== USE DASHBOARD EXPENDITURES HOOK ==>
export const useDashboardExpenditures = (
  filterType: DashboardFilterType,
  month: string,
  date: string,
  rangeStart: string,
  rangeEnd: string,
  category: DashboardCategoryFilter,
  page: number,
  limit: number,
) => {
  // GET AUTH STATE FROM STORE
  const { isAuthenticated, isLoggingOut } = useAuthStore();
  // USING THE QUERY CLIENT TO FETCH DATA
  const queryClient = useQueryClient();
  // RETURN QUERY
  const query = useQuery<
    DashboardPagedResponse<DashboardExpenditureRecord>,
    AxiosError<ApiErrorResponse>
  >({
    // <== QUERY KEY ==>
    queryKey: dashboardKeys.expenditures(
      filterType,
      month,
      date,
      rangeStart,
      rangeEnd,
      category,
      page,
      limit,
    ),
    // <== QUERY FUNCTION ==>
    queryFn: async () => {
      // MAKING REQUEST TO GET DASHBOARD EXPENDITURES
      const response = await apiClient.get<
        ApiResponse<DashboardPagedResponse<DashboardExpenditureRecord>>
      >("/dashboard/expenditures", {
        params: {
          ...buildDateFilterParams(
            filterType,
            month,
            date,
            rangeStart,
            rangeEnd,
          ),
          category,
          page: String(page),
          limit: String(limit),
        },
      });
      // RETURN DATA
      return response.data.data;
    },
    // <== ENABLE QUERY IF AUTHENTICATED ==>
    enabled: isAuthenticated && !isLoggingOut,
    // <== SHARED QUERY CONFIG ==>
    ...SHARED_CONFIG,
  });
  // SILENTLY PREFETCH NEXT PAGE
  useEffect(() => {
    // IF NEXT PAGE EXISTS
    if (query.data?.pagination?.hasNextPage) {
      // SILENTLY PREFETCH NEXT PAGE
      queryClient.prefetchQuery({
        // <== QUERY KEY ==>
        queryKey: dashboardKeys.expenditures(
          filterType,
          month,
          date,
          rangeStart,
          rangeEnd,
          category,
          page + 1,
          limit,
        ),
        // <== QUERY FUNCTION ==>
        queryFn: async () => {
          // MAKING REQUEST TO GET DASHBOARD EXPENDITURES
          const response = await apiClient.get<
            ApiResponse<DashboardPagedResponse<DashboardExpenditureRecord>>
          >("/dashboard/expenditures", {
            params: {
              ...buildDateFilterParams(
                filterType,
                month,
                date,
                rangeStart,
                rangeEnd,
              ),
              category,
              page: String(page + 1),
              limit: String(limit),
            },
          });
          // RETURN DATA
          return response.data.data;
        },
        // <== STAKE TIME FROM SHARED QUERY CONFIG ==>
        staleTime: SHARED_CONFIG.staleTime,
      });
    }
  }, [
    query.data,
    filterType,
    month,
    date,
    rangeStart,
    rangeEnd,
    category,
    page,
    limit,
    queryClient,
  ]);
  // RETURN QUERY
  return query;
};

/**
 * FETCH AND CACHE PAGINATED STAFF MEMBERS WITH MONTH SALARY STATUS
 */
// <== USE DASHBOARD STAFF HOOK ==>
export const useDashboardStaff = (
  month: string,
  page: number,
  limit: number,
) => {
  // GET AUTH STATE FROM STORE
  const { isAuthenticated, isLoggingOut } = useAuthStore();
  // USING THE QUERY CLIENT TO FETCH DATA
  const queryClient = useQueryClient();
  // RETURN QUERY
  const query = useQuery<
    DashboardPagedResponse<DashboardStaffRecord>,
    AxiosError<ApiErrorResponse>
  >({
    // <== QUERY KEY ==>
    queryKey: dashboardKeys.staff(month, page, limit),
    // <== QUERY FUNCTION ==>
    queryFn: async () => {
      // MAKING REQUEST TO GET DASHBOARD STAFF
      const response = await apiClient.get<
        ApiResponse<DashboardPagedResponse<DashboardStaffRecord>>
      >("/dashboard/staff", {
        params: { month, page: String(page), limit: String(limit) },
      });
      // RETURN DATA
      return response.data.data;
    },
    // <== ENABLE QUERY IF AUTHENTICATED ==>
    enabled: isAuthenticated && !isLoggingOut,
    // <== SHARED QUERY CONFIG ==>
    ...SHARED_CONFIG,
  });
  // SILENTLY PREFETCH NEXT PAGE
  useEffect(() => {
    // IF NEXT PAGE EXISTS
    if (query.data?.pagination?.hasNextPage) {
      // SILENTLY PREFETCH NEXT PAGE
      queryClient.prefetchQuery({
        // <== QUERY KEY ==>
        queryKey: dashboardKeys.staff(month, page + 1, limit),
        // <== QUERY FUNCTION ==>
        queryFn: async () => {
          // MAKING REQUEST TO GET DASHBOARD STAFF
          const response = await apiClient.get<
            ApiResponse<DashboardPagedResponse<DashboardStaffRecord>>
          >("/dashboard/staff", {
            params: { month, page: String(page + 1), limit: String(limit) },
          });
          // RETURN DATA
          return response.data.data;
        },
        // <== STAKE TIME FROM SHARED QUERY CONFIG ==>
        staleTime: SHARED_CONFIG.staleTime,
      });
    }
  }, [query.data, month, page, limit, queryClient]);
  // RETURN QUERY
  return query;
};

/**
 * FETCH AND CACHE PAGINATED CUSTOMERS WITH MONTH DELIVERY AND BILLING STATS
 */
// <== USE DASHBOARD CUSTOMERS HOOK ==>
export const useDashboardCustomers = (
  month: string,
  page: number,
  limit: number,
) => {
  // GET AUTH STATE FROM STORE
  const { isAuthenticated, isLoggingOut } = useAuthStore();
  // USING THE QUERY CLIENT TO FETCH DATA
  const queryClient = useQueryClient();
  // RETURN QUERY
  const query = useQuery<
    DashboardPagedResponse<DashboardCustomerRecord>,
    AxiosError<ApiErrorResponse>
  >({
    // <== QUERY KEY ==>
    queryKey: dashboardKeys.customers(month, page, limit),
    // <== QUERY FUNCTION ==>
    queryFn: async () => {
      // MAKING REQUEST TO GET DASHBOARD CUSTOMERS
      const response = await apiClient.get<
        ApiResponse<DashboardPagedResponse<DashboardCustomerRecord>>
      >("/dashboard/customers", {
        params: { month, page: String(page), limit: String(limit) },
      });
      // RETURN DATA
      return response.data.data;
    },
    // <== ENABLE QUERY IF AUTHENTICATED ==>
    enabled: isAuthenticated && !isLoggingOut,
    // <== SHARED QUERY CONFIG ==>
    ...SHARED_CONFIG,
  });
  // SILENTLY PREFETCH NEXT PAGE
  useEffect(() => {
    // IF NEXT PAGE EXISTS
    if (query.data?.pagination?.hasNextPage) {
      // SILENTLY PREFETCH NEXT PAGE
      queryClient.prefetchQuery({
        // <== QUERY KEY ==>
        queryKey: dashboardKeys.customers(month, page + 1, limit),
        // <== QUERY FUNCTION ==>
        queryFn: async () => {
          // MAKING REQUEST TO GET DASHBOARD CUSTOMERS
          const response = await apiClient.get<
            ApiResponse<DashboardPagedResponse<DashboardCustomerRecord>>
          >("/dashboard/customers", {
            params: { month, page: String(page + 1), limit: String(limit) },
          });
          // RETURN DATA
          return response.data.data;
        },
        // <== STAKE TIME FROM SHARED QUERY CONFIG ==>
        staleTime: SHARED_CONFIG.staleTime,
      });
    }
  }, [query.data, month, page, limit, queryClient]);
  // RETURN QUERY
  return query;
};

/**
 * FETCH AND CACHE PAGINATED MILK LOG ENTRIES FOR THE SELECTED FILTER
 */
// <== USE DASHBOARD MILK LOGS HOOK ==>
export const useDashboardMilkLogs = (
  filterType: DashboardFilterType,
  month: string,
  date: string,
  rangeStart: string,
  rangeEnd: string,
  page: number,
  limit: number,
) => {
  // GET AUTH STATE FROM STORE
  const { isAuthenticated, isLoggingOut } = useAuthStore();
  // USING THE QUERY CLIENT TO FETCH DATA
  const queryClient = useQueryClient();
  // RETURN QUERY
  const query = useQuery<
    DashboardPagedResponse<DashboardMilkLogRecord>,
    AxiosError<ApiErrorResponse>
  >({
    // <== QUERY KEY ==>
    queryKey: dashboardKeys.milkLogs(
      filterType,
      month,
      date,
      rangeStart,
      rangeEnd,
      page,
      limit,
    ),
    // <== QUERY FUNCTION ==>
    queryFn: async () => {
      // MAKING REQUEST TO GET DASHBOARD MILK LOGS
      const response = await apiClient.get<
        ApiResponse<DashboardPagedResponse<DashboardMilkLogRecord>>
      >("/dashboard/milk-logs", {
        params: {
          ...buildDateFilterParams(
            filterType,
            month,
            date,
            rangeStart,
            rangeEnd,
          ),
          page: String(page),
          limit: String(limit),
        },
      });
      // RETURN DATA
      return response.data.data;
    },
    // <== ENABLE QUERY IF AUTHENTICATED ==>
    enabled: isAuthenticated && !isLoggingOut,
    // <== SHARED QUERY CONFIG ==>
    ...SHARED_CONFIG,
  });
  // SILENTLY PREFETCH NEXT PAGE
  useEffect(() => {
    // IF NEXT PAGE EXISTS
    if (query.data?.pagination?.hasNextPage) {
      // SILENTLY PREFETCH NEXT PAGE
      queryClient.prefetchQuery({
        // <== QUERY KEY ==>
        queryKey: dashboardKeys.milkLogs(
          filterType,
          month,
          date,
          rangeStart,
          rangeEnd,
          page + 1,
          limit,
        ),
        // <== QUERY FUNCTION ==>
        queryFn: async () => {
          // MAKING REQUEST TO GET DASHBOARD MILK LOGS
          const response = await apiClient.get<
            ApiResponse<DashboardPagedResponse<DashboardMilkLogRecord>>
          >("/dashboard/milk-logs", {
            params: {
              ...buildDateFilterParams(
                filterType,
                month,
                date,
                rangeStart,
                rangeEnd,
              ),
              page: String(page + 1),
              limit: String(limit),
            },
          });
          // RETURN DATA
          return response.data.data;
        },
        // <== STAKE TIME FROM SHARED QUERY CONFIG ==>
        staleTime: SHARED_CONFIG.staleTime,
      });
    }
  }, [
    query.data,
    filterType,
    month,
    date,
    rangeStart,
    rangeEnd,
    page,
    limit,
    queryClient,
  ]);
  // RETURN QUERY
  return query;
};
