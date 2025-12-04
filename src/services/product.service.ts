import api from "./api";
import { ApiResponse } from "@/types/auth.types";
import { Product, CreateProductRequest, UpdateProductRequest } from "@/types/owner.types";

export const productService = {
  async getProducts(params?: { 
    page?: number; 
    limit?: number; 
    search?: string;
    salonId?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ApiResponse<Product[]>> {
    const response = await api.get<ApiResponse<Product[]>>("/api/products", { params });
    return response.data;
  },

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    const response = await api.get<ApiResponse<Product>>(`/api/products/${id}`);
    return response.data;
  },

  async createProduct(data: CreateProductRequest): Promise<ApiResponse<Product>> {
    const response = await api.post<ApiResponse<Product>>("/api/products", data);
    return response.data;
  },

  async updateProduct(id: string, data: UpdateProductRequest): Promise<ApiResponse<Product>> {
    const response = await api.put<ApiResponse<Product>>(`/api/products/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/api/products/${id}`);
    return response.data;
  },
};
