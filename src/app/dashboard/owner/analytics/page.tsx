"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, TrendingUp, Users } from "lucide-react";
import { appointmentService } from "@/services/appointment.service";
import { feedbackService } from "@/services/feedback.service";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Appointment {
  _id: string;
  date: string;
  status: string;
  serviceId: { name: string; price: number };
}

export default function OwnerAnalyticsPage() {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    totalRevenue: 0,
    averageRating: 0,
  });
  const [appointmentTrends, setAppointmentTrends] = useState<Array<{ date: string; appointments: number }>>([]);
  const [servicePopularity, setServicePopularity] = useState<Array<{ name: string; count: number }>>([]);
  const [statusDistribution, setStatusDistribution] = useState<Array<{ name: string; value: number }>>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [appointmentsRes, feedbacksRes] = await Promise.all([
        appointmentService.getAppointments().catch(() => ({ success: false, data: [] })),
        feedbackService.getFeedbacks().catch(() => ({ success: false, data: [] })),
      ]);

      const appointments: Appointment[] = appointmentsRes.data || [];
      const feedbacks = feedbacksRes.data || [];

      // Calculate stats
      const completed = appointments.filter((a) => a.status === "completed");
      const totalRevenue = completed.reduce(
        (sum, a) => sum + (a.serviceId?.price || 0),
        0
      );
      const avgRating =
        feedbacks.length > 0
          ? feedbacks.reduce((sum: number, f: { rating: number }) => sum + f.rating, 0) /
            feedbacks.length
          : 0;

      setStats({
        totalAppointments: appointments.length,
        completedAppointments: completed.length,
        totalRevenue,
        averageRating: Math.round(avgRating * 10) / 10,
      });

      // Appointment trends (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split("T")[0];
      });

      const trends = last7Days.map((date) => {
        const count = appointments.filter(
          (a) => a.date.split("T")[0] === date
        ).length;
        return {
          date: new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          appointments: count,
        };
      });
      setAppointmentTrends(trends);

      // Service popularity
      const serviceCount: { [key: string]: number } = {};
      appointments.forEach((a) => {
        const serviceName = a.serviceId?.name || "Unknown";
        serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
      });
      const popularity = Object.entries(serviceCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setServicePopularity(popularity);

      // Status distribution
      const statusCount: { [key: string]: number } = {};
      appointments.forEach((a) => {
        statusCount[a.status] = (statusCount[a.status] || 0) + 1;
      });
      const distribution = Object.entries(statusCount).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));
      setStatusDistribution(distribution);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <ProtectedRoute allowedRoles={["owner"]}>
      <DashboardLayout role="owner">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">
              Track your salon&apos;s performance and insights
            </p>
          </div>

          {/* Stats Cards */}
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
                  {stats.totalAppointments}
                </div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
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
                  completion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Rs. {stats.totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  From completed appointments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Rating
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.averageRating > 0 ? stats.averageRating : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Customer satisfaction
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Appointment Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Appointment Trends (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={appointmentTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="appointments"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Service Popularity */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Popular Services</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={servicePopularity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Appointment Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: unknown) => {
                        const props = entry as { name?: string; percent?: number };
                        const name = props?.name || 'Unknown';
                        const percent = props?.percent || 0;
                        return `${name}: ${(percent * 100).toFixed(0)}%`;
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Completion Rate
                  </span>
                  <span className="font-bold">
                    {stats.totalAppointments > 0
                      ? `${Math.round(
                          (stats.completedAppointments /
                            stats.totalAppointments) *
                            100
                        )}%`
                      : "0%"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Average Revenue per Appointment
                  </span>
                  <span className="font-bold">
                    Rs.{" "}
                    {stats.completedAppointments > 0
                      ? Math.round(
                          stats.totalRevenue / stats.completedAppointments
                        )
                      : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total Services Offered
                  </span>
                  <span className="font-bold">{servicePopularity.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Customer Rating
                  </span>
                  <span className="font-bold">
                    {stats.averageRating > 0
                      ? `${stats.averageRating} / 5.0`
                      : "No ratings yet"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
