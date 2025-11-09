import axios from "axios";

const API_URL =
  "https://express-mongo-connection-sigma.vercel.app/api/appointments";

export const getAllAppointments = async () => {
  const response = await axios.get(API_URL);
  console.log(response);
  return response.data.appointments;
};
