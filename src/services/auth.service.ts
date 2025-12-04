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

    // Token is handled by HttpOnly cookie
    // localStorage.setItem("token", response.data.token);
    // localStorage.setItem("user", JSON.stringify(response.data.data.user));

    return response.data;
  },

  async registerCustomer(data: RegisterCustomerRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      "/api/auth/register/customer",
      data
    );

    // Token is handled by HttpOnly cookie
    // localStorage.setItem("token", response.data.token);
    // localStorage.setItem("user", JSON.stringify(response.data.data.user));

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
    const response = await api.get<AuthResponse>("/api/auth/me");
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post("/api/auth/logout");
    } finally {
      // localStorage.removeItem("token");
      // localStorage.removeItem("user");
    }
  },

  getStoredUser(): User | null {
    // User state is managed by AuthContext via getMe()
    return null;
  },
};
