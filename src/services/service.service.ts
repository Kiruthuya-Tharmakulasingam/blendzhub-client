import apiClient from "@/lib/apiClient";
import { ApiResponse } from "@/types/common";
import { Service, CreateServiceRequest, UpdateServiceRequest } from "@/types/service.types";

export const serviceService = {
  async getServices(params?: { page?: number; limit?: number; search?: string; salonId?: string }): Promise<ApiResponse<Service[]>> {
    const response = await apiClient.get<ApiResponse<Service[]>>("/services", { params });
    return response.data;
  },

  async getServiceById(id: string, salonId?: string): Promise<ApiResponse<Service>> {
    const params = salonId ? { salonId } : {};
    const response = await apiClient.get<ApiResponse<Service>>(`/services/${id}`, { params });
    return response.data;
  },

  async createService(data: CreateServiceRequest): Promise<ApiResponse<Service>> {
    const response = await apiClient.post<ApiResponse<Service>>("/services", data);
    return response.data;
  },

  async updateService(id: string, data: UpdateServiceRequest): Promise<ApiResponse<Service>> {
    const response = await apiClient.put<ApiResponse<Service>>(`/services/${id}`, data);
    return response.data;
  },

  async deleteService(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/services/${id}`);
    return response.data;
  },
};
