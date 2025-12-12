"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { salonService } from "@/services/salon.service";
import { Salon } from "@/types/salon.types";
import { serviceService } from "@/services/service.service";
import { Service } from "@/types/service.types";
import { slotService, TimeSlot } from "@/services/slot.service";
import { appointmentService } from "@/services/appointment.service";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Clock, Calendar } from "lucide-react";
import { FilterAndSort } from "@/components/FilterAndSort";
import { Pagination } from "@/components/Pagination";

export default function BrowseSalonsPage() {
  const router = useRouter();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    serviceId: "",
    date: "",
    time: "",
    notes: "",
  });

  // Pagination, filtering, and sorting state
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchSalons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery, filterType, sortBy, sortOrder]);

  const fetchSalons = async () => {
    try {
      setLoading(true);
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
      }
    } catch {
      toast.error("Failed to fetch salons");
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

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalon) return;

    if (!bookingForm.serviceId || !bookingForm.date || !bookingForm.time) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      console.log("Booking payload:", {
        salonId: selectedSalon._id,
        serviceId: bookingForm.serviceId,
        date: bookingForm.date,
        time: bookingForm.time,
        notes: bookingForm.notes,
      });
      const response = await appointmentService.createAppointment({
        salonId: selectedSalon._id,
        serviceId: bookingForm.serviceId,
        date: bookingForm.date,
        time: bookingForm.time,
        notes: bookingForm.notes,
      });

      if (response.success) {
        toast.success("Appointment booked successfully!");
        setIsBookingModalOpen(false);
        resetBookingForm();
        // Optionally redirect to appointments page
        router.push("/dashboard/customer/appointments");
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
      const errorMessage = apiError?.response?.data?.message || apiError?.message || "Failed to book appointment";
      toast.error(errorMessage);
      console.error("Booking error:", error);
    }
  };

  const fetchAvailableSlots = async (date: string, serviceId: string) => {
    if (!date || !serviceId || !selectedSalon) {
      setAvailableSlots([]);
      return;
    }

    try {
      setLoadingSlots(true);
      const response = await slotService.getAvailableSlots(date, serviceId, selectedSalon._id);
      if (response.slots) {
        setAvailableSlots(response.slots);
        if (response.slots.length === 0 && response.message) {
          toast.info(response.message);
        }
      } else {
        setAvailableSlots([]);
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
      const errorMessage = apiError?.response?.data?.message || apiError?.message || "Failed to fetch available time slots";
      toast.error(errorMessage);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleServiceChange = (serviceId: string) => {
    setBookingForm({ ...bookingForm, serviceId, time: "" });
    if (bookingForm.date) {
      fetchAvailableSlots(bookingForm.date, serviceId);
    }
  };

  const handleDateChange = (date: string) => {
    setBookingForm({ ...bookingForm, date, time: "" });
    setAvailableSlots([]); // Clear previous slots
    if (bookingForm.serviceId && date) {
      fetchAvailableSlots(date, bookingForm.serviceId);
    }
  };

  const resetBookingForm = () => {
    setBookingForm({
      serviceId: "",
      date: "",
      time: "",
      notes: "",
    });
    setSelectedSalon(null);
    setServices([]);
    setAvailableSlots([]);
  };

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <DashboardLayout role="customer">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Browse Salons</h1>
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
          />

          {loading ? (
            <div className="text-center py-12">Loading salons...</div>
          ) : salons.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No salons available</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
              {salons.map((salon) => (
                <Card key={salon._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{salon.name}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {salon.location}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Type:</span>
                        <span className="capitalize">{salon.type}</span>
                      </div>
                      {salon.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {salon.phone}
                        </div>
                      )}
                      {salon.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {salon.email}
                        </div>
                      )}
                      {salon.openingHours && (
                        <div className="flex items-start">
                          <Clock className="h-4 w-4 mr-2 mt-0.5" />
                          <span className="text-xs">{salon.openingHours}</span>
                        </div>
                      )}
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => handleBookNow(salon)}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
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

          {/* Booking Modal */}
          <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
            <DialogContent className="max-w-md home-theme">
              <DialogHeader>
                <DialogTitle>
                  Book Appointment at {selectedSalon?.name}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="service">Service *</Label>
                  <Select
                    value={bookingForm.serviceId}
                    onValueChange={handleServiceChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service._id} value={service._id}>
                          {service.name} - Rs. {service.price} ({service.duration} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    max={(() => {
                      const maxDate = new Date();
                      maxDate.setDate(maxDate.getDate() + 30); // Default max 30 days
                      return maxDate.toISOString().split('T')[0];
                    })()}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Select a date within the next 30 days
                  </p>
                </div>

                <div>
                  <Label htmlFor="time">Available Time Slots *</Label>
                  {!bookingForm.serviceId || !bookingForm.date ? (
                    <div className="text-sm text-muted-foreground p-4 border rounded-md bg-muted/50">
                      Please select a service and date to see available time slots
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
                          onClick={() => setBookingForm({ ...bookingForm, time: slot.start })}
                          className={`p-2 text-sm rounded-md border transition-colors ${
                            bookingForm.time === slot.start
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-muted border-border"
                          }`}
                        >
                          {slot.start} - {slot.end}
                        </button>
                      ))}
                    </div>
                  )}
                  {bookingForm.time && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Selected: {bookingForm.time}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={bookingForm.notes}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, notes: e.target.value })
                    }
                    placeholder="Any special requests?"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
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
      </DashboardLayout>
    </ProtectedRoute>
  );
}
