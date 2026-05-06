// <== IMPORTS ==>
import type {
  SaleType,
  ApiResponse,
  ApiErrorResponse,
  DashboardSummary,
  DashboardSaleRecord,
  DashboardStaffRecord,
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
  // <== SUMMARY KEY ==>
  summary: (month: string) => [...dashboardKeys.all, "summary", month] as const,
  // <== SALES KEY ==>
  sales: (month: string, saleType: SaleType, page: number, limit: number) =>
    [...dashboardKeys.all, "sales", month, saleType, page, limit] as const,
  // <== QUICK SALES KEY ==>
  quickSales: (
    month: string,
    productType: DashboardProductFilter,
    page: number,
    limit: number,
  ) =>
    [
      ...dashboardKeys.all,
      "quickSales",
      month,
      productType,
      page,
      limit,
    ] as const,
  // <== PURCHASES KEY ==>
  purchases: (month: string, page: number, limit: number) =>
    [...dashboardKeys.all, "purchases", month, page, limit] as const,
  // <== EXPENDITURES KEY ==>
  expenditures: (
    month: string,
    category: DashboardCategoryFilter,
    page: number,
    limit: number,
  ) =>
    [
      ...dashboardKeys.all,
      "expenditures",
      month,
      category,
      page,
      limit,
    ] as const,
  // <== STAFF KEY ==>
  staff: (month: string, page: number, limit: number) =>
    [...dashboardKeys.all, "staff", month, page, limit] as const,
  // <== CUSTOMERS KEY ==>
  customers: (month: string, page: number, limit: number) =>
    [...dashboardKeys.all, "customers", month, page, limit] as const,
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

/**
 * FETCH AND CACHE COMPREHENSIVE DASHBOARD SUMMARY FOR THE SELECTED MONTH
 */
// <== USE DASHBOARD SUMMARY HOOK ==>
export const useDashboardSummary = (month: string) => {
  // GET AUTH STATE FROM STORE
  const { isAuthenticated, isLoggingOut } = useAuthStore();
  // RETURN QUERY
  return useQuery<DashboardSummary, AxiosError<ApiErrorResponse>>({
    // <== QUERY KEY ==>
    queryKey: dashboardKeys.summary(month),
    // <== QUERY FUNCTION ==>
    queryFn: async () => {
      // MAKE REQUEST TO GET DASHBOARD SUMMARY
      const response = await apiClient.get<ApiResponse<DashboardSummary>>(
        "/dashboard",
        { params: { month } },
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
 * FETCH AND CACHE PAGINATED SALES RECORDS FOR THE SELECTED MONTH
 * NEXT PAGE SILENTLY PREFETCHED AFTER CURRENT PAGE LOADS
 */
// <== USE DASHBOARD SALES HOOK ==>
export const useDashboardSales = (
  month: string,
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
    queryKey: dashboardKeys.sales(month, saleType, page, limit),
    // <== QUERY FUNCTION ==>
    queryFn: async () => {
      // BUILDING PARAMS TO GET DASHBOARD SALES
      const params: Record<string, string> = {
        month,
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
        queryKey: dashboardKeys.sales(month, saleType, page + 1, limit),
        // <== QUERY FUNCTION ==>
        queryFn: async () => {
          // MAKING REQUEST TO GET DASHBOARD SALES
          const response = await apiClient.get<
            ApiResponse<DashboardPagedResponse<DashboardSaleRecord>>
          >("/dashboard/sales", {
            params: {
              month,
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
  }, [query.data, month, saleType, page, limit, queryClient]);
  // RETURN QUERY
  return query;
};

/**
 * FETCH AND CACHE PAGINATED QUICK SALE RECORDS FOR THE SELECTED MONTH
 */
// <== USE DASHBOARD QUICK SALES HOOK ==>
export const useDashboardQuickSales = (
  month: string,
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
    queryKey: dashboardKeys.quickSales(month, productType, page, limit),
    // <== QUERY FUNCTION ==>
    queryFn: async () => {
      // MAKING REQUEST TO GET DASHBOARD QUICK SALES
      const response = await apiClient.get<
        ApiResponse<DashboardPagedResponse<DashboardQuickSaleRecord>>
      >("/dashboard/quick-sales", {
        params: {
          month,
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
        queryKey: dashboardKeys.quickSales(month, productType, page + 1, limit),
        // <== QUERY FUNCTION ==>
        queryFn: async () => {
          // MAKING REQUEST TO GET DASHBOARD QUICK SALES
          const response = await apiClient.get<
            ApiResponse<DashboardPagedResponse<DashboardQuickSaleRecord>>
          >("/dashboard/quick-sales", {
            params: {
              month,
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
  }, [query.data, month, productType, page, limit, queryClient]);
  // RETURN QUERY
  return query;
};

/**
 * FETCH AND CACHE PAGINATED PURCHASE RECORDS FOR THE SELECTED MONTH
 */
// <== USE DASHBOARD PURCHASES HOOK ==>
export const useDashboardPurchases = (
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
    DashboardPagedResponse<DashboardPurchaseRecord>,
    AxiosError<ApiErrorResponse>
  >({
    // <== QUERY KEY ==>
    queryKey: dashboardKeys.purchases(month, page, limit),
    // <== QUERY FUNCTION ==>
    queryFn: async () => {
      // MAKING REQUEST TO GET DASHBOARD PURCHASES
      const response = await apiClient.get<
        ApiResponse<DashboardPagedResponse<DashboardPurchaseRecord>>
      >("/dashboard/purchases", {
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
        queryKey: dashboardKeys.purchases(month, page + 1, limit),
        // <== QUERY FUNCTION ==>
        queryFn: async () => {
          // MAKING REQUEST TO GET DASHBOARD PURCHASES
          const response = await apiClient.get<
            ApiResponse<DashboardPagedResponse<DashboardPurchaseRecord>>
          >("/dashboard/purchases", {
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
 * FETCH AND CACHE PAGINATED EXPENDITURE RECORDS FOR THE SELECTED MONTH
 */
// <== USE DASHBOARD EXPENDITURES HOOK ==>
export const useDashboardExpenditures = (
  month: string,
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
    queryKey: dashboardKeys.expenditures(month, category, page, limit),
    // <== QUERY FUNCTION ==>
    queryFn: async () => {
      // MAKING REQUEST TO GET DASHBOARD EXPENDITURES
      const response = await apiClient.get<
        ApiResponse<DashboardPagedResponse<DashboardExpenditureRecord>>
      >("/dashboard/expenditures", {
        params: { month, category, page: String(page), limit: String(limit) },
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
        queryKey: dashboardKeys.expenditures(month, category, page + 1, limit),
        // <== QUERY FUNCTION ==>
        queryFn: async () => {
          // MAKING REQUEST TO GET DASHBOARD EXPENDITURES
          const response = await apiClient.get<
            ApiResponse<DashboardPagedResponse<DashboardExpenditureRecord>>
          >("/dashboard/expenditures", {
            params: {
              month,
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
  }, [query.data, month, category, page, limit, queryClient]);
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
