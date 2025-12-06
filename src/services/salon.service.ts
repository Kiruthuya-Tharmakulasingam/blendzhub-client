import apiClient from "@/lib/apiClient";
import { ApiResponse } from "@/types/common";
import { Salon, CreateSalonRequest, UpdateSalonRequest } from "@/types/salon.types";

export const salonService = {
  async getSalons(params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    sortBy?: string; 
    sortOrder?: "asc" | "desc"; 
    type?: string;
  }): Promise<ApiResponse<Salon[]>> {
    const response = await apiClient.get<ApiResponse<Salon[]>>("/salons", { params });
    return response.data;
  },

  async getSalonById(id: string): Promise<ApiResponse<Salon>> {
    const response = await apiClient.get<ApiResponse<Salon>>(`/salons/${id}`);
    return response.data;
  },

  async createSalon(data: CreateSalonRequest): Promise<ApiResponse<Salon>> {
    const response = await apiClient.post<ApiResponse<Salon>>("/salons", data);
    return response.data;
  },

  async updateSalon(id: string, data: UpdateSalonRequest): Promise<ApiResponse<Salon>> {
    const response = await apiClient.patch<ApiResponse<Salon>>(`/salons/${id}`, data);
    return response.data;
  },
};
