"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { salonService } from "@/services/salon.service";
import { Salon } from "@/types/salon.types";
import { serviceService } from "@/services/service.service";
import { Service } from "@/types/service.types";
import { appointmentService } from "@/services/appointment.service";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Clock, Calendar, RefreshCw, Check } from "lucide-react";
import { FilterAndSort } from "@/components/FilterAndSort";
import { Pagination } from "@/components/Pagination";
import { AlertBanner } from "@/components/ui/alert-banner";

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
  
  const interval = 30;
  
  for (let startMinutes = openingMinutes; startMinutes < closingMinutes; startMinutes += interval) {
    const endMinutes = startMinutes + totalDuration;
    
    if (endMinutes <= closingMinutes) {
      const startHour = Math.floor(startMinutes / 60);
      const startMin = startMinutes % 60;
      const endHour = Math.floor(endMinutes / 60);
      const endMin = endMinutes % 60;
      
      const startTime = `${startHour.toString().padStart(2, "0")}:${startMin.toString().padStart(2, "0")}`;
      const endTime = `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`;
      
      const isBooked = bookedTimes.some(bookedTime => startTime === bookedTime);
      
      slots.push({
        start: startTime,
        end: endTime,
        isBooked,
      });
    }
  }
  
  return slots;
};

const isWeekday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const day = date.getDay();
  return day !== 0 && day !== 6;
};

const getNextWeekday = (date: Date): Date => {
  const day = date.getDay();
  if (day === 0) date.setDate(date.getDate() + 1);
  if (day === 6) date.setDate(date.getDate() + 2);
  return date;
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} hr${hours > 1 ? "s" : ""}`;
  return `${hours} hr${hours > 1 ? "s" : ""} ${mins} min`;
};

export default function BrowseSalonsPage() {
  const router = useRouter();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [generatedSlots, setGeneratedSlots] = useState<GeneratedSlot[]>([]);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    date: "",
    time: "",
    notes: "",
  });

  // Pagination, filtering, and sorting state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Calculate total duration and price from selected services
  const selectedServiceDetails = useMemo(() => {
    const selected = services.filter((s) => selectedServices.includes(s._id));
    const totalDuration = selected.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalPrice = selected.reduce((sum, s) => sum + (s.price || 0), 0);
    return { selected, totalDuration, totalPrice };
  }, [services, selectedServices]);

  // Fetch booked appointments when date changes
  const fetchBookedSlots = useCallback(async (date: string, salonId: string) => {
    try {
      setLoadingSlots(true);
      const response = await appointmentService.getSalonAppointmentsByDate(salonId, date);
      if (response.success && response.data) {
        const times = response.data
          .filter(apt => apt.status !== 'cancelled' && apt.status !== 'rejected')
          .map(apt => apt.time)
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
  }, []);

  // Generate time slots when duration, date, or booked times change
  useEffect(() => {
    if (selectedServiceDetails.totalDuration > 0 && bookingForm.date && isWeekday(bookingForm.date)) {
      const slots = generateTimeSlots(selectedServiceDetails.totalDuration, bookedTimes);
      setGeneratedSlots(slots);
    } else {
      setGeneratedSlots([]);
    }
  }, [selectedServiceDetails.totalDuration, bookingForm.date, bookedTimes]);

  useEffect(() => {
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
      } else {
        setError(response.message || "Failed to load salons.");
      }
    } catch {
      setError("Failed to fetch salons");
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
    setBookingForm((prev) => ({ ...prev, time: "" }));
  };

  const handleDateChange = async (date: string) => {
    if (date && !isWeekday(date)) {
      toast.error("Please select a weekday (Monday to Friday). Weekends are not available.");
      return;
    }
    setBookingForm({ ...bookingForm, date, time: "" });
    
    if (date && selectedSalon) {
      await fetchBookedSlots(date, selectedSalon._id);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalon) return;

    if (selectedServices.length === 0 || !bookingForm.date || !bookingForm.time) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await appointmentService.createAppointment({
        salonId: selectedSalon._id,
        serviceId: selectedServices[0],
        date: bookingForm.date,
        time: bookingForm.time,
        notes: selectedServices.length > 1 
          ? `Multiple services: ${selectedServiceDetails.selected.map(s => s.name).join(", ")}. ${bookingForm.notes}`.trim()
          : bookingForm.notes,
      });

      if (response.success) {
        toast.success("Appointment booked successfully!");
        setIsBookingModalOpen(false);
        resetBookingForm();
        router.push("/dashboard/customer/appointments");
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
      const errorMessage = apiError?.response?.data?.message || apiError?.message || "Failed to book appointment";
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

  const minDate = useMemo(() => {
    const today = new Date();
    const nextWeekday = getNextWeekday(today);
    return nextWeekday.toISOString().split("T")[0];
  }, []);

  const maxDate = useMemo(() => {
    const max = new Date();
    max.setDate(max.getDate() + 30);
    return max.toISOString().split("T")[0];
  }, []);

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <div className="flex min-h-screen flex-col bg-background font-sans home-theme">
        <Navbar />

        <main className="flex-1 py-12 px-8 sm:px-16">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">Browse Salons</h1>
              <p className="text-muted-foreground mt-2">
                Browse and book appointments at top-rated salons
              </p>
            </div>

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
                              (e.target as HTMLImageElement).style.display = "none";
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
                            <span className="text-xs">{salon.openingHours}</span>
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
        </main>

        <Footer />

        {/* Enhanced Booking Modal */}
        <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
          <DialogContent className="max-w-lg home-theme max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Book Appointment at {selectedSalon?.name}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleBookingSubmit} className="space-y-6">
              {/* Services Selection with Checkboxes */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Select Services *</Label>
                <p className="text-sm text-muted-foreground">
                  Choose one or more services
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
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
                          onCheckedChange={() => handleServiceToggle(service._id)}
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

                {/* Total Duration and Price */}
                {selectedServices.length > 0 && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Selected Services:</span>
                      <span className="text-sm text-muted-foreground">
                        {selectedServices.length} service{selectedServices.length > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Duration:</span>
                      <span className="text-sm font-semibold text-primary">
                        {formatDuration(selectedServiceDetails.totalDuration)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-primary/20 pt-2 mt-2">
                      <span className="font-medium">Total Price:</span>
                      <span className="font-bold text-lg text-primary">
                        Rs. {selectedServiceDetails.totalPrice}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Date Selection - Weekdays Only */}
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
                <Label className="text-base font-semibold">Select Time Slot *</Label>
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
                    <div className="animate-pulse">Loading available slots...</div>
                  </div>
                ) : generatedSlots.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/50 text-center">
                    No time slots available. The selected services require {formatDuration(selectedServiceDetails.totalDuration)}.
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Working hours: 9:00 AM – 6:00 PM • Duration: {formatDuration(selectedServiceDetails.totalDuration)}
                    </p>
                    <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-2 border rounded-lg">
                      {generatedSlots.map((slot, index) => (
                        <button
                          key={index}
                          type="button"
                          disabled={slot.isBooked}
                          onClick={() => !slot.isBooked && setBookingForm({ ...bookingForm, time: slot.start })}
                          className={`p-3 text-sm rounded-lg border transition-all ${
                            slot.isBooked
                              ? "bg-muted/70 text-muted-foreground/50 cursor-not-allowed border-muted line-through opacity-60"
                              : bookingForm.time === slot.start
                              ? "bg-primary text-primary-foreground border-primary shadow-md"
                              : "bg-background hover:bg-muted border-border hover:border-primary/50"
                          }`}
                          title={slot.isBooked ? "This slot is already booked" : `Book ${slot.start} – ${slot.end}`}
                        >
                          <span className="font-medium">{slot.start}</span>
                          <span className="text-xs opacity-80"> – {slot.end}</span>
                          {slot.isBooked && (
                            <span className="block text-xs mt-1">Booked</span>
                          )}
                        </button>
                      ))}
                    </div>
                    {bookingForm.time && (
                      <p className="text-sm text-primary font-medium flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Selected: {bookingForm.time} – {
                          generatedSlots.find(s => s.start === bookingForm.time)?.end
                        }
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base font-semibold">
                  Notes (Optional)
                </Label>
                <Input
                  id="notes"
                  value={bookingForm.notes}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, notes: e.target.value })
                  }
                  placeholder="Any special requests?"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={selectedServices.length === 0 || !bookingForm.date || !bookingForm.time}
                >
                  Confirm Booking
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsBookingModalOpen(false);
                    resetBookingForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
