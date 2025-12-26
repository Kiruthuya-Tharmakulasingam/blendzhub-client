"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Scissors, ShoppingBag, Users, AlertCircle } from "lucide-react";
import { appointmentService } from "@/services/appointment.service";
import { serviceService } from "@/services/service.service";
import { productService } from "@/services/product.service";
import { salonService } from "@/services/salon.service";
import SubscriptionSection from "@/components/subscription/SubscriptionSection";

export default function OwnerDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [stats, setStats] = useState({
    totalAppointments: 0,
    activeServices: 0,
    products: 0,
    customers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [needsSalon, setNeedsSalon] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Owner's Salon first
      const salonResponse = await salonService.getMySalon().catch(() => ({ success: false, data: null }));
      const salon = salonResponse.success ? salonResponse.data : null;
      
      if (!salon) {
        setNeedsSalon(true);
        setStats({
          totalAppointments: 0,
          activeServices: 0,
          products: 0,
          customers: 0,
        });
        return;
      }
      
      const salonId = salon._id;

      // 2. Fetch data using the salonId
      const [appointmentsRes, servicesRes, productsRes] = await Promise.all([
        appointmentService.getAppointments().catch(() => ({ success: false, data: [] })),
        serviceService.getServices({ salonId }).catch(() => ({ success: false, data: [] })),
        productService.getProducts({ salonId }).catch(() => ({ success: false, data: [] })),
      ]);

      const appointments = appointmentsRes.success && appointmentsRes.data ? appointmentsRes.data : [];
      const services = servicesRes.success && servicesRes.data ? servicesRes.data : [];
      const products = productsRes.success && productsRes.data ? productsRes.data : [];

      // Get unique customers
      const uniqueCustomers = new Set(
        appointments.map((apt: { customerId?: { _id?: string } | string }) => 
          typeof apt.customerId === 'object' ? apt.customerId?._id : apt.customerId
        ).filter(Boolean)
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
      <DashboardLayout 
        role="owner" 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
      >
        {activeSection === "overview" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div>
              <h1 className="text-3xl font-bold">Dashboard Overview</h1>
              <p className="text-muted-foreground mt-2">
                Manage your salon, appointments, and services
              </p>
            </div>
            
            {needsSalon && (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                      Create Your Salon First
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                      Before you can manage products, services, and appointments, you need to create your salon profile.
                    </p>
                    <Button 
                      className="mt-3" 
                      size="sm"
                      onClick={() => setActiveSection("my salon")}
                    >
                      Create Salon Now
                    </Button>
                  </div>
                </div>
              </div>
            )}
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
        )}

        {activeSection === "subscription" && <SubscriptionSection />}
        
        {activeSection !== "overview" && activeSection !== "subscription" && (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
            <h2 className="text-2xl font-bold capitalize">{activeSection} Section</h2>
            <p className="text-muted-foreground">This section is currently under development for the unified layout.</p>
            <Button onClick={() => setActiveSection("overview")}>Back to Overview</Button>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
