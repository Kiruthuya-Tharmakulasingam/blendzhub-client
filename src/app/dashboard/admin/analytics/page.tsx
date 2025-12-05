"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, Calendar, TrendingUp } from "lucide-react";
import api from "@/services/api";

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSalons: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    cancelledAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [salonsRes, appointmentsRes] = await Promise.all([
        api.get("/api/salons").catch(() => ({ data: { total: 0, data: [] } })),
        api
          .get("/api/appointments")
          .catch(() => ({ data: { total: 0, data: [] } })),
      ]);

      const appointments = appointmentsRes.data?.data || [];

      setStats({
        totalUsers: 0, // User endpoint not available
        totalSalons: salonsRes.data?.total || salonsRes.data?.data?.length || 0,
        totalAppointments: appointments.length,
        completedAppointments: appointments.filter(
          (a: any) => a.status === "completed"
        ).length,
        pendingAppointments: appointments.filter(
          (a: any) => a.status === "pending"
        ).length,
        cancelledAppointments: appointments.filter(
          (a: any) => a.status === "cancelled"
        ).length,
      });
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">
              System-wide statistics and insights
            </p>
          </div>

          {/* Overview Stats */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Overview</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Salons
                  </CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSalons}</div>
                  <p className="text-xs text-muted-foreground">Active salons</p>
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
                    {stats.totalAppointments}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All time bookings
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Appointment Stats */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Appointment Statistics
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.completedAppointments}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalAppointments > 0
                      ? `${Math.round(
                          (stats.completedAppointments /
                            stats.totalAppointments) *
                            100
                        )}%`
                      : "0%"}{" "}
                    of total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Calendar className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.pendingAppointments}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalAppointments > 0
                      ? `${Math.round(
                          (stats.pendingAppointments /
                            stats.totalAppointments) *
                            100
                        )}%`
                      : "0%"}{" "}
                    of total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Cancelled
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.cancelledAppointments}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalAppointments > 0
                      ? `${Math.round(
                          (stats.cancelledAppointments /
                            stats.totalAppointments) *
                            100
                        )}%`
                      : "0%"}{" "}
                    of total
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
