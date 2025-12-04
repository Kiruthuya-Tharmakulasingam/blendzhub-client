import api from "./api";
import { ApiResponse } from "@/types/auth.types";
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
    const response = await api.get<ApiResponse<Appointment[]>>("/api/appointments", { params });
    return response.data;
  },

  async getAppointmentById(id: string): Promise<ApiResponse<Appointment>> {
    const response = await api.get<ApiResponse<Appointment>>(`/api/appointments/${id}`);
    return response.data;
  },

  async createAppointment(data: {
    salonId: string;
    serviceId: string;
    date: string;
    time: string;
    notes?: string;
  }): Promise<ApiResponse<Appointment>> {
    const response = await api.post<ApiResponse<Appointment>>("/api/appointments", data);
    return response.data;
  },

  async rescheduleAppointment(id: string, date: string, time: string): Promise<ApiResponse<Appointment>> {
    const response = await api.put<ApiResponse<Appointment>>(`/api/appointments/${id}/reschedule`, { date, time });
    return response.data;
  },

  async updateAppointmentStatus(id: string, status: string): Promise<ApiResponse<Appointment>> {
    const response = await api.patch<ApiResponse<Appointment>>(`/api/appointments/${id}/status`, { status });
    return response.data;
  },

  async cancelAppointment(id: string): Promise<ApiResponse<Appointment>> {
    const response = await api.delete<ApiResponse<Appointment>>(`/api/appointments/${id}`);
    return response.data;
  },
};
