import apiClient from "@/lib/apiClient";
import { ApiResponse } from "@/types/common";
import { Appointment } from "@/types/owner.types";

export const appointmentService = {
  async getAppointments(params?: { 
    page?: number; 
    limit?: number; 
    status?: string; 
    date?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ApiResponse<Appointment[]>> {
    const response = await apiClient.get<ApiResponse<Appointment[]>>("/appointments", { params });
    return response.data;
  },

  async getAppointmentById(id: string): Promise<ApiResponse<Appointment>> {
    const response = await apiClient.get<ApiResponse<Appointment>>(`/appointments/${id}`);
    return response.data;
  },

  async createAppointment(data: {
    salonId: string;
    serviceId: string;
    date: string;
    time: string;
    notes?: string;
  }): Promise<ApiResponse<Appointment>> {
    const response = await apiClient.post<ApiResponse<Appointment>>("/appointments", data);
    return response.data;
  },

  async rescheduleAppointment(id: string, date: string, time: string): Promise<ApiResponse<Appointment>> {
    const response = await apiClient.put<ApiResponse<Appointment>>(`/appointments/${id}/reschedule`, { date, time });
    return response.data;
  },

  async updateAppointmentStatus(id: string, status: string): Promise<ApiResponse<Appointment>> {
    const response = await apiClient.patch<ApiResponse<Appointment>>(`/appointments/${id}/status`, { status });
    return response.data;
  },

  async cancelAppointment(id: string): Promise<ApiResponse<Appointment>> {
    const response = await apiClient.delete<ApiResponse<Appointment>>(`/appointments/${id}`);
    return response.data;
  },

  async getCompletedBookings(customerId?: string): Promise<ApiResponse<Appointment[]>> {
    const params = customerId ? { customerId } : {};
    const response = await apiClient.get<ApiResponse<Appointment[]>>("/bookings/completed", { params });
    return response.data;
  },

  async getSalonAppointmentsByDate(salonId: string, date: string): Promise<ApiResponse<Appointment[]>> {
    const response = await apiClient.get<ApiResponse<Appointment[]>>("/appointments", { 
      params: { salonId, date } 
    });
    return response.data;
  },
};
