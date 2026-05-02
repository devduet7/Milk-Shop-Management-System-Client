// <== IMPORTS ==>
import type {
  ApiResponse,
  SaleRecovery,
  RecoveryFilter,
  RecoveryStatus,
  ApiErrorResponse,
  RecoveriesListData,
  UpdateSalePaymentVariables,
  AddDeliveryPaymentVariables,
} from "../types/recovery-types";
import { toast } from "sonner";
import { useEffect } from "react";
import { AxiosError } from "axios";
import { saleKeys } from "./useSales";
import apiClient from "../lib/apiClient";
import { customerKeys } from "./useCustomers";
import { useAuthStore } from "../stores/useAuthStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// <== QUERY KEY FACTORY ==>
export const recoveryKeys = {
  // <== ROOT KEY FOR ALL RECOVERY QUERIES ==>
  all: ["recoveries"] as const,
  // <== LIST QUERY NAMESPACE ==>
  lists: () => [...recoveryKeys.all, "list"] as const,
  // <== DELIVERY RECOVERY LIST WITH FILTERS ==>
  deliveryList: (filters: {
    filter: RecoveryFilter;
    month: string;
    status: RecoveryStatus;
    search: string;
    page: number;
    limit: number;
  }) => [...recoveryKeys.lists(), "deliveries", filters] as const,
  // <== SALE RECOVERY LIST WITH FILTERS ==>
  saleList: (filters: {
    filter: RecoveryFilter;
    month: string;
    status: RecoveryStatus;
    search: string;
    page: number;
    limit: number;
  }) => [...recoveryKeys.lists(), "sales", filters] as const,
};

/**
 * FETCH DELIVERY RECOVERY RECORDS WITH COMBINED STATS
 * @param filter - PERIOD FILTER TYPE
 * @param month - BILLING MONTH (YYYY-MM) — ONLY WHEN FILTER IS MONTH
 * @param status - STATUS FILTER (ALL | PENDING | CLEARED)
 * @param search - OPTIONAL CUSTOMER NAME SEARCH
 * @param page - CURRENT PAGE NUMBER (1-BASED)
 * @param limit - ITEMS PER PAGE
 * @returns DELIVERY RECOVERIES LIST DATA WITH COMBINED STATS
 */
// <== FETCH DELIVERY RECOVERIES QUERY FUNCTION ==>
const fetchDeliveryRecoveries = async (
  filter: RecoveryFilter,
  month: string,
  status: RecoveryStatus,
  search: string,
  page: number,
  limit: number,
): Promise<RecoveriesListData> => {
  // BUILD REQUEST PARAMS
  const params: Record<string, string> = {
    tab: "deliveries",
    filter,
    status,
    page: String(page),
    limit: String(limit),
  };
  // ONLY INCLUDE MONTH WHEN FILTER IS MONTH
  if (filter === "month" && month) params.month = month;
  // ONLY INCLUDE SEARCH IF NOT EMPTY
  if (search.trim()) params.search = search.trim();
  // MAKE API REQUEST
  const response = await apiClient.get<ApiResponse<RecoveriesListData>>(
    "/recoveries",
    { params },
  );
  // RETURN DATA OR SAFE FALLBACK
  return (
    response.data?.data ?? {
      records: [],
      pagination: {
        total: 0,
        page,
        limit,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
      stats: {
        deliveryOutstanding: 0,
        salesOutstanding: 0,
        totalOutstanding: 0,
        totalDue: 0,
        recoveryRate: 0,
      },
      appliedFilter: {
        type: filter,
        billingMonth: "",
        month: filter === "month" ? month : null,
        startDate: "",
        endDate: "",
      },
    }
  );
};

/**
 * FETCH SALE RECOVERY RECORDS WITH COMBINED STATS
 * @param filter - PERIOD FILTER TYPE
 * @param month - BILLING MONTH (YYYY-MM) — ONLY WHEN FILTER IS MONTH
 * @param status - STATUS FILTER (ALL | PENDING | CLEARED)
 * @param search - OPTIONAL CUSTOMER NAME SEARCH
 * @param page - CURRENT PAGE NUMBER (1-BASED)
 * @param limit - ITEMS PER PAGE
 * @returns SALE RECOVERIES LIST DATA WITH COMBINED STATS
 */
// <== FETCH SALE RECOVERIES QUERY FUNCTION ==>
const fetchSaleRecoveries = async (
  filter: RecoveryFilter,
  month: string,
  status: RecoveryStatus,
  search: string,
  page: number,
  limit: number,
): Promise<RecoveriesListData> => {
  // BUILD REQUEST PARAMS
  const params: Record<string, string> = {
    tab: "sales",
    filter,
    status,
    page: String(page),
    limit: String(limit),
  };
  // ONLY INCLUDE MONTH WHEN FILTER IS MONTH
  if (filter === "month" && month) params.month = month;
  // ONLY INCLUDE SEARCH IF NOT EMPTY
  if (search.trim()) params.search = search.trim();
  // MAKE API REQUEST
  const response = await apiClient.get<ApiResponse<RecoveriesListData>>(
    "/recoveries",
    { params },
  );
  // RETURN DATA OR SAFE FALLBACK
  return (
    response.data?.data ?? {
      records: [],
      pagination: {
        total: 0,
        page,
        limit,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
      stats: {
        deliveryOutstanding: 0,
        salesOutstanding: 0,
        totalOutstanding: 0,
        totalDue: 0,
        recoveryRate: 0,
      },
      appliedFilter: {
        type: filter,
        billingMonth: "",
        month: filter === "month" ? month : null,
        startDate: "",
        endDate: "",
      },
    }
  );
};

/**
 * FETCH AND CACHE DELIVERY RECOVERY RECORDS
 * NEXT PAGE IS SILENTLY PREFETCHED AFTER CURRENT PAGE LOADS
 */
// <== USE DELIVERY RECOVERIES QUERY HOOK ==>
export const useDeliveryRecoveries = (
  filter: RecoveryFilter,
  month: string,
  status: RecoveryStatus,
  search: string,
  page: number,
  limit: number,
) => {
  // GET AUTH STATE FROM STORE
  const { isAuthenticated, isLoggingOut } = useAuthStore();
  // QUERY CLIENT FOR NEXT-PAGE PREFETCH
  const queryClient = useQueryClient();
  // FETCH CURRENT PAGE
  const query = useQuery<RecoveriesListData, AxiosError<ApiErrorResponse>>({
    // <== QUERY KEY ==>
    queryKey: recoveryKeys.deliveryList({
      filter,
      month,
      status,
      search,
      page,
      limit,
    }),
    // <== QUERY FUNCTION ==>
    queryFn: () =>
      fetchDeliveryRecoveries(filter, month, status, search, page, limit),
    // <== ONLY FETCH WHEN AUTHENTICATED ==>
    enabled: isAuthenticated && !isLoggingOut,
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
    retry: (failureCount, error) => {
      // DON'T RETRY ON 404
      if (error?.response?.status === 404) return false;
      // RETRY UP TO 3 TIMES
      return failureCount < 3;
    },
  });
  // SILENTLY PREFETCH NEXT PAGE
  useEffect(() => {
    // IF NEXT PAGE EXISTS
    if (query.data?.pagination?.hasNextPage) {
      // PREFETCH NEXT PAGE
      queryClient.prefetchQuery({
        // <== QUERY KEY ==>
        queryKey: recoveryKeys.deliveryList({
          filter,
          month,
          status,
          search,
          page: page + 1,
          limit,
        }),
        // <== QUERY FUNCTION ==>
        queryFn: () =>
          fetchDeliveryRecoveries(
            filter,
            month,
            status,
            search,
            page + 1,
            limit,
          ),
        // <== STALE TIME: 2 MINUTES ==>
        staleTime: 2 * 60 * 1000,
      });
    }
  }, [query.data, filter, month, status, search, page, limit, queryClient]);
  // RETURN QUERY
  return query;
};

/**
 * FETCH AND CACHE SALE RECOVERY RECORDS
 * NEXT PAGE IS SILENTLY PREFETCHED AFTER CURRENT PAGE LOADS
 */
// <== USE SALE RECOVERIES QUERY HOOK ==>
export const useSaleRecoveries = (
  filter: RecoveryFilter,
  month: string,
  status: RecoveryStatus,
  search: string,
  page: number,
  limit: number,
) => {
  // GET AUTH STATE FROM STORE
  const { isAuthenticated, isLoggingOut } = useAuthStore();
  // QUERY CLIENT FOR NEXT-PAGE PREFETCH
  const queryClient = useQueryClient();
  // FETCH CURRENT PAGE
  const query = useQuery<RecoveriesListData, AxiosError<ApiErrorResponse>>({
    // <== QUERY KEY ==>
    queryKey: recoveryKeys.saleList({
      filter,
      month,
      status,
      search,
      page,
      limit,
    }),
    // <== QUERY FUNCTION ==>
    queryFn: () =>
      fetchSaleRecoveries(filter, month, status, search, page, limit),
    // <== ONLY FETCH WHEN AUTHENTICATED ==>
    enabled: isAuthenticated && !isLoggingOut,
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
    retry: (failureCount, error) => {
      // DON'T RETRY ON 404
      if (error?.response?.status === 404) return false;
      // RETRY UP TO 3 TIMES
      return failureCount < 3;
    },
  });
  // SILENTLY PREFETCH NEXT PAGE
  useEffect(() => {
    // IF NEXT PAGE EXISTS
    if (query.data?.pagination?.hasNextPage) {
      // PREFETCH NEXT PAGE
      queryClient.prefetchQuery({
        // <== QUERY KEY ==>
        queryKey: recoveryKeys.saleList({
          filter,
          month,
          status,
          search,
          page: page + 1,
          limit,
        }),
        // <== QUERY FUNCTION ==>
        queryFn: () =>
          fetchSaleRecoveries(filter, month, status, search, page + 1, limit),
        // <== STALE TIME: 2 MINUTES ==>
        staleTime: 2 * 60 * 1000,
      });
    }
  }, [query.data, filter, month, status, search, page, limit, queryClient]);
  // RETURN QUERY
  return query;
};

/**
 * ADD A DELIVERY PAYMENT FOR A CUSTOMER'S BILLING MONTH
 * INVALIDATES RECOVERY QUERIES AND CUSTOMER MODULE QUERIES (CROSS-MODULE SYNC)
 */
// <== USE ADD DELIVERY PAYMENT MUTATION HOOK ==>
export const useAddDeliveryPayment = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<{ payment: unknown; monthlyStats: unknown }>,
    AxiosError<ApiErrorResponse>,
    AddDeliveryPaymentVariables
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async ({
      customerId,
      data,
    }: AddDeliveryPaymentVariables): Promise<
      ApiResponse<{ payment: unknown; monthlyStats: unknown }>
    > => {
      // CALL ADD DELIVERY PAYMENT API
      const response = await apiClient.post<
        ApiResponse<{ payment: unknown; monthlyStats: unknown }>
      >(`/recoveries/delivery/${customerId}`, data);
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS — INVALIDATE RECOVERY AND CUSTOMER MODULE CACHES ==>
    onSuccess: (data): void => {
      // INVALIDATE ALL RECOVERY LIST QUERIES
      queryClient.invalidateQueries({ queryKey: recoveryKeys.lists() });
      // INVALIDATE CUSTOMER LIST QUERIES (CROSS-MODULE SYNC)
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      // INVALIDATE CUSTOMER DETAIL QUERIES (CROSS-MODULE SYNC)
      queryClient.invalidateQueries({ queryKey: customerKeys.details() });
      // SHOW SUCCESS TOAST WITH SERVER MESSAGE
      toast.success(data.message || "Payment recorded successfully!");
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(error.response?.data?.message || "Failed to record payment.");
    },
  });
};

/**
 * UPDATE PAID AMOUNT ON A CUSTOMER SALE
 * INVALIDATES RECOVERY QUERIES AND SALE MODULE QUERIES (CROSS-MODULE SYNC)
 */
// <== USE UPDATE SALE PAYMENT MUTATION HOOK ==>
export const useUpdateSalePayment = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<{ sale: SaleRecovery }>,
    AxiosError<ApiErrorResponse>,
    UpdateSalePaymentVariables
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async ({
      saleId,
      data,
    }: UpdateSalePaymentVariables): Promise<
      ApiResponse<{ sale: SaleRecovery }>
    > => {
      // CALL UPDATE SALE PAYMENT API
      const response = await apiClient.patch<
        ApiResponse<{ sale: SaleRecovery }>
      >(`/recoveries/sale/${saleId}`, data);
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS — INVALIDATE RECOVERY AND SALES MODULE CACHES ==>
    onSuccess: (): void => {
      // INVALIDATE ALL RECOVERY LIST QUERIES
      queryClient.invalidateQueries({ queryKey: recoveryKeys.lists() });
      // INVALIDATE SALE LIST QUERIES (CROSS-MODULE SYNC)
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      // SHOW SUCCESS TOAST
      toast.success("Sale payment updated successfully!");
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(
        error.response?.data?.message || "Failed to update sale payment.",
      );
    },
  });
};

/**
 * DELETE A CUSTOMER SALE RECORD FROM RECOVERIES
 * INVALIDATES RECOVERY QUERIES AND SALE MODULE QUERIES (CROSS-MODULE SYNC)
 */
// <== USE DELETE SALE RECORD MUTATION HOOK ==>
export const useDeleteSaleRecord = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<void>,
    AxiosError<ApiErrorResponse>,
    string // SALE ID
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (saleId: string): Promise<ApiResponse<void>> => {
      // CALL DELETE SALE RECORD API
      const response = await apiClient.delete<ApiResponse<void>>(
        `/recoveries/sale/${saleId}`,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS — INVALIDATE RECOVERY AND SALES MODULE CACHES ==>
    onSuccess: (): void => {
      // INVALIDATE ALL RECOVERY LIST QUERIES
      queryClient.invalidateQueries({ queryKey: recoveryKeys.lists() });
      // INVALIDATE SALE LIST QUERIES (CROSS-MODULE SYNC)
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      // SHOW SUCCESS TOAST
      toast.success("Sale record deleted successfully!");
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(
        error.response?.data?.message || "Failed to delete sale record.",
      );
    },
  });
};
