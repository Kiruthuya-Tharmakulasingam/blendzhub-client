import api from "./api";
import {
  LoginRequest,
  RegisterCustomerRequest,
  RegisterOwnerRequest,
  AuthResponse,
  User,
} from "@/types/auth.types";

export const authService = {
  // Login
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/api/auth/login", credentials);
    
    if (response.data.token && response.data.data?.user) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },

  // Register Customer
  async registerCustomer(data: RegisterCustomerRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/api/auth/register/customer", data);
    
    if (response.data.token && response.data.data?.user) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },

  // Register Owner
  async registerOwner(data: RegisterOwnerRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/api/auth/register/owner", data);
    return response.data;
  },

  // Get current user
  async getMe(): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>("/api/auth/me");
    return response.data;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post("/api/auth/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  // Get stored user
  getStoredUser(): User | null {
    if (typeof window === "undefined") return null;
    
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Get stored token
  getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  },
};
