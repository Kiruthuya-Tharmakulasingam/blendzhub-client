"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { salonService } from "@/services/salon.service";
import { serviceService } from "@/services/service.service";
import { appointmentService } from "@/services/appointment.service";
import { Salon } from "@/types/salon.types";
import { Service } from "@/types/service.types";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Calendar,
  RefreshCw,
  Check,
} from "lucide-react";
import { AxiosError } from "axios";
import { FilterAndSort } from "@/components/FilterAndSort";
import { Pagination } from "@/components/Pagination";
import { HeroSection } from "@/components/ui/hero-section";
import { AlertBanner } from "@/components/ui/alert-banner";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// Helper to generate time slots based on duration
interface GeneratedSlot {
  start: string;
  end: string;
  isBooked: boolean;
}

const generateTimeSlots = (
  totalDuration: number,
  bookedTimes: string[],
  openingTime: string = "09:00",
  closingTime: string = "18:00"
): GeneratedSlot[] => {
  const slots: GeneratedSlot[] = [];

  const [openHour, openMin] = openingTime.split(":").map(Number);
  const [closeHour, closeMin] = closingTime.split(":").map(Number);

  const openingMinutes = openHour * 60 + openMin;
  const closingMinutes = closeHour * 60 + closeMin;

  // Generate slots based on total duration
  const interval = totalDuration;

  for (
    let startMinutes = openingMinutes;
    startMinutes < closingMinutes;
    startMinutes += interval
  ) {
    const endMinutes = startMinutes + totalDuration;

    // Only include slots that end before or at closing time
    if (endMinutes <= closingMinutes) {
      const startHour = Math.floor(startMinutes / 60);
      const startMin = startMinutes % 60;
      const endHour = Math.floor(endMinutes / 60);
      const endMin = endMinutes % 60;

      const startTime = `${startHour.toString().padStart(2, "0")}:${startMin
        .toString()
        .padStart(2, "0")}`;
      const endTime = `${endHour.toString().padStart(2, "0")}:${endMin
        .toString()
        .padStart(2, "0")}`;

      // Check if this slot overlaps with any booked time
      const isBooked = bookedTimes.some((bookedTime) => {
        return startTime === bookedTime;
      });

      slots.push({
        start: startTime,
        end: endTime,
        isBooked,
      });
    }
  }

  return slots;
};

// Helper to check if date is a weekday (Mon-Fri)
const isWeekday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const day = date.getDay();
  return day !== 0 && day !== 6;
};

// Helper to get next weekday
const getNextWeekday = (date: Date): Date => {
  const day = date.getDay();
  if (day === 0) date.setDate(date.getDate() + 1);
  if (day === 6) date.setDate(date.getDate() + 2);
  return date;
};

// Format duration in a readable way
const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} hr${hours > 1 ? "s" : ""}`;
  return `${hours} hr${hours > 1 ? "s" : ""} ${mins} min`;
};

export default function CustomerPortal() {
  const { user } = useAuth();
  const router = useRouter();

  const [salons, setSalons] = React.useState<Salon[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(9);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterType, setFilterType] = React.useState<string>("");
  const [sortBy, setSortBy] = React.useState<string>("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  // Booking modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = React.useState(false);
  const [selectedSalon, setSelectedSalon] = React.useState<Salon | null>(null);
  const [services, setServices] = React.useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = React.useState<string[]>([]);
  const [generatedSlots, setGeneratedSlots] = React.useState<GeneratedSlot[]>(
    []
  );
  const [bookedTimes, setBookedTimes] = React.useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [bookingForm, setBookingForm] = React.useState({
    date: "",
    time: "",
    notes: "",
  });

  // Calculate total duration and price from selected services
  const selectedServiceDetails = React.useMemo(() => {
    const selected = services.filter((s) => selectedServices.includes(s._id));
    const totalDuration = selected.reduce(
      (sum, s) => sum + (s.duration || 0),
      0
    );
    const totalPrice = selected.reduce((sum, s) => sum + (s.price || 0), 0);
    return { selected, totalDuration, totalPrice };
  }, [services, selectedServices]);

  // Fetch booked appointments when date changes
  const fetchBookedSlots = React.useCallback(
    async (date: string, salonId: string) => {
      try {
        setLoadingSlots(true);
        const response = await appointmentService.getSalonAppointmentsByDate(
          salonId,
          date
        );
        if (response.success && response.data) {
          // Extract booked times from appointments (filter out cancelled/rejected)
          const times = response.data
            .filter(
              (apt) => apt.status !== "cancelled" && apt.status !== "rejected"
            )
            .map((apt) => apt.time)
            .filter(Boolean);
          setBookedTimes(times);
        } else {
          setBookedTimes([]);
        }
      } catch (error) {
        console.error("Failed to fetch booked slots:", error);
        setBookedTimes([]);
      } finally {
        setLoadingSlots(false);
      }
    },
    []
  );

  // Generate time slots when duration, date, or booked times change
  React.useEffect(() => {
    if (
      selectedServiceDetails.totalDuration > 0 &&
      bookingForm.date &&
      isWeekday(bookingForm.date)
    ) {
      const slots = generateTimeSlots(
        selectedServiceDetails.totalDuration,
        bookedTimes
      );
      setGeneratedSlots(slots);
    } else {
      setGeneratedSlots([]);
    }
  }, [selectedServiceDetails.totalDuration, bookingForm.date, bookedTimes]);

  React.useEffect(() => {
    fetchSalons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchQuery, filterType, sortBy, sortOrder]);

  const fetchSalons = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: {
        page: number;
        limit: number;
        sortBy: string;
        sortOrder: "asc" | "desc";
        search?: string;
        type?: string;
      } = {
        page,
        limit,
        sortBy,
        sortOrder,
      };
      if (searchQuery.trim()) {
        params.search = searchQuery;
      }
      if (filterType) {
        params.type = filterType;
      }
      const response = await salonService.getSalons(params);
      if (response.success && response.data) {
        setSalons(response.data);
        setTotal(response.total || 0);
        setTotalPages(response.totalPages || 0);
        setError(null);
      } else {
        setError(
          response.message || "Failed to load salons. Please try again."
        );
      }
    } catch (error: unknown) {
      console.error("Failed to fetch salons:", error);
      if (error instanceof AxiosError) {
        if (!error.response) {
          if (
            error.code === "ECONNABORTED" ||
            error.message?.includes("timeout")
          ) {
            setError(
              "Request took too long. Please check your internet connection and try again."
            );
          } else {
            setError(
              "Network error. Please check your internet connection and try again."
            );
          }
        } else {
          const status = error.response.status;
          if (status >= 500) {
            setError("Server error. Please try again later.");
          } else if (status === 404) {
            setError("Service unavailable. Please try again later.");
          } else {
            const errorMessage = (error.response.data as { message?: string })
              ?.message;
            setError(
              errorMessage || "Failed to load salons. Please try again."
            );
          }
        }
      } else {
        setError("Failed to load salons. Please try again.");
      }
      setSalons([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchServicesForSalon = async (salonId: string) => {
    try {
      const response = await serviceService.getServices({ salonId });
      if (response.success && response.data) {
        setServices(response.data);
      }
    } catch {
      toast.error("Failed to fetch services");
    }
  };

  const handleBookNow = (salon: Salon) => {
    setSelectedSalon(salon);
    fetchServicesForSalon(salon._id);
    setIsBookingModalOpen(true);
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      }
      return [...prev, serviceId];
    });
    // Reset time when services change
    setBookingForm((prev) => ({ ...prev, time: "" }));
  };

  const handleDateChange = async (date: string) => {
    // Check if it's a weekday
    if (date && !isWeekday(date)) {
      toast.error(
        "Please select a weekday (Monday to Friday). Weekends are not available."
      );
      return;
    }
    setBookingForm({ ...bookingForm, date, time: "" });

    // Fetch booked slots for this date
    if (date && selectedSalon) {
      await fetchBookedSlots(date, selectedSalon._id);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalon) return;

    if (
      selectedServices.length === 0 ||
      !bookingForm.date ||
      !bookingForm.time
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await appointmentService.createAppointment({
        salonId: selectedSalon._id,
        serviceId: selectedServices[0],
        date: bookingForm.date,
        time: bookingForm.time,
        notes:
          selectedServices.length > 1
            ? `Multiple services: ${selectedServiceDetails.selected
                .map((s) => s.name)
                .join(", ")}. ${bookingForm.notes}`.trim()
            : bookingForm.notes,
      });

      if (response.success) {
        toast.success("Appointment booked successfully!");
        setIsBookingModalOpen(false);
        resetBookingForm();
        router.push("/dashboard/customer/appointments");
      }
    } catch (error: unknown) {
      const apiError = error as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        apiError?.response?.data?.message ||
        apiError?.message ||
        "Failed to book appointment";
      toast.error(errorMessage);
      console.error("Booking error:", error);
    }
  };

  const resetBookingForm = () => {
    setBookingForm({
      date: "",
      time: "",
      notes: "",
    });
    setSelectedSalon(null);
    setServices([]);
    setSelectedServices([]);
    setGeneratedSlots([]);
    setBookedTimes([]);
  };

  // Calculate min date (next weekday)
  const minDate = React.useMemo(() => {
    const today = new Date();
    const nextWeekday = getNextWeekday(today);
    return nextWeekday.toISOString().split("T")[0];
  }, []);

  // Calculate max date (30 days from now)
  const maxDate = React.useMemo(() => {
    const max = new Date();
    max.setDate(max.getDate() + 30);
    return max.toISOString().split("T")[0];
  }, []);

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <div className="flex min-h-screen flex-col bg-background font-sans home-theme">
        <Navbar />

        <main className="flex-1">
          {/* Hero Section */}
          <HeroSection
            title={
              <>
                Welcome back, <br />
                <span className="text-primary">{user?.name || "Customer"}</span>
              </>
            }
            description="Browse top-rated salons and spas near you. Book appointments seamlessly and manage your beauty routine with BlendzHub."
            actions={
              <>
                <Button
                  size="lg"
                  className="text-base px-8"
                  onClick={() =>
                    router.push("/dashboard/customer/appointments")
                  }
                >
                  My Appointments
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base px-8 text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => router.push("/dashboard/customer/feedback")}
                >
                  My Feedbacks
                </Button>
              </>
            }
            image={{
              src:
                process.env.NEXT_PUBLIC_HERO_IMAGE_URL ||
                "https://res.cloudinary.com/dzu243cya/image/upload/v1765204576/blendzhub/hero-salon-image.jpg",
              alt: "Modern salon interior",
            }}
            background="gradient"
          />

          {/* Salons Section */}
          <section className="py-12 sm:py-20 px-4 sm:px-8 lg:px-16">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4 text-primary">
                  Discover Top Salons
                </h2>
                <p className="text-muted-foreground">
                  Find and book the perfect salon for your needs
                </p>
              </div>

              {/* Filter and Sort */}
              <FilterAndSort
                searchValue={searchQuery}
                onSearchChange={(value) => {
                  setSearchQuery(value);
                  setPage(1);
                }}
                searchPlaceholder="Search salons by name, location, or type..."
                showSearch={true}
                showFilter={true}
                filterLabel="Filter by Type"
                filterValue={filterType}
                filterOptions={[
                  { value: "men", label: "Men" },
                  { value: "women", label: "Women" },
                  { value: "unisex", label: "Unisex" },
                ]}
                onFilterChange={(value) => {
                  setFilterType(value);
                  setPage(1);
                }}
                showSort={true}
                sortLabel="Sort by"
                sortValue={sortBy}
                sortOptions={[
                  { value: "name", label: "Name" },
                  { value: "location", label: "Location" },
                  { value: "type", label: "Type" },
                  { value: "createdAt", label: "Date Added" },
                ]}
                onSortChange={(value) => {
                  setSortBy(value);
                  setPage(1);
                }}
                sortOrder={sortOrder}
                onSortOrderChange={(order) => {
                  setSortOrder(order);
                  setPage(1);
                }}
                triggerClassName="text-primary border-primary"
                inputClassName="text-foreground border-primary placeholder:text-primary"
                iconClassName="text-primary"
                limit={limit}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
              />

              {/* Salons Grid with Error Handling */}
              {error ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <AlertBanner
                    variant="error"
                    title="Unable to Load Salons"
                    description={error}
                    className="max-w-md w-full"
                  >
                    <Button
                      onClick={() => fetchSalons()}
                      variant="outline"
                      size="sm"
                      className="mt-4"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </AlertBanner>
                </div>
              ) : loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="p-6 bg-muted rounded-xl animate-pulse h-64"
                    />
                  ))}
                </div>
              ) : salons.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No salons available
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {salons.map((salon) => (
                      <Link
                        key={salon._id}
                        href={`/salons/${salon._id}`}
                        className="group p-6 bg-gradient-to-br from-card to-surface rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 block"
                      >
                        {salon.imageUrl && (
                          <div className="mb-4 rounded-lg overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={salon.imageUrl}
                              alt={salon.name}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          </div>
                        )}
                        <div className="mb-4">
                          <h3 className="text-xl font-semibold mb-2 group-hover:text-foreground/80 transition-colors text-primary">
                            {salon.name}
                          </h3>
                          <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            {salon.location}
                          </div>
                          <div className="inline-block px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium capitalize mb-3">
                            {salon.type}
                          </div>
                        </div>

                        <div className="space-y-2 text-sm mb-4">
                          {salon.phone && (
                            <div className="flex items-center text-muted-foreground">
                              <Phone className="h-4 w-4 mr-2" />
                              {salon.phone}
                            </div>
                          )}
                          {salon.email && (
                            <div className="flex items-center text-muted-foreground">
                              <Mail className="h-4 w-4 mr-2" />
                              <span className="truncate">{salon.email}</span>
                            </div>
                          )}
                          {salon.openingHours && (
                            <div className="flex items-start text-muted-foreground">
                              <Clock className="h-4 w-4 mr-2 mt-0.5" />
                              <span className="text-xs">
                                {salon.openingHours}
                              </span>
                            </div>
                          )}
                        </div>

                        <div
                          className="mt-4"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <Button
                            className="w-full"
                            size="lg"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleBookNow(salon);
                            }}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Book Now
                          </Button>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                      limit={limit}
                      total={total}
                    />
                  )}
                </>
              )}
            </div>
          </section>

          {/* Features Section */}
          <section className="py-12 sm:py-20 px-4 sm:px-8 lg:px-16 bg-surface">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4 text-primary">
                  Why Choose BlendzHub?
                </h2>
                <p className="text-muted-foreground">
                  Everything you need for a perfect salon experience
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Easy Booking",
                    description:
                      "Book appointments 24/7 with instant confirmation.",
                  },
                  {
                    title: "Top Professionals",
                    description:
                      "Connect with verified and rated beauty experts.",
                  },
                  {
                    title: "Manage Schedule",
                    description: "Reschedule or cancel appointments with ease.",
                  },
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="p-8 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-xl font-semibold mb-3 text-primary">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />

        {/* Enhanced Booking Modal */}
        <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
          <DialogContent className="max-w-7xl w-[95vw] min-w-[50vw] home-theme max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Book Appointment at {selectedSalon?.name}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleBookingSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-[2fr_auto_1fr] gap-6">
                {/* Left Column: Selection */}
                <div className="space-y-6">
                  {/* Services Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">
                      Select Services *
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Choose one or more services
                    </p>
                    <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                      {services.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Loading services...
                        </p>
                      ) : (
                        services.map((service) => (
                          <label
                            key={service._id}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedServices.includes(service._id)
                                ? "bg-primary/10 border-primary"
                                : "bg-background border-border hover:bg-muted/50"
                            }`}
                          >
                            <Checkbox
                              checked={selectedServices.includes(service._id)}
                              onCheckedChange={() =>
                                handleServiceToggle(service._id)
                              }
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <div className="flex-1">
                              <div className="font-medium">{service.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Rs. {service.price} • {service.duration} min
                              </div>
                            </div>
                            {selectedServices.includes(service._id) && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-base font-semibold">
                      Select Date *
                    </Label>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Monday to Friday only (Weekends unavailable)
                    </p>
                    <Input
                      id="date"
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      min={minDate}
                      max={maxDate}
                      required
                      className="w-full"
                    />
                    {bookingForm.date && !isWeekday(bookingForm.date) && (
                      <p className="text-sm text-destructive font-medium">
                        ⚠️ Weekends are not available. Please select a weekday.
                      </p>
                    )}
                  </div>

                  {/* Time Slots */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Select Time Slot *
                    </Label>
                    {selectedServices.length === 0 ? (
                      <div className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/50 text-center">
                        Please select at least one service first
                      </div>
                    ) : !bookingForm.date ? (
                      <div className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/50 text-center">
                        Please select a date to see available time slots
                      </div>
                    ) : loadingSlots ? (
                      <div className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/50 text-center">
                        <div className="animate-pulse">
                          Loading available slots...
                        </div>
                      </div>
                    ) : generatedSlots.length === 0 ? (
                      <div className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/50 text-center">
                        No time slots available. The selected services require{" "}
                        {formatDuration(selectedServiceDetails.totalDuration)}.
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Working hours: 9:00 AM – 6:00 PM • Duration:{" "}
                          {formatDuration(selectedServiceDetails.totalDuration)}
                        </p>
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 max-h-56 overflow-y-auto p-2 border rounded-lg">
                          {generatedSlots.map((slot, index) => (
                            <button
                              key={index}
                              type="button"
                              disabled={slot.isBooked}
                              onClick={() =>
                                !slot.isBooked &&
                                setBookingForm({
                                  ...bookingForm,
                                  time: slot.start,
                                })
                              }
                              className={`p-3 text-sm rounded-lg border transition-all ${
                                slot.isBooked
                                  ? "bg-muted/70 text-muted-foreground/50 cursor-not-allowed border-muted line-through opacity-60"
                                  : bookingForm.time === slot.start
                                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                                  : "bg-background hover:bg-muted border-border hover:border-primary/50"
                              }`}
                              title={
                                slot.isBooked
                                  ? "This slot is already booked"
                                  : `Book ${slot.start} – ${slot.end}`
                              }
                            >
                              <span className="font-medium">{slot.start}</span>
                              <span className="text-xs opacity-80">
                                {" "}
                                – {slot.end}
                              </span>
                              {slot.isBooked && (
                                <span className="block text-xs mt-1">
                                  Booked
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="hidden md:block w-px border-r border-dashed border-border h-full mx-auto"></div>

                {/* Right Column: Details & Summary */}
                <div className="space-y-6 flex flex-col h-full">
                  <div className="flex-1 space-y-6">
                    {/* Selected Time Slot Display */}
                    {bookingForm.time && (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
                        <Label className="text-sm text-muted-foreground block mb-1">
                          Selected Time Slot
                        </Label>
                        <div className="text-xl font-bold text-primary flex items-center justify-center gap-2">
                          <Clock className="h-5 w-5" />
                          {bookingForm.time} –{" "}
                          {
                            generatedSlots.find(
                              (s) => s.start === bookingForm.time
                            )?.end
                          }
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="notes"
                        className="text-base font-semibold"
                      >
                        Notes (Optional)
                      </Label>
                      <Textarea
                        id="notes"
                        value={bookingForm.notes}
                        onChange={(e) =>
                          setBookingForm({
                            ...bookingForm,
                            notes: e.target.value,
                          })
                        }
                        placeholder="Any special requests?"
                        className="min-h-[120px] resize-none"
                      />
                    </div>

                    {/* Price Summary */}
                    {selectedServices.length > 0 && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-3 mt-auto">
                        <h4 className="font-semibold text-primary mb-2">
                          Booking Summary
                        </h4>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Selected Services:
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {selectedServices.length} service
                            {selectedServices.length > 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Total Duration:
                          </span>
                          <span className="text-sm font-semibold text-primary">
                            {formatDuration(
                              selectedServiceDetails.totalDuration
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-t border-primary/20 pt-3 mt-2">
                          <span className="font-medium text-lg">
                            Total Price:
                          </span>
                          <span className="font-bold text-2xl text-primary">
                            Rs. {selectedServiceDetails.totalPrice}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t mt-auto">
                    <Button
                      type="submit"
                      className="flex-1 h-12 text-base"
                      disabled={
                        selectedServices.length === 0 ||
                        !bookingForm.date ||
                        !bookingForm.time
                      }
                    >
                      Confirm Booking
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 px-6"
                      onClick={() => {
                        setIsBookingModalOpen(false);
                        resetBookingForm();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
