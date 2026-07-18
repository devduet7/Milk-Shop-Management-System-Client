// <== IMPORTS ==>
import type {
  UserProfile,
  ApiResponse,
  DeletionMode,
  ApiErrorResponse,
  TrashRetentionDays,
} from "../types/settings-types";
import { toast } from "sonner";
import { AxiosError } from "axios";
import apiClient from "../lib/apiClient";
import { useAuthStore } from "../stores/useAuthStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// <== QUERY KEY FACTORY ==>
export const settingsKeys = {
  // <== ROOT KEY FOR ALL SETTINGS QUERIES ==>
  all: ["settings"] as const,
  // <== PROFILE QUERY KEY ==>
  profile: () => [...settingsKeys.all, "profile"] as const,
};

/**
 * FETCH FULL USER PROFILE FROM SETTINGS ENDPOINT
 * USED TO HYDRATE SETTINGS PAGE WITH ALL PROFILE FIELDS
 */
// <== USE GET PROFILE QUERY HOOK ==>
export const useGetProfile = () => {
  // GET AUTH STATE FROM STORE
  const { isAuthenticated, isLoggingOut } = useAuthStore();
  // RETURN QUERY
  return useQuery<UserProfile, AxiosError<ApiErrorResponse>>({
    // <== QUERY KEY ==>
    queryKey: settingsKeys.profile(),
    // <== QUERY FUNCTION ==>
    queryFn: async () => {
      // FETCH FULL PROFILE FROM SERVER
      const response =
        await apiClient.get<ApiResponse<UserProfile>>("/settings/profile");
      // RETURN DATA
      return response.data.data;
    },
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
  });
};

// <== HELPER: SYNC PROFILE TO AUTH STORE AND INVALIDATE PROFILE QUERY ==>
const useSyncProfile = () => {
  // AUTH STORE UPDATE ACTION
  const updateUser = useAuthStore((state) => state.updateUser);
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN SYNC FUNCTION
  return (profile: UserProfile): void => {
    // UPDATING AUTH STORE WITH FRESH PROFILE DATA
    updateUser({
      fullName: profile.fullName,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      address: profile.address,
      avatar: profile.avatar,
      milkRate: profile.milkRate,
      yoghurtRate: profile.yoghurtRate,
      dailyReportsEnabled: profile.dailyReportsEnabled,
      monthlyReportsEnabled: profile.monthlyReportsEnabled,
      deletionMode: profile.deletionMode,
      trashRetentionDays: profile.trashRetentionDays,
    });
    // INVALIDATING PROFILE CACHE TO REFLECT CHANGES ON NEXT FETCH
    queryClient.invalidateQueries({ queryKey: settingsKeys.profile() });
  };
};

/**
 * UPDATE FULL NAME — NO OTP REQUIRED
 */
// <== USE UPDATE FULL NAME MUTATION HOOK ==>
export const useUpdateFullName = () => {
  // GET SYNC FUNCTION TO UPDATE AUTH STORE
  const syncProfile = useSyncProfile();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<UserProfile>,
    AxiosError<ApiErrorResponse>,
    { fullName: string }
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (data) => {
      // CALL UPDATE FULL NAME API
      const response = await apiClient.patch<ApiResponse<UserProfile>>(
        "/settings/name",
        data,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS — UPDATE AUTH STORE AND SHOW SUCCESS TOAST
    onSuccess: (data) => {
      // UPDATE AUTH STORE
      syncProfile(data.data);
      // SHOW SUCCESS TOAST
      toast.success(data.message || "Name updated successfully!");
    },
    // <== ON ERROR ==>
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(error.response?.data?.message || "Failed to update name.");
    },
  });
};

/**
 * UPDATE ADDRESS — NO OTP REQUIRED
 */
// <== USE UPDATE ADDRESS MUTATION HOOK ==>
export const useUpdateAddress = () => {
  // GET SYNC FUNCTION TO UPDATE AUTH STORE
  const syncProfile = useSyncProfile();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<UserProfile>,
    AxiosError<ApiErrorResponse>,
    { address: string | null }
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (data) => {
      // CALL UPDATE ADDRESS API
      const response = await apiClient.patch<ApiResponse<UserProfile>>(
        "/settings/address",
        data,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS — UPDATE AUTH STORE AND SHOW SUCCESS TOAST
    onSuccess: (data) => {
      // UPDATE AUTH STORE
      syncProfile(data.data);
      // SHOW SUCCESS TOAST
      toast.success(data.message || "Address updated successfully!");
    },
    // <== ON ERROR ==>
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(error.response?.data?.message || "Failed to update address.");
    },
  });
};

/**
 * INITIATE PHONE NUMBER CHANGE — SENDS OTP TO CURRENT EMAIL
 */
// <== USE INITIATE PHONE CHANGE MUTATION HOOK ==>
export const useInitiatePhoneChange = () =>
  useMutation<
    ApiResponse<void>,
    AxiosError<ApiErrorResponse>,
    { newPhone: string }
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (data) => {
      // CALL INITIATE PHONE CHANGE API
      const response = await apiClient.post<ApiResponse<void>>(
        "/settings/phone/initiate",
        data,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON ERROR ==>
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(
        error.response?.data?.message || "Failed to send verification code.",
      );
    },
  });

/**
 * VERIFY PHONE CHANGE OTP — APPLIES NEW PHONE IF CODE VALID
 */
// <== USE VERIFY PHONE CHANGE MUTATION HOOK ==>
export const useVerifyPhoneChange = () => {
  // GET SYNC FUNCTION TO UPDATE AUTH STORE
  const syncProfile = useSyncProfile();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<UserProfile>,
    AxiosError<ApiErrorResponse>,
    { code: string }
  >({
    mutationFn: async (data) => {
      const response = await apiClient.post<ApiResponse<UserProfile>>(
        "/settings/phone/verify",
        data,
      );
      return response.data;
    },
    onSuccess: (data) => {
      syncProfile(data.data);
      toast.success(data.message || "Phone number updated successfully!");
    },
  });
};

/**
 * INITIATE EMAIL CHANGE — SENDS OTP TO CURRENT EMAIL (STEP 1)
 */
// <== USE INITIATE EMAIL CHANGE MUTATION HOOK ==>
export const useInitiateEmailChange = () =>
  useMutation<
    ApiResponse<void>,
    AxiosError<ApiErrorResponse>,
    { newEmail: string }
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (data) => {
      // CALL INITIATE EMAIL CHANGE API
      const response = await apiClient.post<ApiResponse<void>>(
        "/settings/email/initiate",
        data,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON ERROR ==>
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(
        error.response?.data?.message || "Failed to send verification code.",
      );
    },
  });

/**
 * VERIFY CURRENT EMAIL OTP — SENDS CODE TO NEW EMAIL (STEP 2)
 */
// <== USE VERIFY CURRENT EMAIL MUTATION HOOK ==>
export const useVerifyCurrentEmail = () =>
  useMutation<
    ApiResponse<void>,
    AxiosError<ApiErrorResponse>,
    { code: string }
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (data) => {
      // CALL VERIFY CURRENT EMAIL API
      const response = await apiClient.post<ApiResponse<void>>(
        "/settings/email/verify-current",
        data,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON ERROR ==>
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(
        error.response?.data?.message || "Failed to send verification code.",
      );
    },
  });

/**
 * VERIFY NEW EMAIL OTP — FINALISES EMAIL CHANGE (STEP 3)
 */
// <== USE VERIFY NEW EMAIL MUTATION HOOK ==>
export const useVerifyNewEmail = () => {
  // GET SYNC FUNCTION TO UPDATE AUTH STORE
  const syncProfile = useSyncProfile();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<UserProfile>,
    AxiosError<ApiErrorResponse>,
    { code: string }
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (data) => {
      // CALL VERIFY NEW EMAIL API
      const response = await apiClient.post<ApiResponse<UserProfile>>(
        "/settings/email/verify-new",
        data,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS — UPDATE AUTH STORE AND SHOW SUCCESS TOAST
    onSuccess: (data) => {
      // UPDATE AUTH STORE
      syncProfile(data.data);
      // SHOW SUCCESS TOAST
      toast.success(data.message || "Email address updated successfully!");
    },
    // <== ON ERROR ==>
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(error.response?.data?.message || "Failed to update email.");
    },
  });
};

/**
 * INITIATE PASSWORD CHANGE — SENDS OTP TO CURRENT EMAIL
 */
// <== USE INITIATE PASSWORD CHANGE MUTATION HOOK ==>
export const useInitiatePasswordChange = () =>
  useMutation<
    ApiResponse<void>,
    AxiosError<ApiErrorResponse>,
    { newPassword: string }
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (data) => {
      // CALL INITIATE PASSWORD CHANGE API
      const response = await apiClient.post<ApiResponse<void>>(
        "/settings/password/initiate",
        data,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON ERROR ==>
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(
        error.response?.data?.message || "Failed to send verification code.",
      );
    },
  });

/**
 * VERIFY PASSWORD CHANGE OTP — APPLIES NEW PASSWORD IF CODE VALID
 */
// <== USE VERIFY PASSWORD CHANGE MUTATION HOOK ==>
export const useVerifyPasswordChange = () =>
  useMutation<
    ApiResponse<void>,
    AxiosError<ApiErrorResponse>,
    { code: string }
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (data) => {
      // CALL VERIFY PASSWORD CHANGE API
      const response = await apiClient.post<ApiResponse<void>>(
        "/settings/password/verify",
        data,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON ERROR ==>
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(error.response?.data?.message || "Failed to verify code.");
    },
  });

/**
 * UPLOAD OR REPLACE AVATAR — CLOUDINARY UPLOAD VIA FORM DATA
 */
// <== USE UPLOAD AVATAR MUTATION HOOK ==>
export const useUploadAvatar = () => {
  // GET SYNC FUNCTION TO UPDATE AUTH STORE
  const syncProfile = useSyncProfile();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<UserProfile>,
    AxiosError<ApiErrorResponse>,
    FormData
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (formData) => {
      // CALL UPLOAD AVATAR API
      const response = await apiClient.put<ApiResponse<UserProfile>>(
        "/settings/avatar",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS — UPDATE AUTH STORE AND SHOW SUCCESS TOAST
    onSuccess: (data) => {
      // UPDATE AUTH STORE
      syncProfile(data.data);
      // SHOW SUCCESS TOAST
      toast.success(data.message || "Avatar updated successfully!");
    },
    // <== ON ERROR ==>
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(error.response?.data?.message || "Failed to upload avatar.");
    },
  });
};

/**
 * DELETE AVATAR — REMOVES FROM CLOUDINARY AND CLEARS FIELD
 */
// <== USE DELETE AVATAR MUTATION HOOK ==>
export const useDeleteAvatar = () => {
  // GET SYNC FUNCTION TO UPDATE AUTH STORE
  const syncProfile = useSyncProfile();
  // RETURN MUTATION
  return useMutation<ApiResponse<UserProfile>, AxiosError<ApiErrorResponse>>({
    // <== MUTATION FUNCTION ==>
    mutationFn: async () => {
      // CALL DELETE AVATAR API
      const response =
        await apiClient.delete<ApiResponse<UserProfile>>("/settings/avatar");
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS — UPDATE AUTH STORE AND SHOW SUCCESS TOAST
    onSuccess: (data) => {
      // UPDATE AUTH STORE
      syncProfile(data.data);
      // SHOW SUCCESS TOAST
      toast.success(data.message || "Avatar removed successfully!");
    },
    // <== ON ERROR ==>
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(error.response?.data?.message || "Failed to remove avatar.");
    },
  });
};

/**
 * UPDATE PRICING — MILK AND/OR YOGHURT RATES
 */
// <== USE UPDATE PRICING MUTATION HOOK ==>
export const useUpdatePricing = () => {
  // GET SYNC FUNCTION TO UPDATE AUTH STORE
  const syncProfile = useSyncProfile();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<UserProfile>,
    AxiosError<ApiErrorResponse>,
    { milkRate?: number; yoghurtRate?: number }
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (data) => {
      // CALL UPDATE PRICING API
      const response = await apiClient.patch<ApiResponse<UserProfile>>(
        "/settings/pricing",
        data,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS — UPDATE AUTH STORE AND SHOW SUCCESS TOAST
    onSuccess: (data) => {
      // UPDATE AUTH STORE
      syncProfile(data.data);
      // SHOW SUCCESS TOAST
      toast.success(data.message || "Pricing updated successfully!");
    },
    // <== ON ERROR ==>
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(error.response?.data?.message || "Failed to update pricing.");
    },
  });
};

/**
 * UPDATE REPORT SETTINGS — DAILY AND/OR MONTHLY TOGGLE
 */
// <== USE UPDATE REPORT SETTINGS MUTATION HOOK ==>
export const useUpdateReportSettings = () => {
  // GET SYNC FUNCTION TO UPDATE AUTH STORE
  const syncProfile = useSyncProfile();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<UserProfile>,
    AxiosError<ApiErrorResponse>,
    { dailyReportsEnabled?: boolean; monthlyReportsEnabled?: boolean }
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (data) => {
      // CALL UPDATE PRICING API
      const response = await apiClient.patch<ApiResponse<UserProfile>>(
        "/settings/reports",
        data,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS — UPDATE AUTH STORE AND SHOW SUCCESS TOAST
    onSuccess: (data) => {
      // UPDATE AUTH STORE
      syncProfile(data.data);
      // SHOW SUCCESS TOAST
      toast.success(data.message || "Report settings updated!");
    },
    // <== ON ERROR ==>
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(
        error.response?.data?.message || "Failed to update report settings.",
      );
    },
  });
};

/**
 * UPDATE TRASH SETTINGS — DELETION MODE AND/OR RETENTION DAYS
 */
// <== USE UPDATE TRASH SETTINGS MUTATION HOOK ==>
export const useUpdateTrashSettings = () => {
  // GET SYNC FUNCTION TO UPDATE AUTH STORE
  const syncProfile = useSyncProfile();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<UserProfile>,
    AxiosError<ApiErrorResponse>,
    { deletionMode?: DeletionMode; trashRetentionDays?: TrashRetentionDays }
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (data) => {
      // CALL UPDATE TRASH SETTINGS API
      const response = await apiClient.patch<ApiResponse<UserProfile>>(
        "/settings/trash",
        data,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS — UPDATE AUTH STORE AND SHOW SUCCESS TOAST
    onSuccess: (data) => {
      // UPDATE AUTH STORE
      syncProfile(data.data);
      // SHOW SUCCESS TOAST
      toast.success(data.message || "Trash settings updated!");
    },
    // <== ON ERROR ==>
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(
        error.response?.data?.message || "Failed to update trash settings.",
      );
    },
  });
};

/**
 * CANCEL PENDING SECURITY CODE — CLEANUP WHEN USER ABANDONS CHANGE FLOW
 */
// <== USE CANCEL SECURITY CODE MUTATION HOOK ==>
export const useCancelSecurityCode = () =>
  // RETURN MUTATION
  useMutation<ApiResponse<void>, AxiosError<ApiErrorResponse>, string>({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (purpose) => {
      // CALL CANCEL SECURITY CODE API
      const response = await apiClient.delete<ApiResponse<void>>(
        `/settings/security-code/${purpose}`,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // SILENTLY FAIL — CANCELLATION IS BEST-EFFORT, CODES EXPIRE ON THEIR OWN
    onError: () => {},
  });
