"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { appointmentService } from "@/services/appointment.service";
import { salonService } from "@/services/salon.service";
import { Appointment } from "@/types/owner.types";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { FilterAndSort } from "@/components/FilterAndSort";
import { Pagination } from "@/components/Pagination";
import { Calendar, Clock, User, Scissors, CheckCircle, XCircle } from "lucide-react";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter, sortBy, sortOrder]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Owner's Salon first
      const salonResponse = await salonService.getMySalon().catch(() => ({ success: false, data: null }));
      const salon = salonResponse.success ? salonResponse.data : null;
      
      if (!salon) {
        // If no salon, we can't fetch appointments
        setAppointments([]);
        setTotal(0);
        setTotalPages(0);
        return;
      }
      
      const salonId = salon._id;

      const params: {
        page: number;
        limit: number;
        sortBy: string;
        sortOrder: "asc" | "desc";
        search?: string;
        status?: string;
        salonId: string;
      } = {
        page,
        limit,
        sortBy,
        sortOrder,
        salonId,
      };
      if (search.trim()) {
        params.search = search;
      }
      if (statusFilter) {
        params.status = statusFilter;
      }
      const response = await appointmentService.getAppointments(params);
      if (response.success && response.data) {
        setAppointments(response.data);
        setTotal(response.total || 0);
        setTotalPages(response.totalPages || 0);
      }
    } catch {
      toast.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await appointmentService.updateAppointmentStatus(id, status);
      if (response.success) {
        if (status === "accepted") {
          toast.success("Appointment accepted! Customer has been notified.");
        } else if (status === "rejected") {
          toast.success("Appointment rejected! Customer has been notified.");
        } else {
          toast.success("Appointment status updated");
        }
        fetchAppointments();
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      const errorMessage = apiError?.response?.data?.message || "Failed to update status";
      toast.error(errorMessage);
    }
  };

  const handleAccept = async (id: string) => {
    await handleStatusChange(id, "accepted");
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this appointment? The customer will be notified.")) {
      return;
    }
    await handleStatusChange(id, "rejected");
  };

  const getStatusBadge = (status: string) => {
    type StatusBadgeStatus = 
      | "pending"
      | "accepted"
      | "approved"
      | "rejected"
      | "cancelled"
      | "in-progress"
      | "completed"
      | "active"
      | "inactive"
      | "no-show";
    
    const statusMap: Record<string, StatusBadgeStatus> = {
      accepted: "accepted",
      "in-progress": "in-progress",
      completed: "completed",
      cancelled: "cancelled",
      "no-show": "no-show",
      rejected: "rejected",
      pending: "pending",
    };
    const mappedStatus = statusMap[status] || "pending";
    return <StatusBadge status={mappedStatus} />;
  };

  return (
    <ProtectedRoute allowedRoles={["owner"]}>
      <DashboardLayout role="owner">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Appointments</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                Manage your salon appointments
              </p>
            </div>
          </div>

          <FilterAndSort
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Search appointments..."
            showSearch={true}
            showFilter={true}
            filterLabel="Filter by Status"
            filterValue={statusFilter}
            filterOptions={[
              { value: "pending", label: "Pending" },
              { value: "accepted", label: "Accepted" },
              { value: "in-progress", label: "In Progress" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
              { value: "no-show", label: "No Show" },
            ]}
            onFilterChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            showSort={true}
            sortLabel="Sort by"
            sortValue={sortBy}
            sortOptions={[
              { value: "date", label: "Date" },
              { value: "amount", label: "Amount" },
              { value: "status", label: "Status" },
              { value: "createdAt", label: "Created Date" },
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

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading appointments...
                    </TableCell>
                  </TableRow>
                ) : appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No appointments found
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map((appointment) => (
                    <TableRow key={appointment._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {appointment.customerId?.name || "Unknown Customer"}
                            </div>
                            {appointment.customerId?.email && (
                              <div className="text-sm text-muted-foreground">
                                {appointment.customerId.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Scissors className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {appointment.serviceId?.name || "Unknown Service"}
                            </div>
                            {appointment.serviceId?.price && (
                              <div className="text-sm text-muted-foreground">
                                Rs. {appointment.serviceId.price}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div>
                              {new Date(appointment.date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {appointment.time}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        Rs. {appointment.amount}
                      </TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell className="text-right">
                        {appointment.status === "pending" ? (
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              size="sm"
                              onClick={() => handleAccept(appointment._id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(appointment._id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <Select
                            defaultValue={appointment.status}
                            onValueChange={(value) =>
                              handleStatusChange(appointment._id, value)
                            }
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="accepted">Accepted</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Complete</SelectItem>
                              <SelectItem value="cancelled">Cancel</SelectItem>
                              <SelectItem value="no-show">No Show</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
