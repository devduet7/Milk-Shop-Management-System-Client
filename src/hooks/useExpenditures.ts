// <== IMPORTS ==>
import type {
  Expenditure,
  ApiResponse,
  ApiErrorResponse,
  ExpenditureFilter,
  ExpendituresListData,
  AddExpenditureFormValues,
  UpdateExpenditureVariables,
} from "../types/expenditure-types";
import { toast } from "sonner";
import { useEffect } from "react";
import { AxiosError } from "axios";
import apiClient from "../lib/apiClient";
import { useAuthStore } from "../stores/useAuthStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// <== QUERY KEY FACTORY ==>
export const expenditureKeys = {
  // <== ROOT KEY FOR ALL EXPENDITURE QUERIES ==>
  all: ["expenditures"] as const,
  // <== LIST QUERY NAMESPACE ==>
  lists: () => [...expenditureKeys.all, "list"] as const,
  // <== SPECIFIC LIST WITH ALL ACTIVE FILTERS (EACH COMBINATION CACHED SEPARATELY) ==>
  list: (filters: {
    filter: ExpenditureFilter;
    month: string;
    category: string;
    search: string;
    page: number;
    limit: number;
  }) => [...expenditureKeys.lists(), filters] as const,
};

/**
 * FETCH EXPENDITURES WITH FILTERS, PAGINATION, AND PERIOD STATS
 * @param filter - PERIOD FILTER TYPE (TODAY | WEEK | MONTH)
 * @param month - BILLING MONTH STRING (YYYY-MM) — ONLY USED WHEN FILTER IS MONTH
 * @param category - OPTIONAL CATEGORY FILTER STRING
 * @param search - OPTIONAL SEARCH QUERY STRING
 * @param page - CURRENT PAGE NUMBER (1-BASED)
 * @param limit - ITEMS PER PAGE
 * @returns EXPENDITURES LIST DATA WITH PAGINATION AND STATS
 */
// <== FETCH EXPENDITURES QUERY FUNCTION ==>
const fetchExpenditures = async (
  filter: ExpenditureFilter,
  month: string,
  category: string,
  search: string,
  page: number,
  limit: number,
): Promise<ExpendituresListData> => {
  // BUILD REQUEST PARAMS
  const params: Record<string, string> = {
    filter,
    page: String(page),
    limit: String(limit),
  };
  // ONLY INCLUDE MONTH WHEN FILTER IS MONTH
  if (filter === "month" && month) params.month = month;
  // ONLY INCLUDE CATEGORY IF NOT EMPTY
  if (category) params.category = category;
  // ONLY INCLUDE SEARCH IF NOT EMPTY
  if (search.trim()) params.search = search.trim();
  // MAKE API REQUEST
  const response = await apiClient.get<ApiResponse<ExpendituresListData>>(
    "/expenditures",
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
        totalAmount: 0,
        totalCount: 0,
        avgAmount: 0,
        highestAmount: 0,
        categoryBreakdown: {},
      },
      appliedFilter: {
        type: filter,
        month: filter === "month" ? month : null,
        startDate: "",
        endDate: "",
      },
    }
  );
};

/**
 * FETCH AND CACHE EXPENDITURES WITH PERIOD STATS
 * EACH UNIQUE COMBINATION OF FILTERS + PAGE + LIMIT IS CACHED SEPARATELY
 * NEXT PAGE IS SILENTLY PREFETCHED AFTER CURRENT PAGE LOADS
 * @param filter - PERIOD FILTER TYPE
 * @param month - BILLING MONTH (YYYY-MM) — ONLY WHEN FILTER IS MONTH
 * @param category - OPTIONAL CATEGORY FILTER
 * @param search - DEBOUNCED SEARCH QUERY
 * @param page - CURRENT PAGE NUMBER (1-BASED)
 * @param limit - ITEMS PER PAGE
 */
// <== USE EXPENDITURES QUERY HOOK ==>
export const useExpenditures = (
  filter: ExpenditureFilter,
  month: string,
  category: string,
  search: string,
  page: number,
  limit: number,
) => {
  // GET AUTH STATE FROM STORE
  const { isAuthenticated, isLoggingOut } = useAuthStore();
  // QUERY CLIENT FOR NEXT-PAGE PREFETCH
  const queryClient = useQueryClient();
  // FETCH CURRENT PAGE
  const query = useQuery<ExpendituresListData, AxiosError<ApiErrorResponse>>({
    // <== QUERY KEY (ALL FILTERS + PAGE + LIMIT FOR ISOLATED CACHE ENTRIES) ==>
    queryKey: expenditureKeys.list({
      filter,
      month,
      category,
      search,
      page,
      limit,
    }),
    // <== QUERY FUNCTION ==>
    queryFn: () =>
      fetchExpenditures(filter, month, category, search, page, limit),
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
      // PREFETCH NEXT PAGE — STORES IN CACHE SO PAGE TURN IS INSTANT
      queryClient.prefetchQuery({
        // NEXT PAGE QUERY KEY
        queryKey: expenditureKeys.list({
          filter,
          month,
          category,
          search,
          page: page + 1,
          limit,
        }),
        // NEXT PAGE QUERY FUNCTION
        queryFn: () =>
          fetchExpenditures(filter, month, category, search, page + 1, limit),
        // SAME STALE TIME AS MAIN QUERY
        staleTime: 2 * 60 * 1000,
      });
    }
  }, [query.data, filter, month, category, search, page, limit, queryClient]);
  // RETURN QUERY
  return query;
};

/**
 * ADD A NEW EXPENDITURE RECORD MUTATION
 */
// <== USE ADD EXPENDITURE MUTATION HOOK ==>
export const useAddExpenditure = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<{ expenditure: Expenditure }>,
    AxiosError<ApiErrorResponse>,
    AddExpenditureFormValues
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (
      data: AddExpenditureFormValues,
    ): Promise<ApiResponse<{ expenditure: Expenditure }>> => {
      // CALL ADD EXPENDITURE API
      const response = await apiClient.post<
        ApiResponse<{ expenditure: Expenditure }>
      >("/expenditures", data);
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (): void => {
      // INVALIDATE ALL LIST QUERIES TO TRIGGER REFETCH
      queryClient.invalidateQueries({ queryKey: expenditureKeys.lists() });
      // SHOW SUCCESS TOAST
      toast.success("Expenditure added successfully!");
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(
        error.response?.data?.message ||
          "Failed to add expenditure. Please try again.",
      );
    },
  });
};

/**
 * UPDATE AN EXISTING EXPENDITURE RECORD MUTATION
 */
// <== USE UPDATE EXPENDITURE MUTATION HOOK ==>
export const useUpdateExpenditure = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<{ expenditure: Expenditure }>,
    AxiosError<ApiErrorResponse>,
    UpdateExpenditureVariables
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async ({
      id,
      data,
    }: UpdateExpenditureVariables): Promise<
      ApiResponse<{ expenditure: Expenditure }>
    > => {
      // CALL UPDATE EXPENDITURE API
      const response = await apiClient.put<
        ApiResponse<{ expenditure: Expenditure }>
      >(`/expenditures/${id}`, data);
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (): void => {
      // INVALIDATE ALL LIST QUERIES
      queryClient.invalidateQueries({ queryKey: expenditureKeys.lists() });
      // SHOW SUCCESS TOAST
      toast.success("Expenditure updated successfully!");
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(
        error.response?.data?.message ||
          "Failed to update expenditure. Please try again.",
      );
    },
  });
};

/**
 * DELETE AN EXPENDITURE RECORD MUTATION
 */
// <== USE DELETE EXPENDITURE MUTATION HOOK ==>
export const useDeleteExpenditure = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<void>,
    AxiosError<ApiErrorResponse>,
    string // EXPENDITURE ID
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (id: string): Promise<ApiResponse<void>> => {
      // CALL DELETE EXPENDITURE API
      const response = await apiClient.delete<ApiResponse<void>>(
        `/expenditures/${id}`,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (): void => {
      // INVALIDATE ALL LIST QUERIES
      queryClient.invalidateQueries({ queryKey: expenditureKeys.lists() });
      // SHOW SUCCESS TOAST
      toast.success("Expenditure deleted successfully!");
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(
        error.response?.data?.message ||
          "Failed to delete expenditure. Please try again.",
      );
    },
  });
};
