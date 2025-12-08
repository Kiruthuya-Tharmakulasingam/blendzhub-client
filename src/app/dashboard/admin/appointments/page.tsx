"use client";

import { useState } from "react";
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
import { Calendar, Clock, MapPin, User, Scissors } from "lucide-react";

export default function AdminAppointmentsPage() {
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

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params: {
        page: number;
        limit: number;
        sortBy: string;
        sortOrder: "asc" | "desc";
        search?: string;
        status?: string;
      } = {
        page,
        limit,
        sortBy,
        sortOrder,
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
      await appointmentService.updateAppointmentStatus(id, status);
      toast.success("Appointment status updated");
      fetchAppointments();
    } catch {
      toast.error("Failed to update status");
    }
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
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">All Appointments</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                Manage and monitor all appointments across the platform
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
                  <TableHead>Salon</TableHead>
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
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading appointments...
                    </TableCell>
                  </TableRow>
                ) : appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
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
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {typeof appointment.salonId === 'object' && appointment.salonId ? appointment.salonId.name : "Unknown Salon"}
                            </div>
                            {typeof appointment.salonId === 'object' && appointment.salonId?.location && (
                              <div className="text-sm text-muted-foreground">
                                {appointment.salonId.location}
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
                            <SelectItem value="accepted">Accept</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Complete</SelectItem>
                            <SelectItem value="cancelled">Cancel</SelectItem>
                            <SelectItem value="no-show">No Show</SelectItem>
                          </SelectContent>
                        </Select>
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

