import api from "./api";
import { Owner, ApiResponse } from "@/types/auth.types";

export const ownerService = {
  async getPendingOwners(page = 1, limit = 20): Promise<ApiResponse<Owner[]>> {
    const response = await api.get<ApiResponse<Owner[]>>(
      "/api/owners/pending",
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
    const response = await api.get<ApiResponse<Owner[]>>("/api/owners", {
      params,
    });
    return response.data;
  },

  async approveOwner(ownerId: string): Promise<ApiResponse<Owner>> {
    const response = await api.patch<ApiResponse<Owner>>(
      `/api/owners/${ownerId}/approve`
    );
    return response.data;
  },

  async rejectOwner(
    ownerId: string,
    reason?: string
  ): Promise<ApiResponse<Owner>> {
    const response = await api.patch<ApiResponse<Owner>>(
      `/api/owners/${ownerId}/reject`,
      {
        reason,
      }
    );
    return response.data;
  },

  async deleteOwner(ownerId: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(
      `/api/owners/${ownerId}`
    );
    return response.data;
  },
};
