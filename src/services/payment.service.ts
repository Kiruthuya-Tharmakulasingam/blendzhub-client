import apiClient from "@/lib/apiClient";
import { ApiResponse } from "@/types/common";
import { 
  PaymentIntent, 
  PaymentConfirmation
} from "@/types/payment.types";

export const paymentService = {
  async createPaymentIntent(bookingId: string): Promise<ApiResponse<PaymentIntent>> {
    const response = await apiClient.post<ApiResponse<PaymentIntent>>(
      "/payments/create-intent",
      { bookingId }
    );
    return response.data;
  },

  async confirmPayment(paymentIntentId: string, bookingId: string): Promise<ApiResponse<PaymentConfirmation>> {
    const response = await apiClient.post<ApiResponse<PaymentConfirmation>>(
      "/payments/confirm",
      { paymentIntentId, bookingId }
    );
    return response.data;
  },
};
