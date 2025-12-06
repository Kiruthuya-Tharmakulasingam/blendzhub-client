import apiClient from "@/lib/apiClient";
import { ApiResponse } from "@/types/common";
import { Equipment, CreateEquipmentRequest, UpdateEquipmentRequest } from "@/types/owner.types";

export const equipmentService = {
  async getEquipment(params?: { 
    page?: number; 
    limit?: number; 
    search?: string;
    salonId?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ApiResponse<Equipment[]>> {
    const response = await apiClient.get<ApiResponse<Equipment[]>>("/equipments", { params });
    return response.data;
  },

  async getEquipmentById(id: string): Promise<ApiResponse<Equipment>> {
    const response = await apiClient.get<ApiResponse<Equipment>>(`/equipments/${id}`);
    return response.data;
  },

  async createEquipment(data: CreateEquipmentRequest): Promise<ApiResponse<Equipment>> {
    const response = await apiClient.post<ApiResponse<Equipment>>("/equipments", data);
    return response.data;
  },

  async updateEquipment(id: string, data: UpdateEquipmentRequest): Promise<ApiResponse<Equipment>> {
    const response = await apiClient.patch<ApiResponse<Equipment>>(`/equipments/${id}`, data);
    return response.data;
  },

  async deleteEquipment(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/equipments/${id}`);
    return response.data;
  },
};
