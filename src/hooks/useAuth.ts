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
