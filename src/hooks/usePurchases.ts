// <== IMPORTS ==>
import type {
  Purchase,
  ApiResponse,
  ApiErrorResponse,
  PurchaseFilter,
  PurchasesListData,
  AddPurchaseFormValues,
  UpdatePurchaseVariables,
} from "../types/purchase-types";
import { toast } from "sonner";
import { useEffect } from "react";
import { AxiosError } from "axios";
import apiClient from "../lib/apiClient";
import { useAuthStore } from "../stores/useAuthStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// <== QUERY KEY FACTORY ==>
export const purchaseKeys = {
  // <== ROOT KEY FOR ALL PURCHASE QUERIES ==>
  all: ["purchases"] as const,
  // <== LIST QUERY NAMESPACE ==>
  lists: () => [...purchaseKeys.all, "list"] as const,
  // <== SPECIFIC LIST WITH ALL ACTIVE FILTERS (EACH COMBINATION CACHED SEPARATELY) ==>
  list: (filters: {
    filter: PurchaseFilter;
    month: string;
    search: string;
    page: number;
    limit: number;
  }) => [...purchaseKeys.lists(), filters] as const,
};

/**
 * FETCH PURCHASES WITH FILTERS, PAGINATION, AND PERIOD STATS
 * @param filter - PERIOD FILTER TYPE (TODAY | WEEK | MONTH)
 * @param month - BILLING MONTH STRING (YYYY-MM) — ONLY USED WHEN FILTER IS MONTH
 * @param search - OPTIONAL SUPPLIER SEARCH QUERY STRING
 * @param page - CURRENT PAGE NUMBER (1-BASED)
 * @param limit - ITEMS PER PAGE
 * @returns PURCHASES LIST DATA WITH PAGINATION AND STATS
 */
// <== FETCH PURCHASES QUERY FUNCTION ==>
const fetchPurchases = async (
  filter: PurchaseFilter,
  month: string,
  search: string,
  page: number,
  limit: number,
): Promise<PurchasesListData> => {
  // BUILD REQUEST PARAMS
  const params: Record<string, string> = {
    filter,
    page: String(page),
    limit: String(limit),
  };
  // ONLY INCLUDE MONTH WHEN FILTER IS MONTH
  if (filter === "month" && month) params.month = month;
  // ONLY INCLUDE SEARCH IF NOT EMPTY
  if (search.trim()) params.search = search.trim();
  // MAKE API REQUEST
  const response = await apiClient.get<ApiResponse<PurchasesListData>>(
    "/purchases",
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
        totalSpent: 0,
        totalMilk: 0,
        totalPurchases: 0,
        avgCostPerLiter: 0,
        supplierBreakdown: {},
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
 * FETCH AND CACHE PURCHASES WITH PERIOD STATS
 * EACH UNIQUE COMBINATION OF FILTERS + PAGE + LIMIT IS CACHED SEPARATELY
 * NEXT PAGE IS SILENTLY PREFETCHED AFTER CURRENT PAGE LOADS
 * @param filter - PERIOD FILTER TYPE
 * @param month - BILLING MONTH (YYYY-MM) — ONLY WHEN FILTER IS MONTH
 * @param search - DEBOUNCED SUPPLIER SEARCH QUERY
 * @param page - CURRENT PAGE NUMBER (1-BASED)
 * @param limit - ITEMS PER PAGE
 */
// <== USE PURCHASES QUERY HOOK ==>
export const usePurchases = (
  filter: PurchaseFilter,
  month: string,
  search: string,
  page: number,
  limit: number,
) => {
  // GET AUTH STATE FROM STORE
  const { isAuthenticated, isLoggingOut } = useAuthStore();
  // QUERY CLIENT FOR NEXT-PAGE PREFETCH
  const queryClient = useQueryClient();
  // FETCH CURRENT PAGE
  const query = useQuery<PurchasesListData, AxiosError<ApiErrorResponse>>({
    // <== QUERY KEY (ALL FILTERS + PAGE + LIMIT FOR ISOLATED CACHE ENTRIES) ==>
    queryKey: purchaseKeys.list({ filter, month, search, page, limit }),
    // <== QUERY FUNCTION ==>
    queryFn: () => fetchPurchases(filter, month, search, page, limit),
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
        queryKey: purchaseKeys.list({
          filter,
          month,
          search,
          page: page + 1,
          limit,
        }),
        // NEXT PAGE QUERY FUNCTION
        queryFn: () => fetchPurchases(filter, month, search, page + 1, limit),
        // SAME STALE TIME AS MAIN QUERY
        staleTime: 2 * 60 * 1000,
      });
    }
  }, [query.data, filter, month, search, page, limit, queryClient]);
  // RETURN QUERY
  return query;
};

/**
 * ADD A NEW PURCHASE RECORD MUTATION
 */
// <== USE ADD PURCHASE MUTATION HOOK ==>
export const useAddPurchase = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<{ purchase: Purchase }>,
    AxiosError<ApiErrorResponse>,
    AddPurchaseFormValues
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (
      data: AddPurchaseFormValues,
    ): Promise<ApiResponse<{ purchase: Purchase }>> => {
      // CALL ADD PURCHASE API
      const response = await apiClient.post<
        ApiResponse<{ purchase: Purchase }>
      >("/purchases", data);
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (): void => {
      // INVALIDATE ALL LIST QUERIES TO TRIGGER REFETCH
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });
      // SHOW SUCCESS TOAST
      toast.success("Purchase added successfully!");
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(
        error.response?.data?.message ||
          "Failed to add purchase. Please try again.",
      );
    },
  });
};

/**
 * UPDATE AN EXISTING PURCHASE RECORD MUTATION
 */
// <== USE UPDATE PURCHASE MUTATION HOOK ==>
export const useUpdatePurchase = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<{ purchase: Purchase }>,
    AxiosError<ApiErrorResponse>,
    UpdatePurchaseVariables
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async ({
      id,
      data,
    }: UpdatePurchaseVariables): Promise<
      ApiResponse<{ purchase: Purchase }>
    > => {
      // CALL UPDATE PURCHASE API
      const response = await apiClient.put<ApiResponse<{ purchase: Purchase }>>(
        `/purchases/${id}`,
        data,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (): void => {
      // INVALIDATE ALL LIST QUERIES
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });
      // SHOW SUCCESS TOAST
      toast.success("Purchase updated successfully!");
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(
        error.response?.data?.message ||
          "Failed to update purchase. Please try again.",
      );
    },
  });
};

/**
 * DELETE A PURCHASE RECORD MUTATION
 */
// <== USE DELETE PURCHASE MUTATION HOOK ==>
export const useDeletePurchase = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<void>,
    AxiosError<ApiErrorResponse>,
    string // PURCHASE ID
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (id: string): Promise<ApiResponse<void>> => {
      // CALL DELETE PURCHASE API
      const response = await apiClient.delete<ApiResponse<void>>(
        `/purchases/${id}`,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (): void => {
      // INVALIDATE ALL LIST QUERIES
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });
      // SHOW SUCCESS TOAST
      toast.success("Purchase deleted successfully!");
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(
        error.response?.data?.message ||
          "Failed to delete purchase. Please try again.",
      );
    },
  });
};
