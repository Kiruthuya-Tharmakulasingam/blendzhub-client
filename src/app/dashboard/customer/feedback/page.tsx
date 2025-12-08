"use client";

// Customer Feedback Page - Route: /dashboard/customer/feedback
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star, MessageSquare, Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";
import { appointmentService } from "@/services/appointment.service";
import { feedbackService, Feedback } from "@/services/feedback.service";
import FeedbackFormModal from "@/components/FeedbackFormModal";
import { useAuth } from "@/hooks/useAuth";

interface Appointment {
  _id: string;
  salonId: string | { _id: string; name: string; location: string } | null;
  serviceId: string | { _id: string; name: string; price: number; duration?: number } | null;
  customerId: string | { _id: string; name: string; email: string } | null;
  date: string;
  status: string;
  notes?: string;
  createdAt: string;
}

// Helper functions to safely access nested properties
const getSalonName = (salonId: Appointment['salonId']): string => {
  try {
    if (!salonId || salonId === null) return "N/A";
    if (typeof salonId === 'string') return "N/A";
    if (typeof salonId !== 'object') return "N/A";
    const name = salonId?.name;
    if (name === null || name === undefined || name === '') return "N/A";
    return String(name);
  } catch (error) {
    console.error('Error getting salon name:', error);
    return "N/A";
  }
};

const getSalonLocation = (salonId: Appointment['salonId']): string => {
  try {
    if (!salonId || salonId === null) return "N/A";
    if (typeof salonId === 'string') return "N/A";
    if (typeof salonId !== 'object') return "N/A";
    const location = salonId?.location;
    if (location === null || location === undefined || location === '') return "N/A";
    return String(location);
  } catch (error) {
    console.error('Error getting salon location:', error);
    return "N/A";
  }
};

const getServiceName = (serviceId: Appointment['serviceId']): string => {
  try {
    if (!serviceId || serviceId === null) return "N/A";
    if (typeof serviceId === 'string') return "N/A";
    if (typeof serviceId !== 'object') return "N/A";
    const name = serviceId?.name;
    if (name === null || name === undefined || name === '') return "N/A";
    return String(name);
  } catch (error) {
    console.error('Error getting service name:', error);
    return "N/A";
  }
};

const getSalonIdValue = (salonId: Appointment['salonId']): string | null => {
  try {
    if (!salonId) return null;
    if (typeof salonId === 'string') return salonId;
    if (typeof salonId !== 'object' || salonId === null) return null;
    const id = salonId?._id ?? null;
    if (!id) return null;
    return String(id);
  } catch (error) {
    console.error('Error getting salon ID:', error);
    return null;
  }
};

export default function CustomerFeedbackPage() {
  const { user } = useAuth();
  const [completedBookings, setCompletedBookings] = useState<Appointment[]>([]);
  const [myFeedbacks, setMyFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Appointment | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchCompletedBookings(), fetchMyFeedbacks()]);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedBookings = async () => {
    try {
      const response = await appointmentService.getCompletedBookings();
      if (response.success && response.data) {
        setCompletedBookings(Array.isArray(response.data) ? response.data : []);
      } else {
        setCompletedBookings([]);
      }
    } catch (error) {
      console.error("Failed to fetch completed bookings:", error);
      setCompletedBookings([]);
    }
  };

  const fetchMyFeedbacks = async () => {
    try {
      const response = await feedbackService.getMyFeedbacks();
      if (response.success && response.data) {
        setMyFeedbacks(Array.isArray(response.data) ? response.data : []);
      } else {
        setMyFeedbacks([]);
      }
    } catch (error) {
      console.error("Failed to fetch feedbacks:", error);
      setMyFeedbacks([]);
    }
  };

  const getFeedbackForBooking = (bookingId: string): Feedback | undefined => {
    try {
      if (!bookingId || !myFeedbacks || !Array.isArray(myFeedbacks)) {
        return undefined;
      }
      return myFeedbacks.find((f) => {
        if (!f || !f.appointmentId) return false;
        const fAppId = f.appointmentId && typeof f.appointmentId === 'object' && f.appointmentId !== null
          ? f.appointmentId._id
          : f.appointmentId;
        return fAppId === bookingId;
      });
    } catch (error) {
      console.error('Error getting feedback for booking:', error);
      return undefined;
    }
  };

  const handleOpenFeedback = (booking: Appointment) => {
    setSelectedBooking(booking);
    setFeedbackModalOpen(true);
  };

  const handleSubmitFeedback = async (rating: number, comment: string) => {
    if (!selectedBooking || !user) return;

    try {
      setSubmittingFeedback(true);
      const salonId = getSalonIdValue(selectedBooking.salonId);
      if (!salonId) {
        toast.error("Invalid booking data");
        setSubmittingFeedback(false);
        return;
      }

      const response = await feedbackService.createFeedbackWithBooking({
        bookingId: selectedBooking._id,
        salonId,
        customerId: String(user._id),
        rating,
        comment: comment.trim() || undefined,
      });

      if (response.success) {
        toast.success("Feedback submitted successfully!");
        setFeedbackModalOpen(false);
        setSelectedBooking(null);
        await fetchData(); // Refresh both bookings and feedbacks
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      const errorMessage = apiError?.response?.data?.message || "Failed to submit feedback";
      toast.error(errorMessage);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <DashboardLayout role="customer">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">My Feedback</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">
              View completed bookings and manage your feedback
            </p>
          </div>

          {/* My Completed Bookings Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                My Completed Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading completed bookings...</div>
              ) : completedBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No completed bookings found</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Salon</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedBookings.map((booking) => {
                        const feedback = getFeedbackForBooking(booking._id);
                        return (
                          <TableRow key={booking._id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{getSalonName(booking.salonId)}</div>
                                <div className="text-sm text-muted-foreground flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {getSalonLocation(booking.salonId)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{getServiceName(booking.serviceId)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                {booking.date
                                  ? new Date(booking.date).toLocaleDateString()
                                  : "Invalid date"}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {feedback ? (
                                <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                                  Feedback Submitted
                                </div>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenFeedback(booking)}
                                >
                                  <Star className="h-4 w-4 mr-1" />
                                  Give Feedback
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Feedback Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                My Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading feedback...</div>
              ) : myFeedbacks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No feedback submitted yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myFeedbacks.map((feedback) => {
                    const salonName = typeof feedback.salonId === 'object' && feedback.salonId !== null
                      ? feedback.salonId.name
                      : "N/A";
                    const salonLocation = typeof feedback.salonId === 'object' && feedback.salonId !== null
                      ? feedback.salonId.location
                      : "N/A";

                    return (
                      <Card key={feedback._id} className="border-l-4 border-l-primary">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">{salonName}</h3>
                                <p className="text-sm text-muted-foreground flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {salonLocation}
                                </p>
                              </div>
                              <div className="text-right">
                                {renderStars(feedback.rating)}
                                <p className="text-xs text-muted-foreground mt-1">
                                  {feedback.createdAt
                                    ? new Date(feedback.createdAt).toLocaleDateString()
                                    : "Unknown date"}
                                </p>
                              </div>
                            </div>

                            {feedback.comments && (
                              <div>
                                <p className="text-sm font-medium mb-1">Your Comment:</p>
                                <p className="text-sm text-muted-foreground">{feedback.comments}</p>
                              </div>
                            )}

                            {feedback.reply && (
                              <div className="bg-muted p-4 rounded-md border-l-2 border-primary">
                                <p className="text-sm font-medium text-primary mb-1">
                                  Owner Reply:
                                </p>
                                <p className="text-sm text-muted-foreground">{feedback.reply}</p>
                                {feedback.repliedAt && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Replied on {new Date(feedback.repliedAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback Modal */}
          {selectedBooking && (
            <FeedbackFormModal
              open={feedbackModalOpen}
              onOpenChange={setFeedbackModalOpen}
              onSubmit={handleSubmitFeedback}
              salonName={getSalonName(selectedBooking.salonId)}
              submitting={submittingFeedback}
            />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

