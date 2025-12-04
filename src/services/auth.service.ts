import api from "./api";
import {
  LoginRequest,
  RegisterCustomerRequest,
  RegisterOwnerRequest,
  AuthResponse,
  User,
} from "@/types/auth.types";

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      "/api/auth/login",
      credentials
    );

    return response.data;
  },

  async registerCustomer(data: RegisterCustomerRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      "/api/auth/register/customer",
      data
    );

    return response.data;
  },

  async registerOwner(data: RegisterOwnerRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      "/api/auth/register/owner",
      data
    );
    return response.data;
  },

  async getMe(): Promise<AuthResponse> {
    try {
      const response = await api.get<AuthResponse>("/api/auth/me", {
        // Don't throw errors for 401 - it's expected when not logged in
        validateStatus: (status) => status < 500,
      });
      
      // Handle 401 as expected (user not logged in)
      if (response.status === 401) {
        return {
          success: false,
          message: "Not authenticated",
        } as AuthResponse;
      }
      
      return response.data;
    } catch (error: any) {
      // Silently handle 401 errors - this is expected when not authenticated
      if (error.response?.status === 401 || error.isExpectedAuthCheck) {
        return {
          success: false,
          message: "Not authenticated",
        } as AuthResponse;
      }
      // Only throw non-401 errors
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post("/api/auth/logout");
    } finally {
    }
  },

  getStoredUser(): User | null {
    return null;
  },
};
