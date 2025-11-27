"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin } from "lucide-react";

export default function CustomerDashboard() {
  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
        <Navbar />

        <main className="flex-1 py-12 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Manage your appointments and profile
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                <h2 className="text-xl font-semibold">Upcoming Appointments</h2>

                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center text-zinc-500">
                    <Calendar className="h-12 w-12 mb-4 opacity-20" />
                    <p className="mb-4">You have no upcoming appointments</p>
                    <Button>Book Now</Button>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Quick Actions</h2>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <Clock className="mr-2 h-4 w-4" />
                      History
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <MapPin className="mr-2 h-4 w-4" />
                      Saved Salons
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
