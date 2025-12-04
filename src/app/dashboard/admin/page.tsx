"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import api from "@/services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSalons: 0,
    totalAppointments: 0,
    pendingOwners: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch stats from available endpoints
      const [salonsRes, appointmentsRes, ownersRes] = await Promise.all([
        api.get("/api/salons").catch(() => ({ data: { total: 0 } })),
        api.get("/api/appointments").catch(() => ({ data: { total: 0 } })),
        api.get("/api/owners/pending").catch(() => ({ data: { data: [] } })),
      ]);

      setStats({
        totalUsers: 0, // User endpoint not available
        totalSalons: salonsRes.data?.total || salonsRes.data?.data?.length || 0,
        totalAppointments: appointmentsRes.data?.total || appointmentsRes.data?.data?.length || 0,
        pendingOwners: ownersRes.data?.data?.length || 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">
              Manage users, salons, and system overview
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  All registered users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Salons</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSalons}</div>
                <p className="text-xs text-muted-foreground">
                  Active salons
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAppointments}</div>
                <p className="text-xs text-muted-foreground">
                  Total bookings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingOwners}</div>
                <p className="text-xs text-muted-foreground">
                  Owner requests
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
                <Link href="/dashboard/admin/users">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                </Link>
                <Link href="/dashboard/admin/salons">
                  <Button className="w-full justify-start" variant="outline">
                    <Store className="mr-2 h-4 w-4" />
                    Manage Salons
                  </Button>
                </Link>
                <Link href="/dashboard/admin/appointments">
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Manage Appointments
                  </Button>
                </Link>
                <Link href="/dashboard/admin/analytics">
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Owner Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.pendingOwners > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      You have {stats.pendingOwners} pending owner approval{stats.pendingOwners > 1 ? 's' : ''}
                    </p>
                    <Link href="/dashboard/admin/approvals">
                      <Button className="w-full">
                        Review Approvals
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No pending approvals
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
