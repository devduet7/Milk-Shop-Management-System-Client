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
        // IF ALREADY REFRESHING, QUEUE THIS REQUEST UNTIL REFRESH COMPLETES
        if (isRefreshing) {
          // RETURN PROMISE THAT RESOLVES WHEN TOKEN IS REFRESHED
          return new Promise<AxiosResponse>((resolve, reject) => {
            // SUBSCRIBE TO TOKEN REFRESH
            subscribeTokenRefresh((refreshError?: AxiosError) => {
              // IF REFRESH FAILED, REJECT WITH ERROR
              if (refreshError) {
                reject(refreshError);
              } else {
                // RETRY ORIGINAL REQUEST WITH NEW TOKEN
                resolve(apiClient(originalRequest));
              }
            });
          });
        }
        // MARK REQUEST AS RETRY TO PREVENT INFINITE LOOPS
        originalRequest._retry = true;
        // SET REFRESHING FLAG
        isRefreshing = true;
        try {
          // ATTEMPT SILENT TOKEN REFRESH
          await apiClient.post("/user/refresh");
          // NOTIFY ALL QUEUED REQUESTS THAT TOKEN IS REFRESHED
          onTokenRefreshed();
          // RESET REFRESHING FLAG
          isRefreshing = false;
          // RETRY ORIGINAL REQUEST
          return apiClient(originalRequest);
        } catch (refreshError) {
          // RESET REFRESHING FLAG
          isRefreshing = false;
          // NOTIFY ALL QUEUED REQUESTS OF FAILURE
          refreshSubscribers.forEach((cb) => cb(refreshError as AxiosError));
          // CLEAR SUBSCRIBERS
          refreshSubscribers = [];
          // DISPATCH SESSION EXPIRED EVENT
          window.dispatchEvent(new CustomEvent("session-expired"));
          // RETURN REFRESH ERROR
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
