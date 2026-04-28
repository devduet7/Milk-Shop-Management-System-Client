// <== IMPORTS ==>
import type {
  Sale,
  ApiResponse,
  ApiErrorResponse,
  SaleFilter,
  SalesListData,
  AddCustomerSaleFormValues,
  AddShopSaleFormValues,
  UpdateSaleVariables,
} from "../types/sale-types";
import { toast } from "sonner";
import { useEffect } from "react";
import { AxiosError } from "axios";
import apiClient from "../lib/apiClient";
import { useAuthStore } from "../stores/useAuthStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// <== QUERY KEY FACTORY ==>
export const saleKeys = {
  // <== ROOT KEY FOR ALL SALE QUERIES ==>
  all: ["sales"] as const,
  // <== LIST QUERY NAMESPACE ==>
  lists: () => [...saleKeys.all, "list"] as const,
  // <== CUSTOMER SALE LIST WITH FILTERS ==>
  customerList: (filters: {
    filter: SaleFilter;
    month: string;
    search: string;
    pendingOnly: boolean;
    page: number;
    limit: number;
  }) => [...saleKeys.lists(), "customer", filters] as const,
  // <== SHOP SALE LIST WITH FILTERS ==>
  shopList: (filters: {
    filter: SaleFilter;
    month: string;
    productType: string;
    page: number;
    limit: number;
  }) => [...saleKeys.lists(), "shop", filters] as const,
};

/**
 * FETCH CUSTOMER SALES WITH FILTERS, PAGINATION, AND COMBINED PERIOD STATS
 * @param filter - PERIOD FILTER TYPE (TODAY | WEEK | MONTH)
 * @param month - BILLING MONTH STRING (YYYY-MM) — ONLY WHEN FILTER IS MONTH
 * @param search - OPTIONAL CUSTOMER NAME SEARCH QUERY
 * @param pendingOnly - IF TRUE ONLY RETURN SALES WITH PENDING AMOUNT > 0
 * @param page - CURRENT PAGE NUMBER (1-BASED)
 * @param limit - ITEMS PER PAGE
 * @returns CUSTOMER SALES LIST DATA WITH PAGINATION AND COMBINED STATS
 */
// <== FETCH CUSTOMER SALES QUERY FUNCTION ==>
const fetchCustomerSales = async (
  filter: SaleFilter,
  month: string,
  search: string,
  pendingOnly: boolean,
  page: number,
  limit: number,
): Promise<SalesListData> => {
  // BUILD REQUEST PARAMS
  const params: Record<string, string> = {
    saleType: "customer",
    filter,
    page: String(page),
    limit: String(limit),
  };
  // ONLY INCLUDE MONTH WHEN FILTER IS MONTH
  if (filter === "month" && month) params.month = month;
  // ONLY INCLUDE SEARCH IF NOT EMPTY
  if (search.trim()) params.search = search.trim();
  // INCLUDE PENDING ONLY FLAG IF TRUE
  if (pendingOnly) params.pendingOnly = "true";
  // MAKE API REQUEST
  const response = await apiClient.get<ApiResponse<SalesListData>>("/sales", {
    params,
  });
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
        totalMilkSold: 0,
        totalYoghurtSold: 0,
        totalPending: 0,
        totalSales: 0,
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
 * FETCH SHOP SALES WITH FILTERS, PAGINATION, AND COMBINED PERIOD STATS
 * @param filter - PERIOD FILTER TYPE (TODAY | WEEK | MONTH)
 * @param month - BILLING MONTH STRING (YYYY-MM) — ONLY WHEN FILTER IS MONTH
 * @param productType - OPTIONAL PRODUCT TYPE FILTER (MILK | YOGHURT | "")
 * @param page - CURRENT PAGE NUMBER (1-BASED)
 * @param limit - ITEMS PER PAGE
 * @returns SHOP SALES LIST DATA WITH PAGINATION AND COMBINED STATS
 */
// <== FETCH SHOP SALES QUERY FUNCTION ==>
const fetchShopSales = async (
  filter: SaleFilter,
  month: string,
  productType: string,
  page: number,
  limit: number,
): Promise<SalesListData> => {
  // BUILD REQUEST PARAMS
  const params: Record<string, string> = {
    saleType: "shop",
    filter,
    page: String(page),
    limit: String(limit),
  };
  // ONLY INCLUDE MONTH WHEN FILTER IS MONTH
  if (filter === "month" && month) params.month = month;
  // ONLY INCLUDE PRODUCT TYPE IF NOT EMPTY
  if (productType) params.productType = productType;
  // MAKE API REQUEST
  const response = await apiClient.get<ApiResponse<SalesListData>>("/sales", {
    params,
  });
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
        totalMilkSold: 0,
        totalYoghurtSold: 0,
        totalPending: 0,
        totalSales: 0,
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
 * FETCH AND CACHE CUSTOMER SALES WITH COMBINED PERIOD STATS
 * NEXT PAGE IS SILENTLY PREFETCHED AFTER CURRENT PAGE LOADS
 * @param filter - PERIOD FILTER TYPE
 * @param month - BILLING MONTH (YYYY-MM) — ONLY WHEN FILTER IS MONTH
 * @param search - DEBOUNCED CUSTOMER NAME SEARCH QUERY
 * @param pendingOnly - FILTER FOR SALES WITH OUTSTANDING BALANCE
 * @param page - CURRENT PAGE NUMBER (1-BASED)
 * @param limit - ITEMS PER PAGE
 */
// <== USE CUSTOMER SALES QUERY HOOK ==>
export const useCustomerSales = (
  filter: SaleFilter,
  month: string,
  search: string,
  pendingOnly: boolean,
  page: number,
  limit: number,
) => {
  // GET AUTH STATE FROM STORE
  const { isAuthenticated, isLoggingOut } = useAuthStore();
  // QUERY CLIENT FOR NEXT-PAGE PREFETCH
  const queryClient = useQueryClient();
  // FETCH CURRENT PAGE
  const query = useQuery<SalesListData, AxiosError<ApiErrorResponse>>({
    // <== QUERY KEY (ALL FILTERS + PAGE + LIMIT FOR ISOLATED CACHE ENTRIES) ==>
    queryKey: saleKeys.customerList({
      filter,
      month,
      search,
      pendingOnly,
      page,
      limit,
    }),
    // <== QUERY FUNCTION ==>
    queryFn: () =>
      fetchCustomerSales(filter, month, search, pendingOnly, page, limit),
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
        queryKey: saleKeys.customerList({
          filter,
          month,
          search,
          pendingOnly,
          page: page + 1,
          limit,
        }),
        // NEXT PAGE QUERY FUNCTION
        queryFn: () =>
          fetchCustomerSales(
            filter,
            month,
            search,
            pendingOnly,
            page + 1,
            limit,
          ),
        // SAME STALE TIME AS MAIN QUERY
        staleTime: 2 * 60 * 1000,
      });
    }
  }, [
    query.data,
    filter,
    month,
    search,
    pendingOnly,
    page,
    limit,
    queryClient,
  ]);
  // RETURN QUERY
  return query;
};

/**
 * FETCH AND CACHE SHOP SALES WITH COMBINED PERIOD STATS
 * NEXT PAGE IS SILENTLY PREFETCHED AFTER CURRENT PAGE LOADS
 * @param filter - PERIOD FILTER TYPE
 * @param month - BILLING MONTH (YYYY-MM) — ONLY WHEN FILTER IS MONTH
 * @param productType - OPTIONAL PRODUCT TYPE FILTER
 * @param page - CURRENT PAGE NUMBER (1-BASED)
 * @param limit - ITEMS PER PAGE
 */
// <== USE SHOP SALES QUERY HOOK ==>
export const useShopSales = (
  filter: SaleFilter,
  month: string,
  productType: string,
  page: number,
  limit: number,
) => {
  // GET AUTH STATE FROM STORE
  const { isAuthenticated, isLoggingOut } = useAuthStore();
  // QUERY CLIENT FOR NEXT-PAGE PREFETCH
  const queryClient = useQueryClient();
  // FETCH CURRENT PAGE
  const query = useQuery<SalesListData, AxiosError<ApiErrorResponse>>({
    // <== QUERY KEY (ALL FILTERS + PAGE + LIMIT FOR ISOLATED CACHE ENTRIES) ==>
    queryKey: saleKeys.shopList({ filter, month, productType, page, limit }),
    // <== QUERY FUNCTION ==>
    queryFn: () => fetchShopSales(filter, month, productType, page, limit),
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
        queryKey: saleKeys.shopList({
          filter,
          month,
          productType,
          page: page + 1,
          limit,
        }),
        // NEXT PAGE QUERY FUNCTION
        queryFn: () =>
          fetchShopSales(filter, month, productType, page + 1, limit),
        // SAME STALE TIME AS MAIN QUERY
        staleTime: 2 * 60 * 1000,
      });
    }
  }, [query.data, filter, month, productType, page, limit, queryClient]);
  // RETURN QUERY
  return query;
};

/**
 * ADD A NEW CUSTOMER SALE MUTATION
 */
// <== USE ADD CUSTOMER SALE MUTATION HOOK ==>
export const useAddCustomerSale = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<{ sale: Sale }>,
    AxiosError<ApiErrorResponse>,
    AddCustomerSaleFormValues
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (
      data: AddCustomerSaleFormValues,
    ): Promise<ApiResponse<{ sale: Sale }>> => {
      // CALL ADD SALE API WITH CUSTOMER SALE TYPE
      const response = await apiClient.post<ApiResponse<{ sale: Sale }>>(
        "/sales",
        { ...data, saleType: "customer" },
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (): void => {
      // INVALIDATE ALL SALE LIST QUERIES TO TRIGGER REFETCH
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      // SHOW SUCCESS TOAST
      toast.success("Customer sale added successfully!");
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(
        error.response?.data?.message ||
          "Failed to add customer sale. Please try again.",
      );
    },
  });
};

/**
 * ADD A NEW SHOP SALE MUTATION
 */
// <== USE ADD SHOP SALE MUTATION HOOK ==>
export const useAddShopSale = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<{ sale: Sale }>,
    AxiosError<ApiErrorResponse>,
    AddShopSaleFormValues
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (
      data: AddShopSaleFormValues,
    ): Promise<ApiResponse<{ sale: Sale }>> => {
      // CALL ADD SALE API WITH SHOP SALE TYPE
      const response = await apiClient.post<ApiResponse<{ sale: Sale }>>(
        "/sales",
        { ...data, saleType: "shop" },
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (): void => {
      // INVALIDATE ALL SALE LIST QUERIES TO TRIGGER REFETCH
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      // SHOW SUCCESS TOAST
      toast.success("Shop sale added successfully!");
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(
        error.response?.data?.message ||
          "Failed to add shop sale. Please try again.",
      );
    },
  });
};

/**
 * UPDATE AN EXISTING SALE MUTATION (SHARED FOR BOTH SALE TYPES)
 */
// <== USE UPDATE SALE MUTATION HOOK ==>
export const useUpdateSale = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<{ sale: Sale }>,
    AxiosError<ApiErrorResponse>,
    UpdateSaleVariables
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async ({
      id,
      data,
    }: UpdateSaleVariables): Promise<ApiResponse<{ sale: Sale }>> => {
      // CALL UPDATE SALE API
      const response = await apiClient.put<ApiResponse<{ sale: Sale }>>(
        `/sales/${id}`,
        data,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (): void => {
      // INVALIDATE ALL SALE LIST QUERIES
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      // SHOW SUCCESS TOAST
      toast.success("Sale updated successfully!");
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(
        error.response?.data?.message ||
          "Failed to update sale. Please try again.",
      );
    },
  });
};

/**
 * DELETE A SALE MUTATION (SHARED FOR BOTH SALE TYPES)
 */
// <== USE DELETE SALE MUTATION HOOK ==>
export const useDeleteSale = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<ApiResponse<void>, AxiosError<ApiErrorResponse>, string>({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (id: string): Promise<ApiResponse<void>> => {
      // CALL DELETE SALE API
      const response = await apiClient.delete<ApiResponse<void>>(
        `/sales/${id}`,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (): void => {
      // INVALIDATE ALL SALE LIST QUERIES
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      // SHOW SUCCESS TOAST
      toast.success("Sale deleted successfully!");
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(
        error.response?.data?.message ||
          "Failed to delete sale. Please try again.",
      );
    },
  });
};
