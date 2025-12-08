import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

// Extended config interface to include retry count
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  retryCount?: number;
}

// Ensure baseURL always ends with /api
const getBaseURL = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  // Remove trailing slash if present
  const cleanUrl = envUrl.replace(/\/$/, "");
  // Append /api if not already present
  return cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
};

// Increased timeout for production (30 seconds)
// Can be configured via environment variable
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000", 10);

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: API_TIMEOUT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

// Retry logic for network errors and timeouts
const shouldRetry = (error: AxiosError): boolean => {
  // Retry on network errors (no response) or timeout errors
  if (!error.response) {
    return true;
  }
  // Retry on 5xx errors (server errors)
  if (error.response.status >= 500 && error.response.status < 600) {
    return true;
  }
  return false;
};

// Add retry interceptor
apiClient.interceptors.request.use((config) => {
  // Add retry count to config if not present
  const extendedConfig = config as ExtendedAxiosRequestConfig;
  extendedConfig.retryCount = extendedConfig.retryCount || 0;
  return config;
});

// Request: Add token from cookies
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: Handle retry logic and 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as ExtendedAxiosRequestConfig | undefined;
    
    // Retry logic - retry on network errors, timeouts, or 5xx errors
    if (config && shouldRetry(error) && (config.retryCount || 0) < MAX_RETRIES) {
      // Increment retry count
      config.retryCount = (config.retryCount || 0) + 1;

      // Wait before retrying (exponential backoff)
      const delay = RETRY_DELAY * config.retryCount;
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry the request
      return apiClient(config);
    }

    // Handle 401 errors (after retries exhausted or not retryable)
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || "";
      // Don't redirect for /auth/me endpoint - it's expected to return 401 when not authenticated
      const isAuthMeEndpoint = requestUrl.includes("/auth/me");
      
      if (!isAuthMeEndpoint) {
        Cookies.remove("token");
        Cookies.remove("user");
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }
      // For /auth/me, we handle 401 gracefully - don't treat it as an error
      // The validateStatus in getCurrentUser should prevent this, but just in case
      if (isAuthMeEndpoint) {
        // Return a response object that matches axios response structure
        return Promise.resolve({
          status: 401,
          statusText: "Unauthorized",
          data: {
            success: false,
            message: "Not authenticated",
          },
          headers: error.response?.headers || {},
          config: error.config,
        });
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

