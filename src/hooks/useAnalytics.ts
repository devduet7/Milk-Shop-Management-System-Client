// <== IMPORTS ==>
import type {
  ApiResponse,
  AnalyticsData,
  ApiErrorResponse,
} from "../types/analytics-types";
import { AxiosError } from "axios";
import apiClient from "../lib/apiClient";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../stores/useAuthStore";

// <== QUERY KEY FACTORY ==>
export const analyticsKeys = {
  // <== ROOT KEY FOR ALL ANALYTICS QUERIES ==>
  all: ["analytics"] as const,
  // <== DATA KEY FOR A SPECIFIC MONTH ==>
  data: (month: string) => [...analyticsKeys.all, "data", month] as const,
};

/**
 * FETCH AND CACHE COMPREHENSIVE ANALYTICS CHART DATA FOR THE SELECTED MONTH
 * SINGLE ENDPOINT — ALL CHART DATA RETURNED IN ONE RESPONSE
 */
// <== USE ANALYTICS HOOK ==>
export const useAnalytics = (month: string) => {
  // GET AUTH STATE FROM STORE
  const { isAuthenticated, isLoggingOut } = useAuthStore();
  // RETURN QUERY
  return useQuery<AnalyticsData, AxiosError<ApiErrorResponse>>({
    // <== QUERY KEY — MONTH IS INCLUDED SO EACH MONTH IS CACHED INDEPENDENTLY ==>
    queryKey: analyticsKeys.data(month),
    // <== QUERY FUNCTION ==>
    queryFn: async () => {
      // MAKING REQUEST TO GET ANALYTICS
      const response = await apiClient.get<ApiResponse<AnalyticsData>>(
        "/analytics",
        { params: { month } },
      );
      // RETURN DATA
      return response.data.data;
    },
    // <== ONLY FETCH WHEN AUTHENTICATED ==>
    enabled: isAuthenticated && !isLoggingOut,
    // <== STALE TIME: 3 MINUTES — ANALYTICS DOES NOT CHANGE AS FREQUENTLY AS TRANSACTIONAL PAGES ==>
    staleTime: 3 * 60 * 1000,
    // <== GC TIME: 10 MINUTES — KEEP MULTIPLE MONTHS CACHED FOR FAST BACK NAVIGATION ==>
    gcTime: 10 * 60 * 1000,
    // <== REFETCH ON MOUNT ==>
    refetchOnMount: true,
    // <== NO REFETCH ON WINDOW FOCUS — CHART DATA IS STABLE ==>
    refetchOnWindowFocus: false,
    // <== REFETCH ON RECONNECT ==>
    refetchOnReconnect: true,
    // <== RETRY: SKIP ON 404, ALLOW 3 ON ALL OTHER ERRORS ==>
    retry: (failureCount, error) => {
      // SKIP ON 404
      if ((error as AxiosError)?.response?.status === 404) return false;
      // ALLOW 3 RETRIES
      return failureCount < 3;
    },
  });
};
