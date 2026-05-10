// <== IMPORTS ==>
import {
  type LoginFormValues,
  type RegisterFormValues,
} from "../validators/authSchemas";
import { AxiosError } from "axios";
import apiClient from "../lib/apiClient";
import { useNavigate } from "react-router-dom";
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

// <== FORGOT PASSWORD SIMPLE RESPONSE TYPE ==>
type ForgotPasswordResponse = {
  // <== SUCCESS FLAG ==>
  success: boolean;
  // <== SERVER MESSAGE ==>
  message: string;
};

// <== USE REGISTER HOOK ==>
export const useRegister = () => {
  // NAVIGATE HOOK
  const navigate = useNavigate();
  // AUTH STORE
  const { login } = useAuthStore();
  // REGISTER MUTATION
  return useMutation<
    AuthResponse,
    AxiosError<ApiErrorResponse>,
    RegisterFormValues
  >({
    // <== MUTATION FN ==>
    mutationFn: async (userData: RegisterFormValues): Promise<AuthResponse> => {
      // CALL REGISTER API
      const response = await apiClient.post<AuthResponse>(
        "/user/register",
        userData,
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
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    },
  });
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
  useMutation<
    ForgotPasswordResponse,
    AxiosError<ApiErrorResponse>,
    { email: string }
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (data): Promise<ForgotPasswordResponse> => {
      // CALLING INITIATE FORGOT PASSWORD API
      const response = await apiClient.post<ForgotPasswordResponse>(
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
    ForgotPasswordResponse,
    AxiosError<ApiErrorResponse>,
    { email: string; code: string }
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (data): Promise<ForgotPasswordResponse> => {
      // CALLING VERIFY FORGOT PASSWORD OTP API
      const response = await apiClient.post<ForgotPasswordResponse>(
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
    ForgotPasswordResponse,
    AxiosError<ApiErrorResponse>,
    { email: string; newPassword: string }
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (data): Promise<ForgotPasswordResponse> => {
      // CALLING RESET FORGOT PASSWORD API
      const response = await apiClient.post<ForgotPasswordResponse>(
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
  useMutation<
    ForgotPasswordResponse,
    AxiosError<ApiErrorResponse>,
    { email: string }
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (data): Promise<ForgotPasswordResponse> => {
      // CALLING CANCEL FORGOT PASSWORD API
      const response = await apiClient.post<ForgotPasswordResponse>(
        "/settings/forgot-password/cancel",
        data,
      );
      // RETURNING RESPONSE DATA
      return response.data;
    },
    // <== SILENT FAILURE — CANCELLATION IS BEST-EFFORT ==>
    onError: () => {},
  });
