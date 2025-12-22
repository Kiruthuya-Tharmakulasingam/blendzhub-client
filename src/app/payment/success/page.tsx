"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { appointmentService } from "@/services/appointment.service";
import { Appointment } from "@/types/owner.types";
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MapPin, 
  Loader2,
  ArrowRight 
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking] = React.useState<Appointment | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchBooking = React.useCallback(async () => {
    if (!bookingId) return;

    try {
      const response = await appointmentService.getAppointmentById(bookingId);
      if (response.success && response.data) {
        setBooking(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch booking:", error);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  React.useEffect(() => {
    if (bookingId) {
      fetchBooking();
    } else {
      setLoading(false);
    }
  }, [bookingId, fetchBooking]);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["customer"]}>
        <div className="flex min-h-screen flex-col bg-background font-sans home-theme">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <div className="flex min-h-screen flex-col bg-background font-sans home-theme">
        <Navbar />
        <main className="flex-1 py-12 px-4 sm:px-8 lg:px-16">
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 bg-gradient-to-br from-card to-surface border-border text-center">
              {/* Success Icon */}
              <div className="mb-6">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-primary mb-2">
                  Payment Successful!
                </h1>
                <p className="text-muted-foreground">
                  Your booking has been confirmed
                </p>
              </div>

              {booking && (
                <div className="space-y-6 text-left">
                  {/* Booking Details */}
                  <div className="border-t border-border pt-6">
                    <h2 className="text-xl font-semibold mb-4 text-primary">
                      Booking Details
                    </h2>
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {typeof booking.salonId === "object" ? booking.salonId.name : "Salon"}
                        </h3>
                        {typeof booking.salonId === "object" && booking.salonId.location && (
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {booking.salonId.location}
                          </div>
                        )}
                      </div>

                      <div className="border-t border-border pt-3">
                        <p className="text-sm text-muted-foreground mb-1">Service</p>
                        <p className="font-medium">
                          {typeof booking.serviceId === "object" ? booking.serviceId.name : "Service"}
                        </p>
                      </div>

                      <div className="border-t border-border pt-3">
                        <p className="text-sm text-muted-foreground mb-2">Appointment</p>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>
                              {new Date(booking.date).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{booking.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="border-t border-border pt-6">
                    <h2 className="text-xl font-semibold mb-4 text-primary">
                      Payment Details
                    </h2>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Amount Paid</span>
                        <span className="font-semibold text-lg">
                          Rs. {(booking.paymentAmount || booking.amount).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Payment Status</span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-500">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Paid
                        </span>
                      </div>
                      {booking.stripePaymentId && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Payment ID</span>
                          <span className="font-mono text-xs">
                            {booking.stripePaymentId.slice(0, 20)}...
                          </span>
                        </div>
                      )}
                      {booking.paidAt && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Payment Date</span>
                          <span>
                            {new Date(booking.paidAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="border-t border-border pt-6">
                    <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong>What&apos;s next?</strong> The salon will review your booking and confirm it shortly. 
                      You&apos;ll receive a notification once it&apos;s accepted.
                    </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 space-y-3">
                <Button
                  onClick={() => router.push("/dashboard/customer/appointments")}
                  className="w-full"
                  size="lg"
                >
                  View My Appointments
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => router.push("/dashboard/customer")}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Book Another Appointment
                </Button>
              </div>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

export default function PaymentSuccessPage() {
  return (
    <React.Suspense fallback={
      <div className="flex min-h-screen flex-col bg-background font-sans home-theme">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    }>
      <PaymentSuccessContent />
    </React.Suspense>
  );
}
