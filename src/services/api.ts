import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://blendz-hub-api.vercel.app";

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor removed as we are using cookies
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Suppress 401 errors for /api/auth/me endpoint as it's expected when not authenticated
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      if (url.includes("/api/auth/me")) {
        // Silently handle 401 for auth check - this is expected when not logged in
        // Mark this error as expected to prevent unnecessary logging
        error.isExpectedAuthCheck = true;
        // Suppress console error for this specific case
        if (typeof window !== "undefined" && window.console) {
          const originalError = console.error;
          console.error = () => {}; // Temporarily suppress
          setTimeout(() => {
            console.error = originalError; // Restore after a tick
          }, 0);
        }
        return Promise.reject(error);
      }
      if (typeof window !== "undefined") {
        // Optional: Redirect to login if needed, but avoid loops
        // window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
