import axios from "axios";

const API_URL =
  "https://express-mongo-connection-sigma.vercel.app/api/products";

export const getAllProducts = async () => {
  const response = await axios.get(API_URL);
  console.log(response);
  return response.data.products;
};
