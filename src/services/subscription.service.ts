import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const subscriptionService = {
  getStatus: async () => {
    const response = await api.get("/subscriptions/status");
    return response.data;
  },

  createPaymentIntent: async (subscriptionId: string) => {
    const response = await api.post("/subscriptions/create-payment-intent", {
      subscriptionId,
    });
    return response.data;
  },

  confirmPayment: async (paymentIntentId: string, subscriptionId: string) => {
    const response = await api.post("/subscriptions/confirm-payment", {
      paymentIntentId,
      subscriptionId,
    });
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get("/subscriptions/history");
    return response.data;
  },
};
