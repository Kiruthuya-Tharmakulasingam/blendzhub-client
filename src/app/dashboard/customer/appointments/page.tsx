"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, MapPin, Clock, X, Star, CalendarClock, Bell } from "lucide-react";
import { toast } from "sonner";
import { appointmentService } from "@/services/appointment.service";
import { feedbackService, Feedback } from "@/services/feedback.service";
import { slotService, TimeSlot } from "@/services/slot.service";
import { notificationService, Notification } from "@/services/notification.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface Appointment {
  _id: string;
  salonId: string | { _id: string; name: string; location: string } | null;
  serviceId: string | { _id: string; name: string; price: number; duration?: number } | null;
  customerId: string | { _id: string; name: string; email: string } | null;
  date: string;
  status: "pending" | "accepted" | "rejected" | "in-progress" | "completed" | "cancelled" | "no-show";
  notes?: string;
  createdAt: string;
}

// Helper functions to safely access nested properties
const getSalonName = (salonId: Appointment['salonId']): string => {
  try {
    if (!salonId) return "N/A";
    if (typeof salonId === 'string') return "N/A";
    if (typeof salonId !== 'object' || salonId === null) return "N/A";
    if (!('name' in salonId)) return "N/A";
    const name = salonId.name;
    if (name === null || name === undefined) return "N/A";
    return String(name);
  } catch {
    return "N/A";
  }
};

const getSalonLocation = (salonId: Appointment['salonId']): string => {
  try {
    if (!salonId) return "N/A";
    if (typeof salonId === 'string') return "N/A";
    if (typeof salonId !== 'object' || salonId === null) return "N/A";
    if (!('location' in salonId)) return "N/A";
    const location = salonId.location;
    if (location === null || location === undefined) return "N/A";
    return String(location);
  } catch {
    return "N/A";
  }
};

const getServiceName = (serviceId: Appointment['serviceId']): string => {
  try {
    if (!serviceId) return "N/A";
    if (typeof serviceId === 'string') return "N/A";
    if (typeof serviceId !== 'object' || serviceId === null) return "N/A";
    if (!('name' in serviceId)) return "N/A";
    const name = serviceId.name;
    if (name === null || name === undefined) return "N/A";
    return String(name);
  } catch {
    return "N/A";
  }
};

const getServicePrice = (serviceId: Appointment['serviceId']): number => {
  try {
    if (!serviceId) return 0;
    if (typeof serviceId === 'string') return 0;
    if (typeof serviceId !== 'object' || serviceId === null) return 0;
    if (!('price' in serviceId)) return 0;
    const price = serviceId.price;
    if (price === null || price === undefined) return 0;
    return Number(price) || 0;
  } catch {
    return 0;
  }
};

const getServiceDuration = (serviceId: Appointment['serviceId']): number => {
  try {
    if (!serviceId) return 0;
    if (typeof serviceId === 'string') return 0;
    if (typeof serviceId !== 'object' || serviceId === null) return 0;
    if (!('duration' in serviceId)) return 0;
    const duration = serviceId.duration;
    if (duration === null || duration === undefined) return 0;
    return Number(duration) || 0;
  } catch {
    return 0;
  }
};

const getSalonIdValue = (salonId: Appointment['salonId']): string | null => {
  if (!salonId) return null;
  if (typeof salonId === 'string') return salonId;
  if (typeof salonId !== 'object' || salonId === null) return null;
  if (!('_id' in salonId) || !salonId._id) return null;
  return String(salonId._id);
};

const getServiceIdValue = (serviceId: Appointment['serviceId']): string | null => {
  if (!serviceId) return null;
  if (typeof serviceId === 'string') return serviceId;
  if (typeof serviceId !== 'object' || serviceId === null) return null;
  if (!('_id' in serviceId) || !serviceId._id) return null;
  return String(serviceId._id);
};

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  
  // Feedback state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Reschedule state
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchFeedbacks();
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await feedbackService.getFeedbacks();
      if (response.success && response.data) {
        setFeedbacks(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch feedbacks", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getNotifications({ limit: 10 });
      if (response.success && response.data) {
        setNotifications(response.data.data || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
      fetchAppointments(); // Refresh appointments to show updated status
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getAppointments();
      if (response.success && response.data) {
        const appointmentsData = Array.isArray(response.data) ? response.data : [];
        // Sanitize appointments to ensure they have valid structure
        const sanitizedAppointments = appointmentsData.map((apt: any) => ({
          ...apt,
          salonId: apt.salonId || null,
          serviceId: apt.serviceId || null,
          customerId: apt.customerId || null,
        }));
        setAppointments(sanitizedAppointments);
      }
    } catch {
      toast.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const response = await appointmentService.cancelAppointment(id);
      if (response.success) {
        toast.success("Appointment cancelled successfully");
        fetchAppointments();
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      const errorMessage = apiError?.response?.data?.message || "Failed to cancel appointment";
      toast.error(errorMessage);
    }
  };

  const handleOpenReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleDate(new Date(appointment.date).toISOString().split('T')[0]);
    setRescheduleTime("");
    setAvailableSlots([]);
    setRescheduleModalOpen(true);
  };

  const fetchRescheduleSlots = async (date: string) => {
    if (!selectedAppointment || !date) return;

    try {
      setLoadingSlots(true);
      const salonId = getSalonIdValue(selectedAppointment.salonId);
      const serviceId = getServiceIdValue(selectedAppointment.serviceId);
      
      if (!salonId || !serviceId) {
        toast.error("Invalid appointment data");
        return;
      }
      
      const response = await slotService.getAvailableSlots(date, serviceId, salonId);
      setAvailableSlots(response.slots || []);
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError?.response?.data?.message || "Failed to fetch available slots");
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedAppointment || !rescheduleDate || !rescheduleTime) {
      toast.error("Please select a date and time");
      return;
    }

    try {
      const response = await appointmentService.rescheduleAppointment(
        selectedAppointment._id,
        rescheduleDate,
        rescheduleTime
      );
      
      if (response.success) {
        toast.success("Appointment rescheduled successfully!");
        setRescheduleModalOpen(false);
        fetchAppointments();
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      const errorMessage = apiError?.response?.data?.message || "Failed to reschedule appointment";
      toast.error(errorMessage);
    }
  };

  const handleOpenFeedback = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRating(5);
    setComments("");
    setFeedbackModalOpen(true);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedAppointment) return;

    if (!rating || rating < 1 || rating > 5) {
      toast.error("Please select a rating");
      return;
    }

    try {
      setSubmittingFeedback(true);
      const salonId = getSalonIdValue(selectedAppointment.salonId);
      if (!salonId) {
        toast.error("Invalid appointment data");
        setSubmittingFeedback(false);
        return;
      }
      
      const response = await feedbackService.createFeedback({
        salonId,
        appointmentId: selectedAppointment._id,
        rating,
        comments: comments.trim() || undefined,
      });
      
      if (response.success) {
        toast.success("Feedback submitted successfully!");
        setFeedbackModalOpen(false);
        setRating(5);
        setComments("");
        // Refresh both appointments and feedbacks
        await Promise.all([fetchAppointments(), fetchFeedbacks()]);
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      const errorMessage = apiError?.response?.data?.message || "Failed to submit feedback";
      toast.error(errorMessage);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === "all") return true;
    if (filter === "upcoming") {
      return apt.status === "pending" || apt.status === "accepted" || apt.status === "in-progress";
    }
    if (filter === "past") {
      return apt.status === "completed" || apt.status === "cancelled" || apt.status === "rejected";
    }
    return apt.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "accepted":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "in-progress":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getFeedbackForAppointment = (appointmentId: string) => {
    return feedbacks.find((f) => {
      const fAppId = f.appointmentId && typeof f.appointmentId === 'object' ? f.appointmentId._id : f.appointmentId;
      return fAppId === appointmentId;
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">My Appointments</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                View and manage your appointments
              </p>
            </div>
            <div className="flex items-center gap-4">
              {unreadCount > 0 && (
                <div className="relative">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
              )}
              <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            </div>
          </div>

          {/* Notifications Display */}
          {notifications.length > 0 && (
            <div className="space-y-2">
              {notifications.slice(0, 5).map((notification) => (
                <Card
                  key={notification._id}
                  className={`cursor-pointer transition-colors ${
                    !notification.read ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800" : ""
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      markNotificationAsRead(notification._id);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm ${!notification.read ? "font-semibold" : ""}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full ml-2 mt-1" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">Loading appointments...</div>
          ) : filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground mb-4">No appointments found</p>
                <Button onClick={() => (window.location.href = "/dashboard/customer/salons")}>
                  Browse Salons
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Salon</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments
                    .filter((appointment) => appointment && appointment._id) // Filter out invalid appointments
                    .map((appointment) => (
                    <TableRow key={appointment._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{getSalonName(appointment.salonId)}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {getSalonLocation(appointment.salonId)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{getServiceName(appointment.serviceId)}</div>
                          <div className="text-sm text-muted-foreground">
                            Rs. {getServicePrice(appointment.serviceId)} • {getServiceDuration(appointment.serviceId)} min
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {new Date(appointment.date).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {appointment.status === "pending" && (
                          <div className="text-sm text-muted-foreground text-right">
                            Waiting for salon confirmation
                          </div>
                        )}
                        {appointment.status === "rejected" && (
                          <div className="text-sm text-red-600 dark:text-red-400 font-medium text-right">
                            Appointment was rejected
                          </div>
                        )}
                        {appointment.status === "accepted" && (
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenReschedule(appointment)}
                            >
                              <CalendarClock className="h-4 w-4 mr-1" />
                              Reschedule
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500"
                              onClick={() => handleCancelAppointment(appointment._id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        )}
                        {appointment.status === "completed" && (
                          <>
                            {getFeedbackForAppointment(appointment._id) ? (
                              <div className="text-left space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Your Feedback:</span>
                                  {renderStars(
                                    getFeedbackForAppointment(appointment._id)!.rating
                                  )}
                                </div>
                                {getFeedbackForAppointment(appointment._id)!.comments && (
                                  <p className="text-sm text-muted-foreground">
                                    {getFeedbackForAppointment(appointment._id)!.comments}
                                  </p>
                                )}
                                {getFeedbackForAppointment(appointment._id)!.reply && (
                                  <div className="bg-muted p-2 rounded-md text-sm border-l-2 border-primary">
                                    <span className="font-medium text-primary">
                                      Owner Reply:
                                    </span>{" "}
                                    <span className="text-muted-foreground">
                                      {getFeedbackForAppointment(appointment._id)!.reply}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenFeedback(appointment)}
                                className="w-full sm:w-auto"
                              >
                                <Star className="h-4 w-4 mr-1" />
                                Leave Feedback
                              </Button>
                            )}
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <Dialog open={feedbackModalOpen} onOpenChange={setFeedbackModalOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  Leave Feedback for {selectedAppointment ? getSalonName(selectedAppointment.salonId) : 'Salon'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitFeedback(); }} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Rating *</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            star <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Very Good"}
                    {rating === 5 && "Excellent"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comments">Comments (Optional)</Label>
                  <Textarea
                    id="comments"
                    placeholder="Share your experience with this salon..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tell others about your experience at this salon
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFeedbackModalOpen(false);
                      setRating(5);
                      setComments("");
                    }}
                    disabled={submittingFeedback}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submittingFeedback || !rating}>
                    {submittingFeedback ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Reschedule Modal */}
          <Dialog open={rescheduleModalOpen} onOpenChange={setRescheduleModalOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Reschedule Appointment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="reschedule-date">New Date *</Label>
                  <Input
                    id="reschedule-date"
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => {
                      setRescheduleDate(e.target.value);
                      setRescheduleTime("");
                      if (e.target.value) {
                        fetchRescheduleSlots(e.target.value);
                      }
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    max={(() => {
                      const maxDate = new Date();
                      maxDate.setDate(maxDate.getDate() + 30);
                      return maxDate.toISOString().split('T')[0];
                    })()}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="reschedule-time">Available Time Slots *</Label>
                  {!rescheduleDate ? (
                    <div className="text-sm text-muted-foreground p-4 border rounded-md bg-muted/50">
                      Please select a date first
                    </div>
                  ) : loadingSlots ? (
                    <div className="text-sm text-muted-foreground p-4 border rounded-md bg-muted/50 text-center">
                      Loading available slots...
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-4 border rounded-md bg-muted/50 text-center">
                      No available time slots for this date
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setRescheduleTime(slot.start)}
                          className={`p-2 text-sm rounded-md border transition-colors ${
                            rescheduleTime === slot.start
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-muted border-border"
                          }`}
                        >
                          {slot.start}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setRescheduleModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRescheduleSubmit}
                  disabled={!rescheduleDate || !rescheduleTime}
                >
                  Confirm Reschedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
