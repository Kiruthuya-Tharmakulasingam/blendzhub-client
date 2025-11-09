import axios from "axios";

const API_URL =
  "https://express-mongo-connection-sigma.vercel.app/api/feedbacks";

export const getAllFeedbacks = async () => {
  const response = await axios.get(API_URL);
  console.log(response);
  return response.data.feedbacks;
};
