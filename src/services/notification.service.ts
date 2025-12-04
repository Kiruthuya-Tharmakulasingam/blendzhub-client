import api from "./api";
import { ApiResponse } from "@/types/auth.types";

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
    const response = await api.get<ApiResponse<{ data: Notification[]; unreadCount: number }>>("/api/notifications", { params });
    return response.data;
  },

  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    const response = await api.patch<ApiResponse<Notification>>(`/api/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead(): Promise<ApiResponse<void>> {
    const response = await api.patch<ApiResponse<void>>("/api/notifications/read-all");
    return response.data;
  },

  async deleteNotification(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/api/notifications/${id}`);
    return response.data;
  },
};

