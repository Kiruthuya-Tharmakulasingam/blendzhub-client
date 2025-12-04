import api from "./api";
import { ApiResponse } from "@/types/auth.types";

export interface Feedback {
  _id: string;
  customerId: { _id: string; name: string; email: string };
  salonId: string | { _id: string; name: string; location: string };
  appointmentId?: string | { _id: string };
  comments?: string;
  rating: number;
  reply?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const feedbackService = {
  async getFeedbacks(params?: { 
    page?: number; 
    limit?: number; 
    salonId?: string;
    search?: string;
    rating?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ApiResponse<Feedback[]>> {
    const response = await api.get<ApiResponse<Feedback[]>>("/api/feedbacks", { params });
    return response.data;
  },

  async getFeedbackById(id: string): Promise<ApiResponse<Feedback>> {
    const response = await api.get<ApiResponse<Feedback>>(`/api/feedbacks/${id}`);
    return response.data;
  },

  async createFeedback(data: {
    salonId: string;
    appointmentId?: string;
    rating: number;
    comments?: string;
  }): Promise<ApiResponse<Feedback>> {
    const response = await api.post<ApiResponse<Feedback>>("/api/feedbacks", data);
    return response.data;
  },

  async replyToFeedback(id: string, reply: string): Promise<ApiResponse<Feedback>> {
    const response = await api.put<ApiResponse<Feedback>>(`/api/feedbacks/${id}/reply`, { reply });
    return response.data;
  },
};
