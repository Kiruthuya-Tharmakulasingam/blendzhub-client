import api from "./api";
import { ApiResponse } from "@/types/auth.types";
import { Service, CreateServiceRequest, UpdateServiceRequest } from "@/types/service.types";

export const serviceService = {
  async getServices(params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<Service[]>> {
    const response = await api.get<ApiResponse<Service[]>>("/api/services", { params });
    return response.data;
  },

  async getServiceById(id: string): Promise<ApiResponse<Service>> {
    const response = await api.get<ApiResponse<Service>>(`/api/services/${id}`);
    return response.data;
  },

  async createService(data: CreateServiceRequest): Promise<ApiResponse<Service>> {
    const response = await api.post<ApiResponse<Service>>("/api/services", data);
    return response.data;
  },

  async updateService(id: string, data: UpdateServiceRequest): Promise<ApiResponse<Service>> {
    const response = await api.put<ApiResponse<Service>>(`/api/services/${id}`, data);
    return response.data;
  },

  async deleteService(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/api/services/${id}`);
    return response.data;
  },
};
