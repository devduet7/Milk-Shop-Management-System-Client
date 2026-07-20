// <== IMPORTS ==>
import type {
  QuickSale,
  ApiResponse,
  ApiErrorResponse,
  QuickSaleListData,
  QuickSaleFilterType,
  AddQuickSaleFormValues,
  QuickSaleProductFilter,
} from "../types/quick-sale-types";
import { toast } from "sonner";
import { useEffect } from "react";
import { AxiosError } from "axios";
import { trashKeys } from "./useTrash";
import apiClient from "../lib/apiClient";
import { dashboardKeys } from "./useDashboard";
import { analyticsKeys } from "./useAnalytics";
import { useAuthStore } from "../stores/useAuthStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// <== QUERY KEY FACTORY ==>
export const quickSaleKeys = {
  // <== ROOT KEY FOR ALL QUICK SALE QUERIES ==>
  all: ["quickSales"] as const,
  // <== LIST QUERY NAMESPACE ==>
  lists: () => [...quickSaleKeys.all, "list"] as const,
  // <== QUICK SALE LIST WITH FILTERS ==>
  list: (filters: {
    filterType: QuickSaleFilterType;
    date: string;
    month: string;
    productType: QuickSaleProductFilter;
    page: number;
    limit: number;
  }) => [...quickSaleKeys.lists(), filters] as const,
};

// <== FETCH QUICK SALES QUERY FUNCTION ==>
const fetchQuickSales = async (
  filterType: QuickSaleFilterType,
  date: string,
  month: string,
  productType: QuickSaleProductFilter,
  page: number,
  limit: number,
): Promise<QuickSaleListData> => {
  // BUILD REQUEST PARAMS
  const params: Record<string, string> = {
    filterType,
    productType,
    page: String(page),
    limit: String(limit),
  };
  // ONLY INCLUDE MONTH WHEN FILTER TYPE IS MONTH
  if (filterType === "month" && month) params.month = month;
  // ONLY INCLUDE DATE WHEN FILTER TYPE IS DATE
  if (filterType === "date" && date) params.date = date;
  // MAKE API REQUEST
  const response = await apiClient.get<ApiResponse<QuickSaleListData>>(
    "/quick-sales",
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
        totalRevenue: 0,
        totalMilkQty: 0,
        totalYoghurtQty: 0,
        milkRevenue: 0,
        yoghurtRevenue: 0,
        totalTransactions: 0,
      },
      appliedFilter: {
        filterType,
        startDate: "",
        endDate: "",
        month: filterType === "month" ? month : null,
        date: filterType === "date" ? date : null,
      },
    }
  );
};

/**
 * FETCH AND CACHE QUICK SALES WITH STATS
 * NEXT PAGE IS SILENTLY PREFETCHED AFTER CURRENT PAGE LOADS
 * STALE TIME IS 1 MINUTE SINCE QUICK SALES CHANGE FREQUENTLY THROUGHOUT THE DAY
 */
// <== USE QUICK SALES QUERY HOOK ==>
export const useQuickSales = (
  filterType: QuickSaleFilterType,
  date: string,
  month: string,
  productType: QuickSaleProductFilter,
  page: number,
  limit: number,
) => {
  // GET AUTH STATE FROM STORE
  const { isAuthenticated, isLoggingOut } = useAuthStore();
  // QUERY CLIENT FOR NEXT-PAGE PREFETCH
  const queryClient = useQueryClient();
  // FETCH CURRENT PAGE
  const query = useQuery<QuickSaleListData, AxiosError<ApiErrorResponse>>({
    // <== QUERY KEY ==>
    queryKey: quickSaleKeys.list({
      filterType,
      date,
      month,
      productType,
      page,
      limit,
    }),
    // <== QUERY FUNCTION ==>
    queryFn: () =>
      fetchQuickSales(filterType, date, month, productType, page, limit),
    // <== ONLY FETCH WHEN AUTHENTICATED ==>
    enabled: isAuthenticated && !isLoggingOut,
    // <== STALE TIME: 1 MINUTE (QUICK SALES CHANGE FREQUENTLY) ==>
    staleTime: 1 * 60 * 1000,
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
        queryKey: quickSaleKeys.list({
          filterType,
          date,
          month,
          productType,
          page: page + 1,
          limit,
        }),
        // <== QUERY FUNCTION ==>
        queryFn: () =>
          // CALL SAME FETCH FUNCTION WITH NEXT PAGE
          fetchQuickSales(
            filterType,
            date,
            month,
            productType,
            page + 1,
            limit,
          ),
        // <== STALE TIME: 1 MINUTE ==>
        staleTime: 1 * 60 * 1000,
      });
    }
  }, [
    query.data,
    filterType,
    date,
    month,
    productType,
    page,
    limit,
    queryClient,
  ]);
  // RETURN QUERY
  return query;
};

/**
 * ADD A NEW QUICK SALE RECORD
 * INVALIDATES ALL QUICK SALE LIST QUERIES ON SUCCESS TO REFRESH RECORDS AND STATS
 */
// <== USE ADD QUICK SALE MUTATION HOOK ==>
export const useAddQuickSale = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<{ quickSale: QuickSale }>,
    AxiosError<ApiErrorResponse>,
    AddQuickSaleFormValues
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (data: AddQuickSaleFormValues) => {
      // CALL ADD QUICK SALE API
      const response = await apiClient.post<
        ApiResponse<{ quickSale: QuickSale }>
      >("/quick-sales", data);
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (data): void => {
      // INVALIDATE ALL QUICK SALE LIST QUERIES
      queryClient.invalidateQueries({ queryKey: quickSaleKeys.lists() });
      // INVALIDATE DASHBOARD QUERIES (CROSS-MODULE SYNC — REVENUE AND QUICK SALES SECTION CHANGE)
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      // INVALIDATE ANALYTICS QUERIES (CROSS-MODULE SYNC — DAILY QUICK SALES CHARTS CHANGE)
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
      // SHOW SUCCESS TOAST
      toast.success(data.message || "Sale recorded successfully!");
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(error.response?.data?.message || "Failed to record sale.");
    },
  });
};

/**
 * UPDATE AN EXISTING QUICK SALE RECORD
 * INVALIDATES ALL QUICK SALE LIST QUERIES ON SUCCESS TO REFRESH RECORDS AND STATS
 */
// <== USE UPDATE QUICK SALE MUTATION HOOK ==>
export const useUpdateQuickSale = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<{ quickSale: QuickSale }>,
    AxiosError<ApiErrorResponse>,
    { id: string; data: AddQuickSaleFormValues }
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: AddQuickSaleFormValues;
    }) => {
      // CALL UPDATE QUICK SALE API
      const response = await apiClient.put<
        ApiResponse<{ quickSale: QuickSale }>
      >(`/quick-sales/${id}`, data);
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (data): void => {
      // INVALIDATE ALL QUICK SALE LIST QUERIES
      queryClient.invalidateQueries({ queryKey: quickSaleKeys.lists() });
      // INVALIDATE DASHBOARD QUERIES (CROSS-MODULE SYNC — REVENUE AND QUICK SALES SECTION CHANGE)
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      // INVALIDATE ANALYTICS QUERIES (CROSS-MODULE SYNC — DAILY QUICK SALES CHARTS CHANGE)
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
      // SHOW SUCCESS TOAST
      toast.success(data.message || "Sale updated successfully!");
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(error.response?.data?.message || "Failed to update sale.");
    },
  });
};

/**
 * DELETE A QUICK SALE RECORD
 * INVALIDATES ALL QUICK SALE LIST QUERIES ON SUCCESS
 */
// <== USE DELETE QUICK SALE MUTATION HOOK ==>
export const useDeleteQuickSale = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<void>,
    AxiosError<ApiErrorResponse>,
    string // QUICK SALE ID
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (id: string) => {
      // CALL DELETE QUICK SALE API
      const response = await apiClient.delete<ApiResponse<void>>(
        `/quick-sales/${id}`,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (data): void => {
      // INVALIDATE ALL QUICK SALE LIST QUERIES
      queryClient.invalidateQueries({ queryKey: quickSaleKeys.lists() });
      // INVALIDATE DASHBOARD QUERIES (CROSS-MODULE SYNC — REVENUE AND QUICK SALES SECTION CHANGE)
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      // INVALIDATE ANALYTICS QUERIES (CROSS-MODULE SYNC — DAILY QUICK SALES CHARTS CHANGE)
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
      // INVALIDATE TRASH QUERIES
      queryClient.invalidateQueries({ queryKey: trashKeys.all });
      // SHOW SUCCESS TOAST
      toast.success(data.message || "Sale deleted successfully!");
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(error.response?.data?.message || "Failed to delete sale.");
    },
  });
};
