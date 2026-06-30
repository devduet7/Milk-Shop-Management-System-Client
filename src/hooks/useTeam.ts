// <== IMPORTS ==>
import type {
  TeamMember,
  TeamFilters,
  ApiResponse,
  TeamListData,
  ApiErrorResponse,
  InviteUserVariables,
  UpdateStatusVariables,
  UpdatePermissionsVariables,
} from "@/types/team-types";
import { toast } from "sonner";
import { AxiosError } from "axios";
import apiClient from "@/lib/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// <== SIMPLE RESPONSE TYPE ==>
type SimpleResponse = {
  // <== SUCCESS FLAG ==>
  success: boolean;
  // <== SERVER MESSAGE ==>
  message: string;
};

// <== TEAM QUERY KEY FACTORY ==>
export const teamKeys = {
  // <== BASE KEY ==>
  all: ["team"] as const,
  // <== ALL LIST KEYS ==>
  lists: () => [...teamKeys.all, "list"] as const,
  // <== SPECIFIC LIST KEY WITH FILTERS ==>
  list: (filters: TeamFilters) => [...teamKeys.lists(), filters] as const,
};

/**
 * FETCH PAGINATED TEAM MEMBERS FOR THIS ACCOUNT
 */
// <== USE LIST USERS HOOK ==>
export const useListUsers = (filters: TeamFilters) => {
  // RETURNING QUERY
  return useQuery({
    // <== QUERY KEY ==>
    queryKey: teamKeys.list(filters),
    // <== QUERY FUNCTION ==>
    queryFn: async (): Promise<TeamListData> => {
      // CALLING LIST USERS API WITH ACTIVE FILTERS
      const response = await apiClient.get<ApiResponse<TeamListData>>(
        "/users",
        {
          params: {
            page: filters.page,
            limit: filters.limit,
            ...(filters.search ? { search: filters.search } : {}),
            ...(filters.role ? { role: filters.role } : {}),
          },
        },
      );
      // RETURNING UNWRAPPED DATA
      return response.data.data;
    },
    // STALE TIME OF 30 SECONDS
    staleTime: 30 * 1000,
    // SINGLE RETRY ON FAILURE
    retry: 1,
  });
};

/**
 * INVITE A NEW USER TO THIS ACCOUNT
 */
// <== USE INVITE USER HOOK ==>
export const useInviteUser = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURNING MUTATION
  return useMutation<
    ApiResponse<{ user: TeamMember }>,
    AxiosError<ApiErrorResponse>,
    InviteUserVariables
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (data): Promise<ApiResponse<{ user: TeamMember }>> => {
      // CALLING INVITE USER API
      const response = await apiClient.post<ApiResponse<{ user: TeamMember }>>(
        "/users/invite",
        data,
      );
      // RETURNING RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: () => {
      // INVALIDATE TEAM LIST QUERIES TO REFRESH DATA
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
    // <== ON ERROR — SURFACE SERVER MESSAGE VIA TOAST ==>
    onError: (error: AxiosError<ApiErrorResponse>) => {
      // TOAST ERROR MESSAGE FROM SERVER OR DEFAULT MESSAGE
      toast.error(
        error.response?.data?.message ||
          "Failed to send invite. Please try again.",
      );
    },
  });
};

/**
 * RESEND INVITE OTP TO A PENDING TEAM MEMBER
 */
// <== USE RESEND INVITE HOOK ==>
export const useResendInvite = () => {
  // RETURNING MUTATION
  return useMutation<SimpleResponse, AxiosError<ApiErrorResponse>, string>({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (id: string): Promise<SimpleResponse> => {
      // CALLING RESEND INVITE API WITH TARGET USER ID
      const response = await apiClient.post<SimpleResponse>(
        `/users/${id}/resend-invite`,
      );
      // RETURNING RESPONSE DATA
      return response.data;
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>) => {
      // TOAST ERROR MESSAGE FROM SERVER OR DEFAULT MESSAGE
      toast.error(
        error.response?.data?.message ||
          "Failed to resend invite. Please try again.",
      );
    },
  });
};

/**
 * UPDATE A USER-TIER MEMBER'S MODULE PERMISSIONS
 */
// <== USE UPDATE PERMISSIONS HOOK ==>
export const useUpdatePermissions = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURNING MUTATION
  return useMutation<
    ApiResponse<{ user: Partial<TeamMember> }>,
    AxiosError<ApiErrorResponse>,
    UpdatePermissionsVariables
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (
      data: UpdatePermissionsVariables,
    ): Promise<ApiResponse<{ user: Partial<TeamMember> }>> => {
      // CALLING UPDATE PERMISSIONS API WITH TARGET ID AND NEW PERMISSIONS
      const response = await apiClient.patch<
        ApiResponse<{ user: Partial<TeamMember> }>
      >(`/users/${data.id}/permissions`, { permissions: data.permissions });
      // RETURNING RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: () => {
      // INVALIDATE TEAM LIST QUERIES TO REFRESH DATA
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>) => {
      // TOAST ERROR MESSAGE FROM SERVER OR DEFAULT MESSAGE
      toast.error(
        error.response?.data?.message ||
          "Failed to update permissions. Please try again.",
      );
    },
  });
};

/**
 * ACTIVATE OR DEACTIVATE A TEAM MEMBER'S ACCOUNT
 */
// <== USE UPDATE STATUS HOOK ==>
export const useUpdateStatus = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURNING MUTATION
  return useMutation<
    ApiResponse<{ user: Partial<TeamMember> }>,
    AxiosError<ApiErrorResponse>,
    UpdateStatusVariables
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (
      data: UpdateStatusVariables,
    ): Promise<ApiResponse<{ user: Partial<TeamMember> }>> => {
      // CALLING UPDATE STATUS API WITH TARGET ID AND NEW STATUS
      const response = await apiClient.patch<
        ApiResponse<{ user: Partial<TeamMember> }>
      >(`/users/${data.id}/status`, { isActive: data.isActive });
      // RETURNING RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: () => {
      // INVALIDATE TEAM LIST QUERIES TO REFRESH DATA
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>) => {
      // TOAST ERROR MESSAGE FROM SERVER OR DEFAULT MESSAGE
      toast.error(
        error.response?.data?.message ||
          "Failed to update account status. Please try again.",
      );
    },
  });
};

/**
 * DELETE A TEAM MEMBER AND ALL THEIR SECURITY CODES
 */
// <== USE DELETE TEAM USER HOOK ==>
export const useDeleteTeamUser = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURNING MUTATION
  return useMutation<SimpleResponse, AxiosError<ApiErrorResponse>, string>({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (id: string): Promise<SimpleResponse> => {
      // CALLING DELETE USER API WITH TARGET ID
      const response = await apiClient.delete<SimpleResponse>(`/users/${id}`);
      // RETURNING RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: () => {
      // INVALIDATE TEAM LIST QUERIES TO REFRESH DATA
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>) => {
      // TOAST ERROR MESSAGE FROM SERVER OR DEFAULT MESSAGE
      toast.error(
        error.response?.data?.message ||
          "Failed to delete account. Please try again.",
      );
    },
  });
};
