// <== IMPORTS ==>
import type {
  MilkLog,
  ApiResponse,
  MilkLogListData,
  ApiErrorResponse,
  MilkLogFilterType,
  MilkLogTypeFilter,
  AddMilkLogFormValues,
  UpdateMilkLogVariables,
} from "../types/milk-log-types";
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
export const milkLogKeys = {
  // <== ROOT KEY FOR ALL MILK LOG QUERIES ==>
  all: ["milkLogs"] as const,
  // <== LIST QUERY NAMESPACE ==>
  lists: () => [...milkLogKeys.all, "list"] as const,
  // <== SPECIFIC LIST WITH ALL ACTIVE FILTERS (EACH COMBINATION CACHED SEPARATELY) ==>
  list: (filters: {
    filterType: MilkLogFilterType;
    date: string;
    month: string;
    rangeStart: string;
    rangeEnd: string;
    entryType: MilkLogTypeFilter;
    page: number;
    limit: number;
  }) => [...milkLogKeys.lists(), filters] as const,
};

/**
 * FETCH MILK LOG ENTRIES WITH FILTERS, PAGINATION, AND PERIOD STATS
 */
// <== FETCH MILK LOGS QUERY FUNCTION ==>
const fetchMilkLogs = async (
  filterType: MilkLogFilterType,
  date: string,
  month: string,
  rangeStart: string,
  rangeEnd: string,
  entryType: MilkLogTypeFilter,
  page: number,
  limit: number,
): Promise<MilkLogListData> => {
  // BUILD REQUEST PARAMS
  const params: Record<string, string> = {
    filterType,
    type: entryType,
    page: String(page),
    limit: String(limit),
  };
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
  // MAKE API REQUEST
  const response = await apiClient.get<ApiResponse<MilkLogListData>>(
    "/milk-logs",
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
        totalLeftover: 0,
        totalYoghurt: 0,
        totalEntries: 0,
        yoghurtSharePercent: 0,
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
 * FETCH AND CACHE MILK LOG ENTRIES WITH PERIOD STATS
 * EACH UNIQUE COMBINATION OF FILTERS + PAGE + LIMIT IS CACHED SEPARATELY
 * NEXT PAGE IS SILENTLY PREFETCHED AFTER CURRENT PAGE LOADS
 */
// <== USE MILK LOGS QUERY HOOK ==>
export const useMilkLogs = (
  filterType: MilkLogFilterType,
  date: string,
  month: string,
  rangeStart: string,
  rangeEnd: string,
  entryType: MilkLogTypeFilter,
  page: number,
  limit: number,
) => {
  // GET AUTH STATE FROM STORE
  const { isAuthenticated, isLoggingOut } = useAuthStore();
  // QUERY CLIENT FOR NEXT-PAGE PREFETCH
  const queryClient = useQueryClient();
  // FETCH CURRENT PAGE
  const query = useQuery<MilkLogListData, AxiosError<ApiErrorResponse>>({
    // <== QUERY KEY ==>
    queryKey: milkLogKeys.list({
      filterType,
      date,
      month,
      rangeStart,
      rangeEnd,
      entryType,
      page,
      limit,
    }),
    // <== QUERY FUNCTION ==>
    queryFn: () =>
      fetchMilkLogs(
        filterType,
        date,
        month,
        rangeStart,
        rangeEnd,
        entryType,
        page,
        limit,
      ),
    // <== ONLY FETCH WHEN AUTHENTICATED AND NOT LOGGING OUT ==>
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
  // SILENTLY PREFETCH NEXT PAGE INTO CACHE AFTER CURRENT PAGE DATA ARRIVES
  useEffect(() => {
    // ONLY PREFETCH IF SERVER SAYS THERE IS A NEXT PAGE
    if (query.data?.pagination?.hasNextPage) {
      // PREFETCH NEXT PAGE
      queryClient.prefetchQuery({
        // NEXT PAGE QUERY KEY
        queryKey: milkLogKeys.list({
          filterType,
          date,
          month,
          rangeStart,
          rangeEnd,
          entryType,
          page: page + 1,
          limit,
        }),
        // NEXT PAGE QUERY FUNCTION
        queryFn: () =>
          fetchMilkLogs(
            filterType,
            date,
            month,
            rangeStart,
            rangeEnd,
            entryType,
            page + 1,
            limit,
          ),
        // SAME STALE TIME AS MAIN QUERY
        staleTime: 2 * 60 * 1000,
      });
    }
  }, [
    query.data,
    filterType,
    date,
    month,
    rangeStart,
    rangeEnd,
    entryType,
    page,
    limit,
    queryClient,
  ]);
  // RETURN QUERY
  return query;
};

/**
 * ADD A NEW MILK LOG ENTRY MUTATION
 * INVALIDATES MILK LOG LISTS AND DASHBOARD QUERIES ON SUCCESS AND TRASH QUERIES ON FAILURE
 */
// <== USE ADD MILK LOG MUTATION HOOK ==>
export const useAddMilkLog = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<{ milkLog: MilkLog }>,
    AxiosError<ApiErrorResponse>,
    AddMilkLogFormValues
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (
      data: AddMilkLogFormValues,
    ): Promise<ApiResponse<{ milkLog: MilkLog }>> => {
      // CALL ADD MILK LOG API
      const response = await apiClient.post<ApiResponse<{ milkLog: MilkLog }>>(
        "/milk-logs",
        data,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (): void => {
      // INVALIDATE ALL LIST QUERIES
      queryClient.invalidateQueries({ queryKey: milkLogKeys.lists() });
      // INVALIDATE DASHBOARD QUERIES (CROSS-MODULE SYNC — SUMMARY AND MILK LOG SECTION BOTH CHANGE)
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      // INVALIDATE ANALYTICS QUERIES (CROSS-MODULE SYNC — MILK LOG TREND CHART CHANGES)
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
      // SHOW SUCCESS TOAST
      toast.success("Milk log entry added successfully!");
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(
        error.response?.data?.message ||
          "Failed to add milk log entry. Please try again.",
      );
    },
  });
};

/**
 * UPDATE AN EXISTING MILK LOG ENTRY MUTATION
 * INVALIDATES MILK LOG LISTS AND DASHBOARD QUERIES ON SUCCESS
 */
// <== USE UPDATE MILK LOG MUTATION HOOK ==>
export const useUpdateMilkLog = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<{ milkLog: MilkLog }>,
    AxiosError<ApiErrorResponse>,
    UpdateMilkLogVariables
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async ({
      id,
      data,
    }: UpdateMilkLogVariables): Promise<ApiResponse<{ milkLog: MilkLog }>> => {
      // CALL UPDATE MILK LOG API
      const response = await apiClient.put<ApiResponse<{ milkLog: MilkLog }>>(
        `/milk-logs/${id}`,
        data,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (): void => {
      // INVALIDATE ALL LIST QUERIES
      queryClient.invalidateQueries({ queryKey: milkLogKeys.lists() });
      // INVALIDATE DASHBOARD QUERIES (CROSS-MODULE SYNC — SUMMARY AND MILK LOG SECTION BOTH CHANGE)
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      // INVALIDATE ANALYTICS QUERIES (CROSS-MODULE SYNC — MILK LOG TREND CHART CHANGES)
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
      // SHOW SUCCESS TOAST
      toast.success("Milk log entry updated successfully!");
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(
        error.response?.data?.message ||
          "Failed to update milk log entry. Please try again.",
      );
    },
  });
};

/**
 * DELETE A MILK LOG ENTRY MUTATION
 * INVALIDATES MILK LOG LISTS, DASHBOARD, AND TRASH QUERIES ON SUCCESS
 */
// <== USE DELETE MILK LOG MUTATION HOOK ==>
export const useDeleteMilkLog = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<ApiResponse<void>, AxiosError<ApiErrorResponse>, string>({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (id: string): Promise<ApiResponse<void>> => {
      // CALL DELETE MILK LOG API
      const response = await apiClient.delete<ApiResponse<void>>(
        `/milk-logs/${id}`,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (data): void => {
      // INVALIDATE ALL LIST QUERIES
      queryClient.invalidateQueries({ queryKey: milkLogKeys.lists() });
      // INVALIDATE DASHBOARD QUERIES (CROSS-MODULE SYNC — SUMMARY AND MILK LOG SECTION BOTH CHANGE)
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      // INVALIDATE ANALYTICS QUERIES (CROSS-MODULE SYNC — MILK LOG TREND CHART CHANGES)
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
      // INVALIDATE TRASH QUERIES (RECORD MAY HAVE BEEN MOVED TO TRASH)
      queryClient.invalidateQueries({ queryKey: trashKeys.all });
      // SHOW SUCCESS TOAST
      toast.success(data.message || "Milk log entry deleted successfully!");
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(
        error.response?.data?.message ||
          "Failed to delete milk log entry. Please try again.",
      );
    },
  });
};
