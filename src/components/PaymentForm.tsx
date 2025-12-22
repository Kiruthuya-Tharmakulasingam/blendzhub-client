"use client";

import * as React from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Lock } from "lucide-react";
import { paymentService } from "@/services/payment.service";

interface PaymentFormProps {
  bookingId: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function PaymentForm({
  bookingId,
  amount,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      // Confirm the payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?bookingId=${bookingId}`,
        },
        redirect: "if_required",
      });

      if (stripeError) {
        // Payment failed
        setErrorMessage(stripeError.message || "Payment failed. Please try again.");
        onError(stripeError.message || "Payment failed");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded, confirm with backend
        try {
          await paymentService.confirmPayment(paymentIntent.id, bookingId);
          onSuccess();
        } catch (confirmError) {
          console.error("Backend confirmation error:", confirmError);
          // Payment went through on Stripe, but backend confirmation failed
          // Still redirect to success as payment was processed
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      setErrorMessage(message);
      onError(message);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      )}

      <div className="space-y-4">
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full text-lg py-6"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-5 w-5" />
              Pay Rs. {amount.toLocaleString()}
            </>
          )}
        </Button>

        <div className="flex items-center justify-center text-sm text-muted-foreground">
          <Lock className="h-4 w-4 mr-1" />
          Secure payment powered by Stripe
        </div>
      </div>
    </form>
  );
}
