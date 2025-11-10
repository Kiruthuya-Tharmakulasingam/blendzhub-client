import axios from "axios";

const API_URL = "https://express-mongo-connection-sigma.vercel.app/api/salons";

export const getAllSalons = async () => {
  const response = await axios.get(API_URL);
  console.log(response);
  return response.data.salons;
};
