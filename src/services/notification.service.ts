import apiClient from "@/lib/apiClient";
import { ApiResponse } from "@/types/common";

export interface Notification {
  _id: string;
  userId: string;
  appointmentId: string | {
    _id: string;
    date: string;
    time: string;
    status: string;
  };
  type: "appointment_accepted" | "appointment_rejected" | "appointment_reminder" | "appointment_cancelled";
  message: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const notificationService = {
  async getNotifications(params?: { read?: boolean; limit?: number }): Promise<ApiResponse<{ data: Notification[]; unreadCount: number }>> {
    const response = await apiClient.get<ApiResponse<{ data: Notification[]; unreadCount: number }>>("/notifications", { params });
    return response.data;
  },

  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    const response = await apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead(): Promise<ApiResponse<void>> {
    const response = await apiClient.patch<ApiResponse<void>>("/notifications/read-all");
    return response.data;
  },

  async deleteNotification(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/notifications/${id}`);
    return response.data;
  },
};

