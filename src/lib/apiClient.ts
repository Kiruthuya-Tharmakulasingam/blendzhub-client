import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

// Extended config interface to include retry count
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  retryCount?: number;
}

// Always use the full backend URL from environment variable
// Vercel rewrites don't work for external domains, so we need to use the full URL
const getBaseURL = () => {
  // Client-side: use relative path to leverage Next.js rewrites
  if (typeof window !== "undefined") {
    return "/api";
  }

  // Server-side: use full URL
  const isProd = process.env.NODE_ENV === "production";
  let envUrl = process.env.NEXT_PUBLIC_API_URL;
  const fallbackUrl = "https://blendz-hub-api.vercel.app";

  // Fix for Vercel deployment redirect loop
  if (isProd) {
    // If env var is missing, or points to the client itself (causing loop), use fallback
    if (!envUrl || envUrl.includes("blendzhub-client")) {
      envUrl = fallbackUrl;
    }
  } else {
    // Default to localhost for dev if still not set
    if (!envUrl) {
      envUrl = "http://localhost:5000";
    }
  }

  const cleanUrl = envUrl.replace(/\/$/, "");
  return cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
};

// Increased timeout for production (30 seconds)
// Can be configured via environment variable
const API_TIMEOUT = parseInt(
  process.env.NEXT_PUBLIC_API_TIMEOUT || "30000",
  10
);

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
    if (
      config &&
      shouldRetry(error) &&
      (config.retryCount || 0) < MAX_RETRIES
    ) {
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
      // Don't redirect for /profile endpoint - let the component handle the error
      const isProfileEndpoint = requestUrl.includes("/profile");
      // Don't redirect for /auth/login - user is already on login page
      const isLoginEndpoint = requestUrl.includes("/auth/login");

      // Only clear cookies and redirect for protected endpoints that require auth
      if (!isAuthMeEndpoint && !isProfileEndpoint && !isLoginEndpoint) {
        // Clear cookies only when authentication is actually invalid
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
