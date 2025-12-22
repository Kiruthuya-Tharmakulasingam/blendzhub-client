export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
}

export interface PaymentConfirmation {
  success: boolean;
  message: string;
  data: {
    _id: string;
    status: string;
    paymentStatus: string;
    paidAt: string;
    stripePaymentId: string;
    paymentAmount: number;
  };
}

export interface CreatePaymentIntentRequest {
  bookingId: string;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  bookingId: string;
}
