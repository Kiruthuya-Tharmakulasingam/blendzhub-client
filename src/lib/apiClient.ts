import axios from "axios";
import Cookies from "js-cookie";

// Ensure baseURL always ends with /api
const getBaseURL = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  // Remove trailing slash if present
  const cleanUrl = envUrl.replace(/\/$/, "");
  // Append /api if not already present
  return cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request: Add token from cookies
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: Handle 401, network errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
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

