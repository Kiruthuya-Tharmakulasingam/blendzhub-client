import api from "./api";
import { User, ApiResponse } from "@/types/auth.types";

export interface UsersResponse extends ApiResponse<User[]> {}

export const userService = {
  async getAllUsers(params?: { page?: number; limit?: number; search?: string }): Promise<UsersResponse> {
    const response = await api.get<UsersResponse>("/api/admin/users", { params });
    return response.data;
  },

  async updateUserRole(userId: string, role: "admin" | "owner" | "customer"): Promise<ApiResponse<User>> {
    const response = await api.put<ApiResponse<User>>(`/api/admin/users/${userId}/role`, { role });
    return response.data;
  },

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/api/admin/users/${userId}`);
    return response.data;
  },
};
