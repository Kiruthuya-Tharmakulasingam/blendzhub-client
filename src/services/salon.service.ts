import apiClient from "@/lib/apiClient";
import { ApiResponse } from "@/types/common";
import { Salon, CreateSalonRequest, UpdateSalonRequest } from "@/types/salon.types";
import { AxiosError } from "axios";

const handleApiError = <T = unknown>(error: unknown): ApiResponse<T> => {
  if (error instanceof AxiosError) {
    // Network error or timeout
    if (!error.response) {
      return {
        success: false,
        message: error.code === "ECONNABORTED" 
          ? "Request timeout. Please try again."
          : "Network error. Please check your connection and try again.",
      };
    }
    
    // Server responded with error
    const errorMessage = error.response.data?.message || error.message || "An error occurred";
    return {
      success: false,
      message: errorMessage,
    };
  }
  
  // Unknown error
  return {
    success: false,
    message: "An unexpected error occurred. Please try again.",
  };
};

export const salonService = {
  async getSalons(params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    sortBy?: string; 
    sortOrder?: "asc" | "desc"; 
    type?: string;
  }): Promise<ApiResponse<Salon[]>> {
    try {
      const response = await apiClient.get<ApiResponse<Salon[]>>("/salons", { params });
      return response.data;
    } catch (error) {
      return handleApiError<Salon[]>(error);
    }
  },

  async getSalonById(id: string): Promise<ApiResponse<Salon>> {
    try {
      const response = await apiClient.get<ApiResponse<Salon>>(`/salons/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError<Salon>(error);
    }
  },

  async getMySalon(): Promise<ApiResponse<Salon>> {
    try {
      const response = await apiClient.get<ApiResponse<Salon>>("/owners/salon");
      return response.data;
    } catch (error) {
      return handleApiError<Salon>(error);
    }
  },

  async createSalon(data: CreateSalonRequest): Promise<ApiResponse<Salon>> {
    try {
      const response = await apiClient.post<ApiResponse<Salon>>("/salons", data);
      return response.data;
    } catch (error) {
      return handleApiError<Salon>(error);
    }
  },

  async updateSalon(id: string, data: UpdateSalonRequest): Promise<ApiResponse<Salon>> {
    try {
      const response = await apiClient.put<ApiResponse<Salon>>(`/salons/${id}`, data);
      return response.data;
    } catch (error) {
      return handleApiError<Salon>(error);
    }
  },

  async deleteSalon(id: string): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.delete<ApiResponse<null>>(`/salons/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError<null>(error);
    }
  },
};
