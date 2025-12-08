"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Store } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { appointmentService } from "@/services/appointment.service";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    totalAppointments: 0,
    completedAppointments: 0,
  });
  const [, setAllAppointments] = useState<Array<{ date: string; status: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Get all appointments
      const appointmentsRes = await appointmentService.getAppointments();
      const appointments = appointmentsRes.success && appointmentsRes.data ? appointmentsRes.data : [];
      setAllAppointments(appointments);
      
      // Calculate upcoming appointments (next 7 days)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      nextWeek.setHours(23, 59, 59, 999);
      
      const upcoming = appointments.filter((apt: { date: string; status: string }) => {
        const aptDate = new Date(apt.date);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate >= today && aptDate <= nextWeek && 
               (apt.status === "pending" || apt.status === "accepted" || apt.status === "in-progress");
      });

      const completed = appointments.filter((apt: { status: string }) => apt.status === "completed");

      setStats({
        upcomingAppointments: upcoming.length,
        totalAppointments: appointments.length,
        completedAppointments: completed.length,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <DashboardLayout role="customer">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
            <p className="text-muted-foreground mt-2">
              Manage your appointments and explore salons
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Upcoming Appointments
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats.upcomingAppointments}
                </div>
                <p className="text-xs text-muted-foreground">
                  Next 7 days
                </p>
              </CardContent>
            </Card>

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
                  All time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completed Services
                </CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats.completedAppointments}
                </div>
                <p className="text-xs text-muted-foreground">
                  Completed appointments
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/dashboard/customer/salons">
                  <Button className="w-full" size="lg">
                    <Store className="mr-2 h-4 w-4" />
                    Browse Salons & Book
                  </Button>
                </Link>
                <Link href="/dashboard/customer/appointments">
                  <Button variant="outline" className="w-full" size="lg">
                    <Calendar className="mr-2 h-4 w-4" />
                    View My Appointments
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground text-center py-8">
                  No recent activity
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
