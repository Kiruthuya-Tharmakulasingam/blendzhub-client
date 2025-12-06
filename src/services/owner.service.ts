import apiClient from "@/lib/apiClient";
import { ApiResponse } from "@/types/common";
import { Owner } from "@/types/user";

export const ownerService = {
  async getPendingOwners(page = 1, limit = 20): Promise<ApiResponse<Owner[]>> {
    const response = await apiClient.get<ApiResponse<Owner[]>>(
      "/owners/pending",
      {
        params: { page, limit },
      }
    );
    return response.data;
  },

  async getAllOwners(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<Owner[]>> {
    const response = await apiClient.get<ApiResponse<Owner[]>>("/owners", {
      params,
    });
    return response.data;
  },

  async approveOwner(ownerId: string): Promise<ApiResponse<Owner>> {
    const response = await apiClient.patch<ApiResponse<Owner>>(
      `/owners/${ownerId}/approve`
    );
    return response.data;
  },

  async rejectOwner(
    ownerId: string,
    reason?: string
  ): Promise<ApiResponse<Owner>> {
    const response = await apiClient.patch<ApiResponse<Owner>>(
      `/owners/${ownerId}/reject`,
      {
        reason,
      }
    );
    return response.data;
  },

  async deleteOwner(ownerId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/owners/${ownerId}`
    );
    return response.data;
  },
};
