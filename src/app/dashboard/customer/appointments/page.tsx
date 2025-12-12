"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
import { Calendar, MapPin, Clock, X, Star, CalendarClock, Bell, MessageSquare } from "lucide-react";
import Link from "next/link";
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
import { StatusBadge } from "@/components/ui/status-badge";

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

// Helper functions to safely access nested properties using optional chaining
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

const getServicePrice = (serviceId: Appointment['serviceId']): number => {
  try {
    if (!serviceId || serviceId === null) return 0;
    if (typeof serviceId === 'string') return 0;
    if (typeof serviceId !== 'object') return 0;
    const price = serviceId?.price;
    if (price === null || price === undefined) return 0;
    const numPrice = Number(price);
    return isNaN(numPrice) ? 0 : numPrice;
  } catch (error) {
    console.error('Error getting service price:', error);
    return 0;
  }
};

const getServiceDuration = (serviceId: Appointment['serviceId']): number => {
  try {
    if (!serviceId || serviceId === null) return 0;
    if (typeof serviceId === 'string') return 0;
    if (typeof serviceId !== 'object') return 0;
    const duration = serviceId?.duration;
    if (duration === null || duration === undefined) return 0;
    const numDuration = Number(duration);
    return isNaN(numDuration) ? 0 : numDuration;
  } catch (error) {
    console.error('Error getting service duration:', error);
    return 0;
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

const getServiceIdValue = (serviceId: Appointment['serviceId']): string | null => {
  try {
    if (!serviceId) return null;
    if (typeof serviceId === 'string') return serviceId;
    if (typeof serviceId !== 'object' || serviceId === null) return null;
    const id = serviceId?._id ?? null;
    if (!id) return null;
    return String(id);
  } catch (error) {
    console.error('Error getting service ID:', error);
    return null;
  }
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
        const validNotifications = (response.data.data || [])
          .filter((notif: Notification) => notif && notif._id && notif.message);
        setNotifications(validNotifications);
        setUnreadCount(response.data.unreadCount || 0);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
      fetchAppointments();
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getAppointments();
      if (response.success && response.data) {
        const appointmentsData = Array.isArray(response.data) ? response.data : [];
        type RawAppointment = Partial<Appointment> & { 
          _id?: string; 
          date?: string; 
          status?: Appointment['status']; 
          createdAt?: string;
        };
        const sanitizedAppointments = appointmentsData
          .filter((apt: RawAppointment) => apt && apt._id)
          .map((apt: RawAppointment): Appointment => {
            let salonId: Appointment['salonId'] = null;
            if (apt.salonId) {
              if (typeof apt.salonId === 'string') {
                salonId = apt.salonId;
              } else if (typeof apt.salonId === 'object' && apt.salonId !== null) {
                salonId = apt.salonId;
              }
            }

            let serviceId: Appointment['serviceId'] = null;
            if (apt.serviceId) {
              if (typeof apt.serviceId === 'string') {
                serviceId = apt.serviceId;
              } else if (typeof apt.serviceId === 'object' && apt.serviceId !== null) {
                serviceId = apt.serviceId;
              }
            }

            let customerId: Appointment['customerId'] = null;
            if (apt.customerId) {
              if (typeof apt.customerId === 'string') {
                customerId = apt.customerId;
              } else if (typeof apt.customerId === 'object' && apt.customerId !== null) {
                customerId = apt.customerId;
              }
            }

            return {
              _id: apt._id || '',
              salonId,
              serviceId,
              customerId,
              date: apt.date || new Date().toISOString(),
              status: apt.status || 'pending',
              notes: apt.notes,
              createdAt: apt.createdAt || new Date().toISOString(),
            };
          });
        setAppointments(sanitizedAppointments);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast.error("Failed to fetch appointments");
      setAppointments([]);
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

  const getFeedbackForAppointment = (appointmentId: string) => {
    try {
      if (!appointmentId || !feedbacks || !Array.isArray(feedbacks)) {
        return undefined;
      }
      return feedbacks.find((f) => {
        if (!f || !f.appointmentId) return false;
        const fAppId = f.appointmentId && typeof f.appointmentId === 'object' && f.appointmentId !== null
          ? f.appointmentId._id
          : f.appointmentId;
        return fAppId === appointmentId;
      });
    } catch (error) {
      console.error('Error getting feedback for appointment:', error);
      return undefined;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating
                ? "fill-warning text-warning"
                : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <div className="flex min-h-screen flex-col bg-background font-sans home-theme">
        <Navbar />

        <main className="flex-1 py-12 px-8 sm:px-16">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-primary">My Appointments</h1>
                <p className="text-muted-foreground mt-2">
                  View and manage your appointments
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/dashboard/customer/feedback">
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    My Feedback
                  </Button>
                </Link>
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
                {notifications.slice(0, 5).map((notification) => {
                  if (!notification || !notification._id || !notification.message) {
                    return null;
                  }
                  return (
                    <Card
                      key={notification._id}
                      className={`cursor-pointer transition-colors ${
                        !notification.read ? "bg-info/10 border-info/20" : ""
                      }`}
                      onClick={() => {
                        if (!notification.read && notification._id) {
                          markNotificationAsRead(notification._id);
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm ${!notification.read ? "font-semibold" : ""}`}>
                              {notification.message || "No message"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.createdAt 
                                ? new Date(notification.createdAt).toLocaleString()
                                : "Unknown date"}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-info rounded-full ml-2 mt-1" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">Loading appointments...</div>
            ) : filteredAppointments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground mb-4">No appointments found</p>
                  <Link href="/dashboard/customer">
                    <Button>Browse Salons</Button>
                  </Link>
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
                      .filter((appointment) => {
                        if (!appointment || !appointment._id) return false;
                        return true;
                      })
                      .map((appointment) => {
                        try {
                          const safeAppointment = {
                            ...appointment,
                            salonId: appointment.salonId ?? null,
                            serviceId: appointment.serviceId ?? null,
                            date: appointment.date ?? new Date().toISOString(),
                            status: appointment.status ?? 'pending' as const,
                          };

                          const feedback = getFeedbackForAppointment(safeAppointment._id);

                          return (
                            <TableRow key={safeAppointment._id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{getSalonName(safeAppointment.salonId)}</div>
                                  <div className="text-sm text-muted-foreground flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {getSalonLocation(safeAppointment.salonId)}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{getServiceName(safeAppointment.serviceId)}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Rs. {getServicePrice(safeAppointment.serviceId)} • {getServiceDuration(safeAppointment.serviceId)} min
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2" />
                                  {safeAppointment.date 
                                    ? new Date(safeAppointment.date).toLocaleString()
                                    : "Invalid date"}
                                </div>
                              </TableCell>
                              <TableCell>
                                <StatusBadge
                                  status={
                                    safeAppointment.status === "in-progress"
                                      ? "in-progress"
                                      : safeAppointment.status === "no-show"
                                      ? "no-show"
                                      : (safeAppointment.status as 
                                          | "pending"
                                          | "accepted"
                                          | "approved"
                                          | "rejected"
                                          | "cancelled"
                                          | "in-progress"
                                          | "completed"
                                          | "active"
                                          | "inactive"
                                          | "no-show")
                                  }
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                {safeAppointment.status === "pending" && (
                                  <div className="text-sm text-muted-foreground text-right">
                                    Waiting for salon confirmation
                                  </div>
                                )}
                                {safeAppointment.status === "rejected" && (
                                  <div className="text-sm text-destructive font-medium text-right">
                                    Appointment was rejected
                                  </div>
                                )}
                                {safeAppointment.status === "accepted" && (
                                  <div className="flex items-center gap-2 justify-end">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleOpenReschedule(safeAppointment)}
                                    >
                                      <CalendarClock className="h-4 w-4 mr-1" />
                                      Reschedule
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                      onClick={() => handleCancelAppointment(safeAppointment._id)}
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Cancel
                                    </Button>
                                  </div>
                                )}
                                {safeAppointment.status === "completed" && (
                                  <>
                                    {feedback ? (
                                      <div className="text-left space-y-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium">Your Feedback:</span>
                                          {renderStars(feedback.rating || 0)}
                                        </div>
                                        {feedback.comments && (
                                          <p className="text-sm text-muted-foreground">
                                            {feedback.comments}
                                          </p>
                                        )}
                                        {feedback.reply && (
                                          <div className="bg-muted p-2 rounded-md text-sm border-l-2 border-primary">
                                            <span className="font-medium text-primary">
                                              Owner Reply:
                                            </span>{" "}
                                            <span className="text-muted-foreground">
                                              {feedback.reply}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenFeedback(safeAppointment)}
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
                          );
                        } catch (error) {
                          console.error('Error rendering appointment:', error, appointment);
                          return (
                            <TableRow key={appointment._id || `error-${Math.random()}`}>
                              <TableCell colSpan={5} className="text-center text-red-500">
                                Error loading appointment data
                              </TableCell>
                            </TableRow>
                          );
                        }
                      })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </main>

        <Footer />

        {/* Feedback Modal */}
        <Dialog open={feedbackModalOpen} onOpenChange={setFeedbackModalOpen}>
          <DialogContent className="max-w-md home-theme text-foreground">
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
                            ? "fill-warning text-warning"
                            : "text-muted-foreground"
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
                  onClick={() => setFeedbackModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingFeedback}>
                  {submittingFeedback ? "Submitting..." : "Submit Feedback"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Reschedule Modal */}
        <Dialog open={rescheduleModalOpen} onOpenChange={setRescheduleModalOpen}>
          <DialogContent className="max-w-md home-theme text-foreground">
            <DialogHeader>
              <DialogTitle>Reschedule Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reschedule-date">New Date *</Label>
                <Input
                  id="reschedule-date"
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => {
                    setRescheduleDate(e.target.value);
                    setRescheduleTime("");
                    fetchRescheduleSlots(e.target.value);
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  max={(() => {
                    const maxDate = new Date();
                    maxDate.setDate(maxDate.getDate() + 30);
                    return maxDate.toISOString().split('T')[0];
                  })()}
                />
              </div>
              <div className="space-y-2">
                <Label>Available Time Slots *</Label>
                {!rescheduleDate ? (
                  <div className="text-sm text-muted-foreground p-4 border rounded-md bg-muted/50">
                    Please select a date to see available time slots
                  </div>
                ) : loadingSlots ? (
                  <div className="text-sm text-muted-foreground p-4 border rounded-md bg-muted/50 text-center">
                    Loading available slots...
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-4 border rounded-md bg-muted/50 text-center">
                    No available time slots for this date. Please try another date.
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
                        {slot.start} - {slot.end}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRescheduleModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleRescheduleSubmit}
                  disabled={!rescheduleDate || !rescheduleTime}
                >
                  Confirm Reschedule
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
