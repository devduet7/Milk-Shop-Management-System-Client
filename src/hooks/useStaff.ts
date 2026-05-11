// <== IMPORTS ==>
import type {
  ApiResponse,
  StaffMember,
  StaffListData,
  ApiErrorResponse,
  PaySalaryVariables,
  UpdateStaffVariables,
  ExtraAllocationsData,
  AddExtraAllocationVariables,
} from "../types/staff-types";
import { toast } from "sonner";
import { useEffect } from "react";
import { AxiosError } from "axios";
import apiClient from "../lib/apiClient";
import { dashboardKeys } from "./useDashboard";
import { analyticsKeys } from "./useAnalytics";
import { useAuthStore } from "../stores/useAuthStore";
import type { AddStaffFormValues } from "../validators/staffSchemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// <== QUERY KEY FACTORY ==>
export const staffKeys = {
  // <== ROOT KEY FOR ALL STAFF QUERIES ==>
  all: ["staff"] as const,
  // <== LIST QUERY NAMESPACE ==>
  lists: () => [...staffKeys.all, "list"] as const,
  // <== STAFF LIST WITH FILTERS ==>
  list: (filters: {
    month: string;
    search: string;
    page: number;
    limit: number;
  }) => [...staffKeys.lists(), filters] as const,
  // <== EXTRA ALLOCATIONS NAMESPACE ==>
  extras: () => [...staffKeys.all, "extras"] as const,
  // <== EXTRA ALLOCATIONS FOR A SPECIFIC STAFF MEMBER AND MONTH ==>
  extra: (staffId: string, month: string) =>
    [...staffKeys.extras(), staffId, month] as const,
};

// <== FETCH STAFF QUERY FUNCTION ==>
const fetchStaff = async (
  month: string,
  search: string,
  page: number,
  limit: number,
): Promise<StaffListData> => {
  // BUILD REQUEST PARAMS
  const params: Record<string, string> = {
    month,
    page: String(page),
    limit: String(limit),
  };
  // ONLY INCLUDE SEARCH IF NOT EMPTY
  if (search.trim()) params.search = search.trim();
  // MAKE API REQUEST
  const response = await apiClient.get<ApiResponse<StaffListData>>("/staff", {
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
        totalStaff: 0,
        totalSalaryBill: 0,
        totalMonthlyOutgo: 0,
        totalPaid: 0,
        totalPending: 0,
        totalExtraAllocated: 0,
        clearedCount: 0,
        pendingCount: 0,
      },
      appliedFilter: { month },
    }
  );
};

/**
 * FETCH AND CACHE STAFF LIST WITH MONTH SALARY STATUS
 * NEXT PAGE IS SILENTLY PREFETCHED AFTER CURRENT PAGE LOADS
 */
// <== USE STAFF QUERY HOOK ==>
export const useStaff = (
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
  const query = useQuery<StaffListData, AxiosError<ApiErrorResponse>>({
    // <== QUERY KEY ==>
    queryKey: staffKeys.list({ month, search, page, limit }),
    // <== QUERY FUNCTION ==>
    queryFn: () => fetchStaff(month, search, page, limit),
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
        queryKey: staffKeys.list({ month, search, page: page + 1, limit }),
        // <== QUERY FUNCTION ==>
        queryFn: () => fetchStaff(month, search, page + 1, limit),
        // <== STALE TIME: 2 MINUTES ==>
        staleTime: 2 * 60 * 1000,
      });
    }
  }, [query.data, month, search, page, limit, queryClient]);
  // RETURN QUERY
  return query;
};

/**
 * FETCH EXTRA ALLOCATIONS FOR A STAFF MEMBER IN A BILLING MONTH
 * LAZY — ONLY ENABLED WHEN THE ENABLE FLAG IS TRUE (WHEN THE MODAL IS OPENED)
 */
// <== USE EXTRA ALLOCATIONS QUERY HOOK ==>
export const useExtraAllocations = (
  staffId: string,
  month: string,
  enabled: boolean,
) => {
  // GET AUTH STATE FROM STORE
  const { isAuthenticated, isLoggingOut } = useAuthStore();
  // FETCH EXTRA ALLOCATIONS
  return useQuery<ExtraAllocationsData, AxiosError<ApiErrorResponse>>({
    // <== QUERY KEY ==>
    queryKey: staffKeys.extra(staffId, month),
    // <== QUERY FUNCTION ==>
    queryFn: async () => {
      // MAKE API REQUEST
      const response = await apiClient.get<ApiResponse<ExtraAllocationsData>>(
        `/staff/${staffId}/extra`,
        { params: { month } },
      );
      // RETURN DATA
      return response.data.data;
    },
    // <== ONLY FETCH WHEN ENABLED AND AUTHENTICATED ==>
    enabled: enabled && isAuthenticated && !isLoggingOut && !!staffId,
    // <== STALE TIME: 1 MINUTE ==>
    staleTime: 1 * 60 * 1000,
    // <== GC TIME: 3 MINUTES ==>
    gcTime: 3 * 60 * 1000,
    // <== REFETCH ON MOUNT ==>
    refetchOnMount: true,
    // <== NO REFETCH ON WINDOW FOCUS ==>
    refetchOnWindowFocus: false,
  });
};

/**
 * ADD A NEW STAFF MEMBER
 * INVALIDATES ALL STAFF LIST QUERIES ON SUCCESS
 */
// <== USE ADD STAFF MUTATION HOOK ==>
export const useAddStaff = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<{ staffMember: StaffMember }>,
    AxiosError<ApiErrorResponse>,
    AddStaffFormValues
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (data: AddStaffFormValues) => {
      // CALL ADD STAFF API
      const response = await apiClient.post<
        ApiResponse<{ staffMember: StaffMember }>
      >("/staff", data);
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (data): void => {
      // INVALIDATE ALL STAFF LIST QUERIES
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      // INVALIDATE DASHBOARD QUERIES (CROSS-MODULE SYNC — STAFF COUNT AND PAYROLL SECTION CHANGE)
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      // INVALIDATE ANALYTICS QUERIES (CROSS-MODULE SYNC — STAFF PAYROLL CHART CHANGES)
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
      // SHOW SUCCESS TOAST
      toast.success(data.message || "Staff member added successfully!");
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(
        error.response?.data?.message || "Failed to add staff member.",
      );
    },
  });
};

/**
 * UPDATE AN EXISTING STAFF MEMBER
 * INVALIDATES ALL STAFF LIST QUERIES ON SUCCESS
 */
// <== USE UPDATE STAFF MUTATION HOOK ==>
export const useUpdateStaff = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<{ staffMember: StaffMember }>,
    AxiosError<ApiErrorResponse>,
    UpdateStaffVariables
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async ({ staffId, data }: UpdateStaffVariables) => {
      // CALL UPDATE STAFF API
      const response = await apiClient.put<
        ApiResponse<{ staffMember: StaffMember }>
      >(`/staff/${staffId}`, data);
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (data): void => {
      // INVALIDATE ALL STAFF LIST QUERIES
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      // INVALIDATE DASHBOARD QUERIES (CROSS-MODULE SYNC — SALARY BILL AND PAYROLL SECTION CHANGE)
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      // INVALIDATE ANALYTICS QUERIES (CROSS-MODULE SYNC — STAFF PAYROLL CHART CHANGES)
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
      // SHOW SUCCESS TOAST
      toast.success(data.message || "Staff member updated successfully!");
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(
        error.response?.data?.message || "Failed to update staff member.",
      );
    },
  });
};

/**
 * DELETE A STAFF MEMBER AND ALL RELATED RECORDS
 * INVALIDATES ALL STAFF LIST QUERIES ON SUCCESS
 */
// <== USE DELETE STAFF MUTATION HOOK ==>
export const useDeleteStaff = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<void>,
    AxiosError<ApiErrorResponse>,
    string // STAFF ID
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (staffId: string) => {
      // CALL DELETE STAFF API
      const response = await apiClient.delete<ApiResponse<void>>(
        `/staff/${staffId}`,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (data): void => {
      // INVALIDATE ALL STAFF LIST QUERIES
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      // INVALIDATE DASHBOARD QUERIES (CROSS-MODULE SYNC — STAFF COUNT AND PAYROLL SECTION CHANGE)
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      // INVALIDATE ANALYTICS QUERIES (CROSS-MODULE SYNC — STAFF PAYROLL CHART CHANGES)
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
      // SHOW SUCCESS TOAST
      toast.success(data.message || "Staff member deleted successfully!");
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(
        error.response?.data?.message || "Failed to delete staff member.",
      );
    },
  });
};

/**
 * RECORD A SALARY PAYMENT FOR A STAFF MEMBER'S BILLING MONTH
 * INVALIDATES ALL STAFF LIST QUERIES ON SUCCESS
 */
// <== USE PAY SALARY MUTATION HOOK ==>
export const usePaySalary = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<unknown>,
    AxiosError<ApiErrorResponse>,
    PaySalaryVariables
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async ({ staffId, data }: PaySalaryVariables) => {
      // CALL PAY SALARY API
      const response = await apiClient.patch<ApiResponse<unknown>>(
        `/staff/${staffId}/salary`,
        data,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (data): void => {
      // INVALIDATE ALL STAFF LIST QUERIES
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      // INVALIDATE DASHBOARD QUERIES (CROSS-MODULE SYNC — PAYROLL PAID AMOUNTS AND SECTION CHANGE)
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      // INVALIDATE ANALYTICS QUERIES (CROSS-MODULE SYNC — STAFF PAYROLL CHART CHANGES)
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
      // SHOW SUCCESS TOAST
      toast.success(
        (data as ApiResponse<unknown>).message ||
          "Salary payment recorded successfully!",
      );
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(
        error.response?.data?.message || "Failed to record salary payment.",
      );
    },
  });
};

/**
 * ADD AN EXTRA MONEY ALLOCATION FOR A STAFF MEMBER
 * INVALIDATES STAFF LIST AND EXTRA ALLOCATIONS QUERIES ON SUCCESS
 */
// <== USE ADD EXTRA ALLOCATION MUTATION HOOK ==>
export const useAddExtraAllocation = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<unknown>,
    AxiosError<ApiErrorResponse>,
    AddExtraAllocationVariables
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async ({
      staffId,
      month,
      data,
    }: AddExtraAllocationVariables) => {
      // CALL ADD EXTRA ALLOCATION API
      const response = await apiClient.post<ApiResponse<unknown>>(
        `/staff/${staffId}/extra`,
        { ...data, month },
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (data, variables): void => {
      // INVALIDATE ALL STAFF LIST QUERIES (TOTAL EXTRA UPDATES)
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      // INVALIDATE EXTRA ALLOCATIONS CACHE FOR THIS STAFF MEMBER AND MONTH
      queryClient.invalidateQueries({
        queryKey: staffKeys.extra(variables.staffId, variables.month),
      });
      // INVALIDATE DASHBOARD QUERIES (CROSS-MODULE SYNC — TOTAL MONTHLY OUTGO AND SECTION CHANGE)
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      // INVALIDATE ANALYTICS QUERIES (CROSS-MODULE SYNC — STAFF PAYROLL CHART CHANGES)
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
      // SHOW SUCCESS TOAST
      toast.success(
        (data as ApiResponse<unknown>).message ||
          "Extra allocation recorded successfully!",
      );
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // SHOW ERROR TOAST WITH SERVER MESSAGE OR FALLBACK
      toast.error(
        error.response?.data?.message || "Failed to record extra allocation.",
      );
    },
  });
};
