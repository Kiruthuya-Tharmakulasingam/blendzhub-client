import apiClient from "@/lib/apiClient";
import Cookies from "js-cookie";
import { LoginCredentials, RegisterCustomerData, RegisterOwnerData, User, Customer, Owner } from "@/types/user";

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  data?: {
    user: User;
    customer?: Customer;
    owner?: Owner;
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  register: async (data: RegisterCustomerData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/register/customer", data);
    return response.data;
  },

  registerCustomer: async (data: RegisterCustomerData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/register/customer", data);
    return response.data;
  },

  registerOwner: async (data: RegisterOwnerData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/register/owner", data);
    return response.data;
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    // Check if token exists before making the request
    // This prevents unnecessary 401 errors in the console
    const token = Cookies.get("token");
    if (!token) {
      return {
        success: false,
        message: "Not authenticated",
      } as AuthResponse;
    }

    try {
      const response = await apiClient.get<AuthResponse>("/auth/me", {
        validateStatus: (status) => status < 500, // Don't treat 401 as error
      });
      
      // Handle 401 gracefully - this is expected when user is not authenticated
      if (response.status === 401) {
        // Clear invalid token
        Cookies.remove("token");
        return {
          success: false,
          message: "Not authenticated",
        } as AuthResponse;
      }
      
      return response.data;
    } catch (error: unknown) {
      // This catch block should rarely be hit due to validateStatus,
      // but handle it just in case
      const apiError = error as { response?: { status?: number } };
      if (apiError.response?.status === 401) {
        Cookies.remove("token");
        return {
          success: false,
          message: "Not authenticated",
        } as AuthResponse;
      }
      // Only log non-401 errors
      console.error("Unexpected error in getCurrentUser:", error);
      throw error;
    }
  },

  getMe: async (): Promise<AuthResponse> => {
    return authService.getCurrentUser();
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignore logout errors
    }
  },
};
