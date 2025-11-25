// services/appointment.ts
import api from "../lib/axios"; // your axios instance

export const getAllAppointments = async () => {
  const res = await api.get("/appointments");
  return res.data.data; // adjust based on your backend response
};

export const deleteAppointment = async (id: string) => {
  const res = await api.delete(`/appointments/${id}`);
  return res.data;
};
