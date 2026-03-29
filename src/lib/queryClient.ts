// <== IMPORTS ==>
import { QueryClient } from "@tanstack/react-query";

// <== QUERY CLIENT CONFIGURATION ==>
export const queryClient = new QueryClient({
  // <== DEFAULT OPTIONS ==>
  defaultOptions: {
    // <== QUERIES ==>
    queries: {
      // <== STALE TIME: DATA IS CONSIDERED FRESH FOR 5 MINUTES ==>
      staleTime: 5 * 60 * 1000,
      // <== GC TIME: DATA STAYS IN CACHE FOR 5 MINUTES ==>
      gcTime: 5 * 60 * 1000,
      // <== RETRY CONFIGURATION ==>
      retry: 3,
      // <== RETRY DELAY: EXPONENTIAL BACKOFF ==>
      retryDelay: (attemptIndex: number): number =>
        Math.min(1000 * 2 ** attemptIndex, 30000),
      // <== REFETCH ON WINDOW FOCUS ==>
      refetchOnWindowFocus: false,
      // <== REFETCH ON RECONNECT ==>
      refetchOnReconnect: true,
    },
    // <== MUTATIONS ==>
    mutations: {
      // <== NO RETRIES FOR MUTATIONS - PREVENTS DOUBLE API CALLS ==>
      retry: false,
    },
  },
});
