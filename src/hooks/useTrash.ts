// <== IMPORTS ==>
import { useEffect } from "react";
import type {
  ApiResponse,
  TrashListData,
  TrashCategory,
  ApiErrorResponse,
} from "../types/trash-types";
import { toast } from "sonner";
import { AxiosError } from "axios";
import apiClient from "../lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// <== QUERY PARAMS TYPE ==>
interface UseTrashParams {
  // <== OPTIONAL CATEGORY FILTER ==>
  entityType?: TrashCategory | "";
  // <== PAGE NUMBER ==>
  page: number;
  // <== ROWS PER PAGE ==>
  limit: number;
}

// <== QUERY KEY FACTORY ==>
export const trashKeys = {
  // <== ROOT KEY ==>
  all: ["trash"] as const,
  // <== LIST KEY ==>
  list: (params: UseTrashParams) => [...trashKeys.all, "list", params] as const,
};

// <== FETCH TRASH QUERY FUNCTION ==>
const fetchTrash = async ({
  entityType,
  page,
  limit,
}: UseTrashParams): Promise<TrashListData> => {
  // FETCH TRASH RECORDS FROM SERVER
  const response = await apiClient.get<ApiResponse<TrashListData>>("/trash", {
    params: { entityType: entityType || undefined, page, limit },
  });
  // RETURN DATA
  return response.data.data;
};

/**
 * FETCH PAGINATED TRASH RECORDS, OPTIONALLY FILTERED BY CATEGORY
 * NEXT PAGE IS SILENTLY PREFETCHED AFTER CURRENT PAGE LOADS
 */
// <== USE TRASH QUERY HOOK ==>
export const useTrash = ({ entityType, page, limit }: UseTrashParams) => {
  // QUERY CLIENT FOR NEXT-PAGE PREFETCH
  const queryClient = useQueryClient();
  // FETCH CURRENT PAGE
  const query = useQuery<TrashListData, AxiosError<ApiErrorResponse>>({
    // <== QUERY KEY ==>
    queryKey: trashKeys.list({ entityType, page, limit }),
    // <== QUERY FUNCTION ==>
    queryFn: () => fetchTrash({ entityType, page, limit }),
    // <== KEEP PREVIOUS DATA WHILE FETCHING THE NEXT PAGE/FILTER TO AVOID FLICKER ==>
    placeholderData: (previousData) => previousData,
    // <== STALE TIME: 30 SECONDS ==>
    staleTime: 30 * 1000,
  });
  // SILENTLY PREFETCH NEXT PAGE
  useEffect(() => {
    // IF NEXT PAGE EXISTS
    if (query.data?.pagination?.hasNextPage) {
      // PREFETCH NEXT PAGE
      queryClient.prefetchQuery({
        // <== QUERY KEY ==>
        queryKey: trashKeys.list({ entityType, page: page + 1, limit }),
        // <== QUERY FUNCTION ==>
        queryFn: () => fetchTrash({ entityType, page: page + 1, limit }),
        // <== STALE TIME: 30 SECONDS ==>
        staleTime: 30 * 1000,
      });
    }
  }, [query.data, entityType, page, limit, queryClient]);
  // RETURN QUERY
  return query;
};

/**
 * RESTORE A SINGLE TRASHED ITEM BACK TO ITS ORIGINAL COLLECTION
 */
// <== USE RESTORE TRASH ITEM MUTATION HOOK ==>
export const useRestoreTrashItem = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<{ restored: Record<string, unknown> }>,
    AxiosError<ApiErrorResponse>,
    string
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (trashId) => {
      // CALL RESTORE API
      const response = await apiClient.patch<
        ApiResponse<{ restored: Record<string, unknown> }>
      >(`/trash/${trashId}/restore`);
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (data) => {
      // INVALIDATING TRASH LIST CACHE
      queryClient.invalidateQueries({ queryKey: trashKeys.all });
      // SHOW SUCCESS TOAST
      toast.success(data.message || "Item restored successfully!");
    },
    // <== ON ERROR ==>
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(error.response?.data?.message || "Failed to restore item.");
    },
  });
};

/**
 * PERMANENTLY DELETE A SINGLE TRASHED ITEM
 */
// <== USE PERMANENTLY DELETE TRASH ITEM MUTATION HOOK ==>
export const usePermanentlyDeleteTrashItem = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<ApiResponse<void>, AxiosError<ApiErrorResponse>, string>({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (trashId) => {
      // CALL PERMANENT DELETE API
      const response = await apiClient.delete<ApiResponse<void>>(
        `/trash/${trashId}`,
      );
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (data) => {
      // INVALIDATING TRASH LIST CACHE
      queryClient.invalidateQueries({ queryKey: trashKeys.all });
      // SHOW SUCCESS TOAST
      toast.success(data.message || "Item permanently deleted!");
    },
    // <== ON ERROR ==>
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(error.response?.data?.message || "Failed to delete item.");
    },
  });
};

/**
 * EMPTY THE ENTIRE TRASH, OPTIONALLY SCOPED TO A SINGLE CATEGORY
 */
// <== USE EMPTY TRASH MUTATION HOOK ==>
export const useEmptyTrash = () => {
  // QUERY CLIENT FOR CACHE INVALIDATION
  const queryClient = useQueryClient();
  // RETURN MUTATION
  return useMutation<
    ApiResponse<{ deletedCount: number }>,
    AxiosError<ApiErrorResponse>,
    TrashCategory | ""
  >({
    // <== MUTATION FUNCTION ==>
    mutationFn: async (entityType) => {
      // CALL EMPTY TRASH API
      const response = await apiClient.delete<
        ApiResponse<{ deletedCount: number }>
      >("/trash/empty", { params: { entityType: entityType || undefined } });
      // RETURN RESPONSE DATA
      return response.data;
    },
    // <== ON SUCCESS ==>
    onSuccess: (data) => {
      // INVALIDATING TRASH LIST CACHE
      queryClient.invalidateQueries({ queryKey: trashKeys.all });
      // SHOW SUCCESS TOAST
      toast.success(data.message || "Trash emptied successfully!");
    },
    // <== ON ERROR ==>
    onError: (error) => {
      // SHOW ERROR TOAST
      toast.error(error.response?.data?.message || "Failed to empty trash.");
    },
  });
};
