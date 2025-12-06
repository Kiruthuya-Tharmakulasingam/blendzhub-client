import apiClient from "@/lib/apiClient";
import { ApiResponse } from "@/types/common";
import { User } from "@/types/user";

export type UsersResponse = ApiResponse<User[]>;

export const userService = {
  async getAllUsers(params?: { page?: number; limit?: number; search?: string }): Promise<UsersResponse> {
    const response = await apiClient.get<UsersResponse>("/admin/users", { params });
    return response.data;
  },

  async updateUserRole(userId: string, role: "admin" | "owner" | "customer"): Promise<ApiResponse<User>> {
    const response = await apiClient.put<ApiResponse<User>>(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/admin/users/${userId}`);
    return response.data;
  },
};
