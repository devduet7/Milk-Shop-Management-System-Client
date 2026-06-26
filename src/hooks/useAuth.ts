// <== IMPORTS ==>
import { AxiosError } from "axios";
import apiClient from "../lib/apiClient";
import { useNavigate } from "react-router-dom";
import { type LoginFormValues } from "../validators/authSchemas";
import { useAuthStore, type User } from "../stores/useAuthStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// <== AUTH RESPONSE TYPE ==>
type AuthResponse = {
  // <== SUCCESS FLAG ==>
  success: boolean;
  // <== RESPONSE MESSAGE ==>
  message: string;
  // <== USER DATA ==>
  data: User;
};

// <== API ERROR RESPONSE TYPE ==>
export type ApiErrorResponse = {
  // <== ERROR CODE ==>
  code?: string;
  // <== ERROR MESSAGE ==>
  message?: string;
  // <== SUCCESS FLAG ==>
  success?: boolean;
};

// <== SIMPLE SUCCESS RESPONSE TYPE ==>
type SimpleResponse = {
  // <== SUCCESS FLAG ==>
  success: boolean;
  // <== SERVER MESSAGE ==>
  message: string;
};

// <== USE LOGIN HOOK ==>
export const useLogin = () => {
  // NAVIGATE HOOK
  const navigate = useNavigate();
  // AUTH STORE
  const { login } = useAuthStore();
  // LOGIN MUTATION
  return useMutation<
    AuthResponse,
    AxiosError<ApiErrorResponse>,
    LoginFormValues
  >({
    // <== MUTATION FN ==>
    mutationFn: async (credentials: LoginFormValues): Promise<AuthResponse> => {
      // CALL LOGIN API
      const response = await apiClient.post<AuthResponse>(
        "/user/login",
        credentials,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (data: AuthResponse): void => {
      // SET USER IN STORE
      login(data.data);
      // NAVIGATE TO HOME / DASHBOARD
      navigate("/", { replace: true });
    },
    // <== ON ERROR ==>
    onError: (error: AxiosError<ApiErrorResponse>): void => {
      // ERROR MESSAGE IS HANDLED IN THE COMPONENT
      console.error(
        error.response?.data?.message || "Login failed. Please try again.",
      );
    },
  });
};

// <== USE LOGOUT HOOK ==>
export const useLogout = () => {
  // NAVIGATE HOOK
  const navigate = useNavigate();
  // AUTH STORE
  const { clearUser, setLoggingOut } = useAuthStore();
  // QUERY CLIENT (FOR CLEARING CACHE ON LOGOUT)
  const queryClient = useQueryClient();
  // <== SHARED CLEANUP LOGIC ==>
  const cleanup = (): void => {
    // SET LOGGING OUT FLAG (PREVENTS ACTIVE QUERIES FROM RUNNING)
    setLoggingOut(true);
    // CLEAR USER FROM STORE
    clearUser();
    // CANCEL ALL ACTIVE QUERIES
    queryClient.cancelQueries();
    // CLEAR ALL QUERY CACHE
    queryClient.clear();
    // NAVIGATE TO LOGIN
    navigate("/login", { replace: true });
  };
  // LOGOUT MUTATION
  return useMutation<void, AxiosError<ApiErrorResponse>, void>({
    // <== MUTATION FN ==>
    mutationFn: async (): Promise<void> => {
      // CALL LOGOUT API
      await apiClient.post("/user/logout");
    },
    // <== ON SUCCESS ==>
    onSuccess: (): void => {
      // RUN SHARED CLEANUP
      cleanup();
    },
    // <== ON ERROR ==>
    onError: (): void => {
      // CLEAR STATE REGARDLESS OF ERROR (LOGOUT MUST ALWAYS SUCCEED CLIENT-SIDE)
      cleanup();
    },
  });
};

/**
 * INITIATE FORGOT PASSWORD — SENDS OTP TO USER'S REGISTERED EMAIL
 * ERRORS ARE HANDLED IN THE COMPONENT FOR INLINE DISPLAY
 */
// <== USE INITIATE FORGOT PASSWORD HOOK ==>
export const useInitiateForgotPassword = () =>
  useMutation<SimpleResponse, AxiosError<ApiErrorResponse>, { email: string }>({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (data): Promise<SimpleResponse> => {
      // CALLING INITIATE FORGOT PASSWORD API
      const response = await apiClient.post<SimpleResponse>(
        "/settings/forgot-password/initiate",
        data,
      );
      // RETURNING RESPONSE DATA
      return response.data;
    },
  });

/**
 * VERIFY FORGOT PASSWORD OTP — VALIDATES OTP CODE AGAINST STORED HASH
 * ERRORS ARE HANDLED IN THE COMPONENT FOR INLINE DISPLAY (ATTEMPT REMAINING MESSAGES)
 */
// <== USE VERIFY FORGOT PASSWORD OTP HOOK ==>
export const useVerifyForgotPasswordOtp = () =>
  useMutation<
    SimpleResponse,
    AxiosError<ApiErrorResponse>,
    { email: string; code: string }
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (data): Promise<SimpleResponse> => {
      // CALLING VERIFY FORGOT PASSWORD OTP API
      const response = await apiClient.post<SimpleResponse>(
        "/settings/forgot-password/verify",
        data,
      );
      // RETURNING RESPONSE DATA
      return response.data;
    },
  });

/**
 * RESET FORGOT PASSWORD — APPLIES NEW PASSWORD USING SERVER-SIDE RESET PERMISSION TOKEN
 * ERRORS ARE HANDLED IN THE COMPONENT FOR INLINE DISPLAY
 */
// <== USE RESET FORGOT PASSWORD HOOK ==>
export const useResetForgotPassword = () =>
  useMutation<
    SimpleResponse,
    AxiosError<ApiErrorResponse>,
    { email: string; newPassword: string }
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (data): Promise<SimpleResponse> => {
      // CALLING RESET FORGOT PASSWORD API
      const response = await apiClient.post<SimpleResponse>(
        "/settings/forgot-password/reset",
        data,
      );
      // RETURNING RESPONSE DATA
      return response.data;
    },
  });

/**
 * CANCEL FORGOT PASSWORD — CLEANS UP ALL SERVER-SIDE CODES FOR THIS USER
 * SILENTLY FAILS — CODES EXPIRE ON THEIR OWN VIA TTL INDEX IF NOT EXPLICITLY CANCELLED
 */
// <== USE CANCEL FORGOT PASSWORD HOOK ==>
export const useCancelForgotPassword = () =>
  useMutation<SimpleResponse, AxiosError<ApiErrorResponse>, { email: string }>({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (data): Promise<SimpleResponse> => {
      // CALLING CANCEL FORGOT PASSWORD API
      const response = await apiClient.post<SimpleResponse>(
        "/settings/forgot-password/cancel",
        data,
      );
      // RETURNING RESPONSE DATA
      return response.data;
    },
    // <== SILENT FAILURE — CANCELLATION IS BEST-EFFORT ==>
    onError: () => {},
  });

/**
 * COMPLETE ACCOUNT SETUP — INVITED USER VERIFIES INVITE OTP AND SETS THEIR PASSWORD
 * ALL THREE PIECES (EMAIL, CODE, NEW PASSWORD) ARE SUBMITTED TOGETHER IN ONE CALL
 * ERRORS ARE HANDLED IN THE COMPONENT — CODE ERRORS SEND THE USER BACK TO THE OTP STEP
 */
// <== USE COMPLETE ACCOUNT SETUP HOOK ==>
export const useCompleteAccountSetup = () =>
  useMutation<
    SimpleResponse,
    AxiosError<ApiErrorResponse>,
    { email: string; code: string; newPassword: string }
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (data): Promise<SimpleResponse> => {
      // CALLING COMPLETE ACCOUNT SETUP API
      const response = await apiClient.post<SimpleResponse>(
        "/users/setup",
        data,
      );
      // RETURNING RESPONSE DATA
      return response.data;
    },
  });
