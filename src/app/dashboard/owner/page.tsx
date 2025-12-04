"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Scissors, ShoppingBag, Users } from "lucide-react";
import { appointmentService } from "@/services/appointment.service";
import { serviceService } from "@/services/service.service";
import { productService } from "@/services/product.service";
import api from "@/services/api";

export default function OwnerDashboard() {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    activeServices: 0,
    products: 0,
    customers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, servicesRes, productsRes] = await Promise.all([
        appointmentService.getAppointments().catch(() => ({ success: false, data: [] })),
        serviceService.getServices().catch(() => ({ success: false, data: [] })),
        productService.getProducts().catch(() => ({ success: false, data: [] })),
      ]);

      const appointments = appointmentsRes.success && appointmentsRes.data ? appointmentsRes.data : [];
      const services = servicesRes.success && servicesRes.data ? servicesRes.data : [];
      const products = productsRes.success && productsRes.data ? productsRes.data : [];

      // Get unique customers
      const uniqueCustomers = new Set(
        appointments.map((apt: any) => apt.customerId?._id || apt.customerId).filter(Boolean)
      );

      setStats({
        totalAppointments: appointments.length,
        activeServices: services.length,
        products: products.length,
        customers: uniqueCustomers.size,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["owner"]}>
      <DashboardLayout role="owner">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">
              Overview of your salon operations
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Appointments
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats.totalAppointments}
                </div>
                <p className="text-xs text-muted-foreground">
                  All appointments
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Services
                </CardTitle>
                <Scissors className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats.activeServices}
                </div>
                <p className="text-xs text-muted-foreground">
                  Available services
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Products
                </CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats.products}
                </div>
                <p className="text-xs text-muted-foreground">
                  In stock
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Customers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats.customers}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total customers
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
