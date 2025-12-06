import apiClient from "@/lib/apiClient";
import { ApiResponse } from "@/types/common";

export const uploadService = {
  async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append("image", file);
    
    const response = await apiClient.post<ApiResponse<{ url: string }>>("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    
    return response.data;
  },
};

