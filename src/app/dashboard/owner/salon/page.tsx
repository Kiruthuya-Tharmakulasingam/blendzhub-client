"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { salonService, Salon } from "@/services/salon.service";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function MySalonPage() {
  const { user } = useAuth();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    type: "unisex" as "men" | "women" | "unisex",
    phone: "",
    email: "",
    openingHours: "",
    imageUrl: "",
  });

  useEffect(() => {
    fetchSalon();
  }, []);

  const fetchSalon = async () => {
    try {
      const response = await salonService.getSalons();
      if (response.success && response.data && response.data.length > 0) {
        const salonData = response.data[0];
        setSalon(salonData);
        setFormData({
          name: salonData.name,
          location: salonData.location,
          type: salonData.type,
          phone: salonData.phone || "",
          email: salonData.email || "",
          openingHours: salonData.openingHours || "",
          imageUrl: salonData.imageUrl || "",
        });
      }
    } catch (error) {
      toast.error("Failed to fetch salon details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (salon) {
        // Update existing salon
        console.log("Updating salon:", salon._id, formData);
        const response = await salonService.updateSalon(salon._id, formData);
        console.log("Update response:", response);
        toast.success("Salon details updated successfully");
      } else {
        // Create new salon
        console.log("Creating salon:", formData);
        const response = await salonService.createSalon({
          name: formData.name,
          location: formData.location,
          type: formData.type,
          phone: formData.phone,
          email: formData.email,
          openingHours: formData.openingHours,
          imageUrl: formData.imageUrl,
        });
        console.log("Create response:", response);
        toast.success("Salon created successfully");
      }
      setIsEditing(false);
      fetchSalon();
    } catch (error: any) {
      console.error("Failed to save salon:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to save salon details";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["owner"]}>
        <DashboardLayout role="owner">
          <div className="flex justify-center items-center h-64">
            <p>Loading...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  // Show create form if no salon exists
  if (!salon && !loading) {
    return (
      <ProtectedRoute allowedRoles={["owner"]}>
        <DashboardLayout role="owner">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Salon</h1>
          </div>

          <div className="max-w-2xl">
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800">
                You don't have a salon yet. Please create one to get started.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Salon Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="men">Men</SelectItem>
                      <SelectItem value="women">Women</SelectItem>
                      <SelectItem value="unisex">Unisex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="openingHours">Opening Hours</Label>
                  <Textarea
                    id="openingHours"
                    value={formData.openingHours}
                    onChange={(e) =>
                      setFormData({ ...formData, openingHours: e.target.value })
                    }
                    placeholder="e.g., Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
                  />
                </div>

                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter a URL to an image of your salon
                  </p>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Create Salon
              </Button>
            </form>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["owner"]}>
      <DashboardLayout role="owner">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Salon</h1>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>Edit Details</Button>
          )}
        </div>

        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Salon Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={!isEditing}
                  required
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  disabled={!isEditing}
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, type: value })
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="openingHours">Opening Hours</Label>
                <Textarea
                  id="openingHours"
                  value={formData.openingHours}
                  onChange={(e) =>
                    setFormData({ ...formData, openingHours: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="e.g., Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
                />
              </div>

              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter a URL to an image of your salon
                </p>
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="Salon preview"
                      className="w-full h-48 object-cover rounded-md border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4">
                <Button type="submit">Save Changes</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    fetchSalon();
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
