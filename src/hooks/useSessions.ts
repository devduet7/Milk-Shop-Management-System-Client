// <== IMPORTS ==>
import type {
  MySessionsResponse,
  UserSessionsResponse,
} from "@/types/session-types";
import { toast } from "sonner";
import { AxiosError } from "axios";
import apiClient from "@/lib/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// <== SIMPLE RESPONSE TYPE ==>
type SimpleResponse = { message: string; success: boolean };
// <== API RESPONSE GENERIC WRAPPER ==>
type ApiResponse<T> = { message: string; success: boolean; data: T };
// <== API ERROR RESPONSE TYPE ==>
type ApiErrorResponse = { message?: string; success?: boolean; code?: string };

// <== SESSION QUERY KEY FACTORY ==>
export const sessionKeys = {
  // <== BASE KEY ==>
  all: ["sessions"] as const,
  // <== MY SESSIONS KEY ==>
  mine: () => [...sessionKeys.all, "me"] as const,
  // <== A SPECIFIC USER'S SESSIONS KEY (ADMIN VIEW) ==>
  user: (userId: string) => [...sessionKeys.all, "user", userId] as const,
};

/**
 * FETCH THE AUTHENTICATED USER'S OWN ACTIVE SESSIONS
 */
// <== USE MY SESSIONS HOOK ==>
export const useMySessions = () =>
  // QUERY FOR THE AUTHENTICATED USER'S OWN SESSIONS
  useQuery({
    // <== QUERY KEY ==>
    queryKey: sessionKeys.mine(),
    // <== QUERY FUNCTION ==>
    queryFn: async (): Promise<MySessionsResponse> => {
      // CALLING GET MY SESSIONS API
      const response =
        await apiClient.get<ApiResponse<MySessionsResponse>>("/sessions/me");
      // RETURNING UNWRAPPED DATA
      return response.data.data;
    },
    // STALE TIME OF 15 SECONDS — ALSO KEPT LIVE VIA SOCKET EVENT INVALIDATION
    staleTime: 15 * 1000,
  });

/**
 * KILL ONE OF THE AUTHENTICATED USER'S OWN SESSIONS
 */
// <== USE KILL MY SESSION HOOK ==>
export const useKillMySession = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURNING A MUTATION HOOK THAT TAKES A SESSION ID AND KILLS THAT SESSION
  return useMutation<SimpleResponse, AxiosError<ApiErrorResponse>, string>({
    // <== MUTATION FUNCTION — TAKES THE TARGET sessionId ==>
    mutationFn: async (sessionId: string): Promise<SimpleResponse> => {
      // CALLING KILL MY SESSION API
      const response = await apiClient.delete<SimpleResponse>(
        `/sessions/me/${sessionId}`,
      );
      // RETURNING RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: () => {
      // INVALIDATE THE MY SESSIONS QUERY SO IT RE-FETCHES
      queryClient.invalidateQueries({ queryKey: sessionKeys.mine() });
    },
    // <== ON ERROR ==>
    onError: (error) => {
      // SURFACE SERVER MESSAGE VIA TOAST
      toast.error(
        error.response?.data?.message ||
          "Failed to end session. Please try again.",
      );
    },
  });
};

/**
 * FETCH ANOTHER TEAM MEMBER'S ACTIVE SESSIONS
 */
// <== USE USER SESSIONS HOOK ==>
export const useUserSessions = (userId: string, enabled: boolean) =>
  // QUERY FOR ANOTHER TEAM MEMBER'S SESSIONS (ADMIN VIEW)
  useQuery({
    // <== QUERY KEY ==>
    queryKey: sessionKeys.user(userId),
    // <== QUERY FUNCTION ==>
    queryFn: async (): Promise<UserSessionsResponse> => {
      // CALLING GET USER SESSIONS API
      const response = await apiClient.get<ApiResponse<UserSessionsResponse>>(
        `/sessions/user/${userId}`,
      );
      // RETURNING UNWRAPPED DATA
      return response.data.data;
    },
    // ONLY RUNS WHEN EXPLICITLY ENABLED AND A VALID USER ID IS PRESENT
    enabled: enabled && Boolean(userId),
    // STALE TIME OF 15 SECONDS — ALSO KEPT LIVE VIA SOCKET EVENT INVALIDATION
    staleTime: 15 * 1000,
  });

/**
 * FORCE-KILL A SPECIFIC SESSION BELONGING TO ANOTHER TEAM MEMBER
 */
// <== USE KILL USER SESSION HOOK ==>
export const useKillUserSession = (userId: string) => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURNING A MUTATION HOOK THAT TAKES A SESSION ID AND KILLS THAT SESSION
  return useMutation<SimpleResponse, AxiosError<ApiErrorResponse>, string>({
    // <== MUTATION FUNCTION — TAKES THE TARGET sessionId ==>
    mutationFn: async (sessionId: string): Promise<SimpleResponse> => {
      // CALLING KILL USER SESSION API
      const response = await apiClient.delete<SimpleResponse>(
        `/sessions/user/${userId}/${sessionId}`,
      );
      // RETURNING RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: () => {
      // INVALIDATE THIS USER'S SESSIONS LIST SO IT RE-FETCHES
      queryClient.invalidateQueries({ queryKey: sessionKeys.user(userId) });
    },
    // <== ON ERROR ==>
    onError: (error) => {
      // SURFACE SERVER MESSAGE VIA TOAST
      toast.error(
        error.response?.data?.message ||
          "Failed to end session. Please try again.",
      );
    },
  });
};

/**
 * FORCE-KILL ALL ACTIVE SESSIONS FOR A TEAM MEMBER
 */
// <== USE KILL ALL USER SESSIONS HOOK ==>
export const useKillAllUserSessions = (userId: string) => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURNING A MUTATION HOOK THAT KILLS ALL SESSIONS FOR THE TARGET USER
  return useMutation<SimpleResponse, AxiosError<ApiErrorResponse>, void>({
    // <== MUTATION FUNCTION — NO ARGUMENTS, TARGETS THE WHOLE USER ==>
    mutationFn: async (): Promise<SimpleResponse> => {
      // CALLING KILL ALL USER SESSIONS API
      const response = await apiClient.delete<SimpleResponse>(
        `/sessions/user/${userId}`,
      );
      // RETURNING RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: () => {
      // INVALIDATE THIS USER'S SESSIONS LIST SO IT RE-FETCHES
      queryClient.invalidateQueries({ queryKey: sessionKeys.user(userId) });
    },
    // <== ON ERROR ==>
    onError: (error) => {
      // SURFACE SERVER MESSAGE VIA TOAST
      toast.error(
        error.response?.data?.message ||
          "Failed to end all sessions. Please try again.",
      );
    },
  });
};
