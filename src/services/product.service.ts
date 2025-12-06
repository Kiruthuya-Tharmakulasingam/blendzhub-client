import apiClient from "@/lib/apiClient";
import { ApiResponse } from "@/types/common";
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
    const response = await apiClient.get<ApiResponse<Product[]>>("/products", { params });
    return response.data;
  },

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },

  async createProduct(data: CreateProductRequest): Promise<ApiResponse<Product>> {
    const response = await apiClient.post<ApiResponse<Product>>("/products", data);
    return response.data;
  },

  async updateProduct(id: string, data: UpdateProductRequest): Promise<ApiResponse<Product>> {
    const response = await apiClient.patch<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/products/${id}`);
    return response.data;
  },
};
