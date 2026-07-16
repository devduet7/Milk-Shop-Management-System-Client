// <== IMPORTS ==>
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// <== API BASE URL ==>
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

// <== API ERROR RESPONSE INTERFACE ==>
interface ApiErrorResponse {
  // <== ERROR CODE ==>
  code?: string;
  // <== ERROR MESSAGE ==>
  message?: string;
  // <== SUCCESS FLAG ==>
  success?: boolean;
}
// <== EXTENDED REQUEST CONFIG WITH RETRY FLAG ==>
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  // <== RETRY FLAG TO PREVENT INFINITE LOOPS ==>
  _retry?: boolean;
}
// <== TOKEN REFRESH CALLBACK TYPE ==>
type TokenRefreshCallback = (error?: AxiosError) => void;

// <== CREATING AXIOS INSTANCE ==>
export const apiClient = axios.create({
  // <== BASE URL ==>
  baseURL: API_BASE_URL,
  // <== WITH CREDENTIALS (FOR COOKIES) ==>
  withCredentials: true,
  // <== DEFAULT HEADERS ==>
  headers: {
    // <== CONTENT TYPE ==>
    "Content-Type": "application/json",
  },
});

// <== TOKEN REFRESH STATE ==>
let isRefreshing = false;
// <== REFRESH SUBSCRIBERS ==>
let refreshSubscribers: TokenRefreshCallback[] = [];

// <== SUBSCRIBE TO TOKEN REFRESH ==>
const subscribeTokenRefresh = (cb: TokenRefreshCallback): void => {
  // ADD CALLBACK TO SUBSCRIBERS LIST
  refreshSubscribers.push(cb);
};

// <== NOTIFY ALL SUBSCRIBERS ON TOKEN REFRESHED ==>
const onTokenRefreshed = (): void => {
  // CALL ALL QUEUED SUBSCRIBERS
  refreshSubscribers.forEach((cb) => cb());
  // CLEAR SUBSCRIBERS LIST
  refreshSubscribers = [];
};

// <== ATTEMPT TOKEN REFRESH ==>
export const attemptTokenRefresh = async (): Promise<void> => {
  // IF A REFRESH IS ALREADY IN FLIGHT, QUEUE BEHIND IT INSTEAD OF FIRING A SECOND NETWORK CALL
  if (isRefreshing) {
    // RETURN PROMISE THAT RESOLVES OR REJECTS BASED ON THE IN-FLIGHT REFRESH'S OUTCOME
    return new Promise<void>((resolve, reject) => {
      // SUBSCRIBE TO TOKEN REFRESH
      subscribeTokenRefresh((refreshError?: AxiosError) => {
        // IF REFRESH FAILED, REJECT WITH ERROR
        if (refreshError) {
          // REFRESH FAILED
          reject(refreshError);
        } else {
          // REFRESH SUCCEEDED
          resolve();
        }
      });
    });
  }
  // SET REFRESHING FLAG
  isRefreshing = true;
  // ATTEMPTING SILENT TOKEN REFRESH
  try {
    await apiClient.post("/user/refresh");
    // NOTIFY ALL QUEUED REQUESTS THAT TOKEN IS REFRESHED
    onTokenRefreshed();
    // RESET REFRESHING FLAG
    isRefreshing = false;
  } catch (refreshError_1) {
    // RESET REFRESHING FLAG
    isRefreshing = false;
    // NOTIFY ALL QUEUED REQUESTS OF FAILURE
    refreshSubscribers.forEach((cb_1) => cb_1(refreshError_1));
    // CLEAR SUBSCRIBERS
    refreshSubscribers = [];
    // GUARD: DISTINGUISH A SERVER-REJECTED REFRESH FROM A PURE NETWORK FAILURE
    const hasServerResponse =
      typeof refreshError_1 === "object" &&
      refreshError_1 !== null &&
      "response" in refreshError_1 &&
      (refreshError_1 as { response?: unknown }).response !== undefined;
    // ONLY A SERVER REJECTION MEANS THE SESSION IS ACTUALLY OVER — A NETWORK BLIP MUST NOT LOG THE USER OUT
    if (hasServerResponse) {
      // DISPATCH SESSION EXPIRED EVENT — SINGLE SOURCE OF TRUTH REGARDLESS OF WHO INITIATED THE REFRESH
      window.dispatchEvent(new CustomEvent("session-expired"));
    }
    // PROPAGATE THE ERROR TO THE ORIGINAL REQUEST'S CATCH BLOCK
    throw refreshError_1;
  }
};

// <== REQUEST INTERCEPTOR ==>
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // PASS REQUEST THROUGH (COOKIES ARE SENT AUTOMATICALLY)
    return config;
  },
  (error: AxiosError): Promise<never> => {
    // RETURN REQUEST ERROR
    return Promise.reject(error);
  },
);

// <== RESPONSE INTERCEPTOR ==>
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // RETURN SUCCESSFUL RESPONSE
    return response;
  },
  // RESPONSE ERROR HANDLER — ATTEMPTS SILENT TOKEN REFRESH ON 401 ERRORS
  async (error: AxiosError<ApiErrorResponse>): Promise<AxiosResponse> => {
    // GET ORIGINAL REQUEST CONFIG
    const originalRequest = error.config as RetryableRequestConfig;
    // CHECK IF ERROR IS 401 AND NOT ALREADY A RETRY AND NOT THE REFRESH ENDPOINT
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/user/refresh")
    ) {
      // GET ERROR CODE FROM RESPONSE
      const errorCode = error.response.data?.code;
      // IF REFRESH TOKEN IS EXPIRED OR MISSING, SESSION IS OVER
      if (
        errorCode === "NO_REFRESH_TOKEN" ||
        errorCode === "REFRESH_TOKEN_EXPIRED" ||
        errorCode === "INVALID_REFRESH_TOKEN"
      ) {
        // DISPATCH SESSION EXPIRED EVENT FOR GLOBAL HANDLING
        window.dispatchEvent(new CustomEvent("session-expired"));
        // RETURN ERROR
        return Promise.reject(error);
      }
      // IF ACCESS TOKEN EXPIRED OR MISSING, ATTEMPT SILENT REFRESH
      if (
        errorCode === "ACCESS_TOKEN_EXPIRED" ||
        errorCode === "NO_ACCESS_TOKEN"
      ) {
        // MARK REQUEST AS RETRY TO PREVENT INFINITE LOOPS
        originalRequest._retry = true;
        try {
          // ATTEMPT TOKEN REFRESH — SHARED HELPER COORDINATES WITH ANY OTHER IN-FLIGHT REFRESH
          await attemptTokenRefresh();
          // RETRY ORIGINAL REQUEST WITH NEW TOKEN
          return apiClient(originalRequest);
        } catch (refreshError) {
          // IF REFRESH FAILED, PROPAGATE THE ERROR TO THE ORIGINAL REQUEST'S CATCH BLOCK
          return Promise.reject(refreshError);
        }
      }
    }
    // RETURN ALL OTHER ERRORS AS-IS
    return Promise.reject(error);
  },
);

// <== EXPORT DEFAULT ==>
export default apiClient;
