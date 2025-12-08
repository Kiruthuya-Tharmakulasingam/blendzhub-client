import apiClient from "@/lib/apiClient";
import { ApiResponse } from "@/types/common";

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
    const response = await apiClient.get<ApiResponse<Feedback[]>>("/feedbacks", { params });
    return response.data;
  },

  async getFeedbackById(id: string): Promise<ApiResponse<Feedback>> {
    const response = await apiClient.get<ApiResponse<Feedback>>(`/feedbacks/${id}`);
    return response.data;
  },

  async createFeedback(data: {
    salonId: string;
    appointmentId?: string;
    rating: number;
    comments?: string;
  }): Promise<ApiResponse<Feedback>> {
    const response = await apiClient.post<ApiResponse<Feedback>>("/feedbacks", data);
    return response.data;
  },

  async replyToFeedback(id: string, reply: string): Promise<ApiResponse<Feedback>> {
    const response = await apiClient.put<ApiResponse<Feedback>>(`/feedbacks/${id}/reply`, { reply });
    return response.data;
  },

  async getMyFeedbacks(customerId?: string): Promise<ApiResponse<Feedback[]>> {
    const params = customerId ? { customerId } : {};
    const response = await apiClient.get<ApiResponse<Feedback[]>>("/feedbacks/my-feedbacks", { params });
    return response.data;
  },

  async createFeedbackWithBooking(data: {
    bookingId: string;
    salonId: string;
    customerId: string;
    rating: number;
    comment?: string;
  }): Promise<ApiResponse<Feedback>> {
    const response = await apiClient.post<ApiResponse<Feedback>>("/feedbacks/create", {
      appointmentId: data.bookingId,
      salonId: data.salonId,
      rating: data.rating,
      comments: data.comment,
    });
    return response.data;
  },
};
