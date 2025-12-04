import api from "./api";
import { ApiResponse } from "@/types/auth.types";

export interface Salon {
  _id: string;
  name: string;
  location: string;
  type: "men" | "women" | "unisex";
  ownerId: string;
  phone?: string;
  email?: string;
  openingHours?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSalonRequest {
  name?: string;
  location?: string;
  type?: "men" | "women" | "unisex";
  phone?: string;
  email?: string;
  openingHours?: string;
}

export interface CreateSalonRequest {
  name: string;
  location: string;
  type: "men" | "women" | "unisex";
  phone?: string;
  email?: string;
  openingHours?: string;
}

export const salonService = {
  async getSalons(params?: { page?: number; limit?: number }): Promise<ApiResponse<Salon[]>> {
    const response = await api.get<ApiResponse<Salon[]>>("/api/salons", { params });
    return response.data;
  },

  async getSalonById(id: string): Promise<ApiResponse<Salon>> {
    const response = await api.get<ApiResponse<Salon>>(`/api/salons/${id}`);
    return response.data;
  },

  async createSalon(data: CreateSalonRequest): Promise<ApiResponse<Salon>> {
    const response = await api.post<ApiResponse<Salon>>("/api/salons", data);
    return response.data;
  },

  async updateSalon(id: string, data: UpdateSalonRequest): Promise<ApiResponse<Salon>> {
    const response = await api.put<ApiResponse<Salon>>(`/api/salons/${id}`, data);
    return response.data;
  },
};
