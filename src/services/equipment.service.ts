import api from "./api";
import { ApiResponse } from "@/types/auth.types";
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
    const response = await api.get<ApiResponse<Equipment[]>>("/api/equipments", { params });
    return response.data;
  },

  async getEquipmentById(id: string): Promise<ApiResponse<Equipment>> {
    const response = await api.get<ApiResponse<Equipment>>(`/api/equipments/${id}`);
    return response.data;
  },

  async createEquipment(data: CreateEquipmentRequest): Promise<ApiResponse<Equipment>> {
    const response = await api.post<ApiResponse<Equipment>>("/api/equipments", data);
    return response.data;
  },

  async updateEquipment(id: string, data: UpdateEquipmentRequest): Promise<ApiResponse<Equipment>> {
    const response = await api.put<ApiResponse<Equipment>>(`/api/equipments/${id}`, data);
    return response.data;
  },

  async deleteEquipment(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/api/equipments/${id}`);
    return response.data;
  },
};
