"use client";

import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { salonService } from "@/services/salon.service";
import { Salon } from "@/types/salon.types";

export default function SalonsPage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    try {
      const response = await salonService.getSalons();
      if (response.success && response.data) {
        setSalons(response.data);
      }
    } catch {
      toast.error("Failed to fetch salons");
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "men":
        return "bg-blue-500/15 text-blue-500 hover:bg-blue-500/25 border-blue-500/50";
      case "women":
        return "bg-pink-500/15 text-pink-500 hover:bg-pink-500/25 border-pink-500/50";
      case "unisex":
        return "bg-purple-500/15 text-purple-500 hover:bg-purple-500/25 border-purple-500/50";
      default:
        return "bg-secondary/50 text-secondary-foreground hover:bg-secondary/70 border-secondary";
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Salons Management</h1>
            <p className="text-muted-foreground mt-2">
              View all registered salons
            </p>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Salon Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Opening Hours</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : salons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No salons found
                    </TableCell>
                  </TableRow>
                ) : (
                  salons.map((salon) => (
                    <TableRow key={salon._id}>
                      <TableCell className="font-medium">{salon.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                          {salon.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeBadgeColor(salon.type || "unisex")}>
                          {(salon.type || "unisex").charAt(0).toUpperCase() + (salon.type || "unisex").slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {salon.phone && (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                              {salon.phone}
                            </div>
                          )}
                          {salon.email && (
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                              {salon.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {salon.openingHours || "-"}
                      </TableCell>
                      <TableCell>
                        {new Date(salon.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
