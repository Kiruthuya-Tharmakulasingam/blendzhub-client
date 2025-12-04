import api from "./api";

export interface TimeSlot {
  start: string;
  end: string;
  covers: string[];
}

export interface AvailableSlotsResponse {
  slots: TimeSlot[];
  message?: string;
}

export const slotService = {
  async getAvailableSlots(date: string, serviceId: string, salonId?: string): Promise<AvailableSlotsResponse> {
    const params: { date: string; serviceId: string; salonId?: string } = { date, serviceId };
    if (salonId) {
      params.salonId = salonId;
    }
    const response = await api.get<AvailableSlotsResponse>("/api/slots", { params });
    return response.data;
  },
};

