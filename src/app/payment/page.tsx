"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PaymentForm from "@/components/PaymentForm";
import { paymentService } from "@/services/payment.service";
import { appointmentService } from "@/services/appointment.service";
import { Appointment } from "@/types/owner.types";
import { Loader2, ArrowLeft, Calendar, Clock, MapPin, CreditCard } from "lucide-react";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking] = React.useState<Appointment | null>(null);
  const [clientSecret, setClientSecret] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchBookingAndCreateIntent = React.useCallback(async () => {
    if (!bookingId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch booking details
      const bookingResponse = await appointmentService.getAppointmentById(bookingId);
      if (!bookingResponse.success || !bookingResponse.data) {
        throw new Error("Failed to fetch booking details");
      }

      setBooking(bookingResponse.data);

      // Check if booking is in correct status
      if (bookingResponse.data.status !== "pending_payment") {
        if (bookingResponse.data.paymentStatus === "paid") {
          toast.error("This booking has already been paid");
          router.push("/dashboard/customer/appointments");
          return;
        }
        throw new Error("This booking is not awaiting payment");
      }

      // Create payment intent
      const paymentResponse = await paymentService.createPaymentIntent(bookingId);
      if (!paymentResponse.success || !paymentResponse.data) {
        throw new Error("Failed to create payment intent");
      }

      setClientSecret(paymentResponse.data.clientSecret);
    } catch (err: unknown) {
      console.error("Payment setup error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to initialize payment";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [bookingId, router]);

  React.useEffect(() => {
    if (!bookingId) {
      setError("No booking ID provided");
      setLoading(false);
      return;
    }

    fetchBookingAndCreateIntent();
  }, [bookingId, fetchBookingAndCreateIntent]);

  const handlePaymentSuccess = () => {
    toast.success("Payment successful! Your booking is confirmed.");
    router.push(`/payment/success?bookingId=${bookingId}`);
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
  };

  const handleCancel = () => {
    router.push("/dashboard/customer/appointments");
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["customer"]}>
        <div className="flex min-h-screen flex-col bg-background font-sans home-theme">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading payment details...</p>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !booking || !clientSecret) {
    return (
      <ProtectedRoute allowedRoles={["customer"]}>
        <div className="flex min-h-screen flex-col bg-background font-sans home-theme">
          <Navbar />
          <main className="flex-1 flex items-center justify-center px-4">
            <Card className="max-w-md w-full p-8 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Payment Error</h2>
                <p className="text-muted-foreground mb-6">
                  {error || "Unable to load payment details"}
                </p>
              </div>
              <div className="space-y-3">
                <Button onClick={handleCancel} className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Appointments
                </Button>
              </div>
            </Card>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  const appearance = {
    theme: "stripe" as const,
    variables: {
      colorPrimary: "hsl(var(--primary))",
      colorBackground: "hsl(var(--background))",
      colorText: "hsl(var(--foreground))",
      colorDanger: "hsl(var(--destructive))",
      fontFamily: "system-ui, sans-serif",
      borderRadius: "0.5rem",
    },
  };

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <div className="flex min-h-screen flex-col bg-background font-sans home-theme">
        <Navbar />
        <main className="flex-1 py-12 px-4 sm:px-8 lg:px-16">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-3xl font-bold text-primary mb-2">
                Complete Your Payment
              </h1>
              <p className="text-muted-foreground">
                Secure payment powered by Stripe
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Booking Summary */}
              <div>
                <Card className="p-6 bg-gradient-to-br from-card to-surface border-border">
                  <h2 className="text-xl font-semibold mb-4 text-primary">
                    Booking Summary
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        {typeof booking.salonId === "object" ? booking.salonId.name : "Salon"}
                      </h3>
                      {typeof booking.salonId === "object" && booking.salonId.location && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                          {booking.salonId.location}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-border pt-4">
                      <h4 className="font-medium mb-2">Service</h4>
                      <p className="text-muted-foreground">
                        {typeof booking.serviceId === "object" ? booking.serviceId.name : "Service"}
                      </p>
                      {typeof booking.serviceId === "object" && booking.serviceId.duration && (
                        <p className="text-sm text-muted-foreground">
                          Duration: {booking.serviceId.duration} minutes
                        </p>
                      )}
                    </div>

                    <div className="border-t border-border pt-4">
                      <h4 className="font-medium mb-2">Appointment Details</h4>
                      <div className="space-y-2">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(booking.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2" />
                          {booking.time}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total Amount</span>
                        <span className="text-2xl font-bold text-primary">
                          Rs. {booking.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Payment Form */}
              <div>
                <Card className="p-6 bg-gradient-to-br from-card to-surface border-border">
                  <h2 className="text-xl font-semibold mb-4 text-primary">
                    Payment Details
                  </h2>
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                    <PaymentForm
                      bookingId={bookingId!}
                      amount={booking.amount}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </Elements>
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

export default function PaymentPage() {
  return (
    <React.Suspense fallback={
      <div className="flex min-h-screen flex-col bg-background font-sans home-theme">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading payment page...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <PaymentPageContent />
    </React.Suspense>
  );
}
