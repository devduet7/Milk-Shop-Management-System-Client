// <== IMPORTS ==>
import type {
  ApiResponse,
  MonthlyStats,
  CustomerDetail,
  DeliveryRecord,
  ApiErrorResponse,
  CustomersListData,
  CustomerDetailData,
  AddPaymentVariables,
  MarkDeliveryVariables,
  AddCustomerFormValues,
  UpdateCustomerVariables,
} from "../types/customer-types";
import { toast } from "sonner";
import { useEffect } from "react";
import { AxiosError } from "axios";
import apiClient from "../lib/apiClient";
import { useAuthStore } from "../stores/useAuthStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// <== QUERY KEY FACTORY ==>
export const customerKeys = {
  // <== ROOT KEY FOR ALL CUSTOMER QUERIES ==>
  all: ["customers"] as const,
  // <== LIST QUERY NAMESPACE ==>
  lists: () => [...customerKeys.all, "list"] as const,
  // <== SPECIFIC LIST WITH FILTERS (INCLUDES PAGE AND LIMIT FOR PER-PAGE CACHE) ==>
  list: (filters: {
    month: string;
    search: string;
    page: number;
    limit: number;
  }) => [...customerKeys.lists(), filters] as const,
  // <== DETAIL QUERY NAMESPACE ==>
  details: () => [...customerKeys.all, "detail"] as const,
  // <== SPECIFIC CUSTOMER DETAIL ==>
  detail: (id: string, month: string) =>
    [...customerKeys.details(), id, month] as const,
};

/**
 * FETCH ALL CUSTOMERS WITH MONTHLY STATS AND SUMMARY
 * @param month - BILLING MONTH STRING (YYYY-MM)
 * @param search - OPTIONAL SEARCH QUERY
 * @param page - PAGE NUMBER (1-BASED)
 * @param limit - ITEMS PER PAGE
 * @returns CUSTOMERS LIST DATA WITH PAGINATION META
 */
// <== FETCH CUSTOMERS QUERY FUNCTION ==>
const fetchCustomers = async (
  month: string,
  search: string,
  page: number,
  limit: number,
): Promise<CustomersListData> => {
  // BUILD REQUEST PARAMS
  const params: Record<string, string> = {
    month,
    page: String(page),
    limit: String(limit),
  };
  // ONLY INCLUDE SEARCH IF NOT EMPTY
  if (search.trim()) params.search = search.trim();
  // MAKE API REQUEST
  const response = await apiClient.get<ApiResponse<CustomersListData>>(
    "/customers",
    { params },
  );
  // RETURN DATA OR SAFE FALLBACK
  return (
    response.data?.data ?? {
      customers: [],
      summary: {
        month,
        totalCustomers: 0,
        monthlyDue: 0,
        monthlyReceived: 0,
        monthlyPending: 0,
        totalOutstanding: 0,
      },
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    }
  );
};

/**
 * FETCH SINGLE CUSTOMER DETAIL WITH DELIVERY RECORDS AND MONTHLY BREAKDOWN
 * @param customerId - CUSTOMER MONGODB ID
 * @param month - BILLING MONTH STRING (YYYY-MM)
 * @returns CUSTOMER DETAIL DATA
 */
// <== FETCH CUSTOMER DETAIL QUERY FUNCTION ==>
const fetchCustomerDetail = async (
  customerId: string,
  month: string,
): Promise<CustomerDetailData> => {
  // MAKE API REQUEST WITH MONTH PARAM
  const response = await apiClient.get<ApiResponse<CustomerDetailData>>(
    `/customers/${customerId}`,
    { params: { month } },
  );
  // RETURN DATA
  return response.data.data;
};

/**
 * FETCH AND CACHE ALL CUSTOMERS WITH MONTHLY STATS
 * EACH UNIQUE COMBINATION OF MONTH + SEARCH + PAGE + LIMIT IS CACHED SEPARATELY
 * NEXT PAGE IS SILENTLY PREFETCHED AFTER CURRENT PAGE LOADS
 * @param month - BILLING MONTH STRING (YYYY-MM)
 * @param search - SEARCH QUERY STRING
 * @param page - CURRENT PAGE NUMBER (1-BASED)
 * @param limit - ITEMS PER PAGE
 */
// <== USE CUSTOMERS QUERY HOOK ==>
export const useCustomers = (
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
  const query = useQuery<CustomersListData, AxiosError<ApiErrorResponse>>({
    // <== QUERY KEY (INCLUDES ALL FILTERS + PAGE + LIMIT FOR ISOLATED CACHE ENTRIES) ==>
    queryKey: customerKeys.list({ month, search, page, limit }),
    // <== QUERY FUNCTION ==>
    queryFn: () => fetchCustomers(month, search, page, limit),
    // <== ONLY FETCH WHEN AUTHENTICATED AND NOT LOGGING OUT ==>
    enabled: isAuthenticated && !isLoggingOut,
    // <== STALE TIME: 2 MINUTES (DELIVERY DATA CHANGES FREQUENTLY) ==>
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
        queryKey: customerKeys.list({ month, search, page: page + 1, limit }),
        // NEXT PAGE QUERY FUNCTION
        queryFn: () => fetchCustomers(month, search, page + 1, limit),
        // SAME STALE TIME AS MAIN QUERY
        staleTime: 2 * 60 * 1000,
      });
    }
  }, [query.data, month, search, page, limit, queryClient]);
  // RETURN QUERY
  return query;
};

/**
 * FETCH AND CACHE SINGLE CUSTOMER DETAIL WITH DELIVERY CALENDAR
 * @param customerId - CUSTOMER ID (EMPTY STRING = DISABLED)
 * @param month - BILLING MONTH STRING (YYYY-MM)
 */
// <== USE CUSTOMER DETAIL QUERY HOOK ==>
export const useCustomerDetail = (customerId: string, month: string) => {
  // GET AUTH STATE FROM STORE
  const { isAuthenticated, isLoggingOut } = useAuthStore();
  // RETURN QUERY
  return useQuery<CustomerDetailData, AxiosError<ApiErrorResponse>>({
    // <== QUERY KEY ==>
    queryKey: customerKeys.detail(customerId, month),
    // <== QUERY FUNCTION ==>
    queryFn: () => fetchCustomerDetail(customerId, month),
    // <== DISABLE WHEN NO CUSTOMER ID OR NOT AUTHENTICATED ==>
    enabled: isAuthenticated && !isLoggingOut && !!customerId,
    // <== STALE TIME: 1 MINUTE (CALENDAR NEEDS FRESH DATA) ==>
    staleTime: 1 * 60 * 1000,
    // <== GC TIME: 5 MINUTES ==>
    gcTime: 5 * 60 * 1000,
    // <== REFETCH ON MOUNT ==>
    refetchOnMount: true,
    // <== NO REFETCH ON WINDOW FOCUS ==>
    refetchOnWindowFocus: false,
    // <== REFETCH ON RECONNECT ==>
    refetchOnReconnect: true,
  });
};

/**
 * ADD A NEW CUSTOMER MUTATION
 */
// <== USE ADD CUSTOMER MUTATION HOOK ==>
export const useAddCustomer = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<{ customer: CustomerDetail }>,
    AxiosError<ApiErrorResponse>,
    AddCustomerFormValues
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (
      data: AddCustomerFormValues,
    ): Promise<ApiResponse<{ customer: CustomerDetail }>> => {
      // CALL ADD CUSTOMER API
      const response = await apiClient.post<
        ApiResponse<{ customer: CustomerDetail }>
      >("/customers", data);
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (): void => {
      // INVALIDATE CUSTOMERS LIST TO TRIGGER REFETCH
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      // SHOW SUCCESS TOAST
      toast.success("Customer added successfully!");
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(
        error.response?.data?.message ||
          "Failed to add customer. Please try again.",
      );
    },
  });
};

/**
 * UPDATE AN EXISTING CUSTOMER MUTATION
 */
// <== USE UPDATE CUSTOMER MUTATION HOOK ==>
export const useUpdateCustomer = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<{ customer: CustomerDetail }>,
    AxiosError<ApiErrorResponse>,
    UpdateCustomerVariables
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async ({
      id,
      data,
    }: UpdateCustomerVariables): Promise<
      ApiResponse<{ customer: CustomerDetail }>
    > => {
      // CALL UPDATE CUSTOMER API
      const response = await apiClient.put<
        ApiResponse<{ customer: CustomerDetail }>
      >(`/customers/${id}`, data);
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (): void => {
      // INVALIDATE LIST QUERIES
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      // INVALIDATE ALL DETAIL QUERIES FOR CONSISTENCY
      queryClient.invalidateQueries({ queryKey: customerKeys.details() });
      // SHOW SUCCESS TOAST
      toast.success("Customer updated successfully!");
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(
        error.response?.data?.message ||
          "Failed to update customer. Please try again.",
      );
    },
  });
};

/**
 * DELETE A CUSTOMER MUTATION
 * NOTE: BLOCKED BY SERVER IF OUTSTANDING BALANCE EXISTS
 */
// <== USE DELETE CUSTOMER MUTATION HOOK ==>
export const useDeleteCustomer = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<void>,
    AxiosError<ApiErrorResponse>,
    string // CUSTOMER ID
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (id: string): Promise<ApiResponse<void>> => {
      // CALL DELETE CUSTOMER API
      const response = await apiClient.delete<ApiResponse<void>>(
        `/customers/${id}`,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (): void => {
      // INVALIDATE LIST QUERIES
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      // SHOW SUCCESS TOAST
      toast.success("Customer deleted successfully!");
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW SERVER MESSAGE (MAY INCLUDE OUTSTANDING BALANCE DETAILS)
      toast.error(
        error.response?.data?.message ||
          "Failed to delete customer. Please try again.",
      );
    },
  });
};

/**
 * MARK OR UPDATE A DELIVERY DAY MUTATION
 */
// <== USE MARK DELIVERY MUTATION HOOK ==>
export const useMarkDelivery = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<{ deliveryRecord: DeliveryRecord; monthlyStats: MonthlyStats }>,
    AxiosError<ApiErrorResponse>,
    MarkDeliveryVariables
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async ({
      customerId,
      date,
      status,
    }: MarkDeliveryVariables): Promise<
      ApiResponse<{
        deliveryRecord: DeliveryRecord;
        monthlyStats: MonthlyStats;
      }>
    > => {
      // CALL MARK DELIVERY API
      const response = await apiClient.patch<
        ApiResponse<{
          deliveryRecord: DeliveryRecord;
          monthlyStats: MonthlyStats;
        }>
      >(`/customers/${customerId}/delivery`, { date, status });
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (): void => {
      // INVALIDATE ALL DETAIL QUERIES (CALENDAR + STATS UPDATE)
      queryClient.invalidateQueries({ queryKey: customerKeys.details() });
      // INVALIDATE LIST QUERIES (SUMMARY STATS UPDATE)
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(
        error.response?.data?.message || "Failed to update delivery status.",
      );
    },
  });
};

/**
 * ADD A PAYMENT FOR A CUSTOMER'S BILLING MONTH MUTATION
 */
// <== USE ADD PAYMENT MUTATION HOOK ==>
export const useAddPayment = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<{ payment: unknown; monthlyStats: MonthlyStats }>,
    AxiosError<ApiErrorResponse>,
    AddPaymentVariables
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async ({
      customerId,
      amount,
      billingMonth,
      paymentDate,
      note,
    }: AddPaymentVariables): Promise<
      ApiResponse<{ payment: unknown; monthlyStats: MonthlyStats }>
    > => {
      // CALL ADD PAYMENT API
      const response = await apiClient.post<
        ApiResponse<{ payment: unknown; monthlyStats: MonthlyStats }>
      >(`/customers/${customerId}/payment`, {
        amount,
        billingMonth,
        paymentDate,
        note,
      });
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (data): void => {
      // INVALIDATE ALL DETAIL QUERIES (STATS UPDATE)
      queryClient.invalidateQueries({ queryKey: customerKeys.details() });
      // INVALIDATE LIST QUERIES (SUMMARY STATS UPDATE)
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
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
