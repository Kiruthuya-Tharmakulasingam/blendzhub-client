import apiClient from "@/lib/apiClient";
import { ApiResponse } from "@/types/common";
import { User } from "@/types/user";

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  image?: string;
}

export const profileService = {
  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<User>> {
    const response = await apiClient.put<ApiResponse<User>>("/profile", data);
    return response.data;
  },

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>("/profile");
    return response.data;
  },
};

