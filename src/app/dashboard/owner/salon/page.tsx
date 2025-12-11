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
import { salonService } from "@/services/salon.service";
import { uploadService } from "@/services/upload.service";
import { Salon } from "@/types/salon.types";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";

export default function MySalonPage() {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
      const response = await salonService.getMySalon();
      if (response.success && response.data) {
        const salonData = response.data;
        setSalon(salonData);
        setFormData({
          name: salonData.name,
          location: salonData.location,
          type: salonData.type || "unisex",
          phone: salonData.phone || "",
          email: salonData.email || "",
          openingHours: salonData.openingHours || "",
          imageUrl: salonData.imageUrl || "",
        });
        if (salonData.imageUrl) {
          setImagePreview(salonData.imageUrl);
        }
      }
    } catch {
      // Silently handle error - salon doesn't exist yet
      // The UI will show the create form
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormData({ ...formData, imageUrl: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let finalImageUrl = formData.imageUrl;

      // Upload image if a new file is selected
      if (selectedFile) {
        setUploading(true);
        try {
          const uploadResponse = await uploadService.uploadImage(selectedFile);
          if (uploadResponse.success && uploadResponse.data) {
            finalImageUrl = uploadResponse.data.url;
            setFormData(prev => ({ ...prev, imageUrl: finalImageUrl }));
          } else {
            throw new Error("Failed to upload image");
          }
        } catch (error) {
          console.error("Image upload failed:", error);
          toast.error("Failed to upload image. Please try again.");
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      const salonDataToSave = {
        ...formData,
        imageUrl: finalImageUrl
      };

      if (salon) {
        // Update existing salon
        console.log("Updating salon:", salon._id, salonDataToSave);
        const response = await salonService.updateSalon(salon._id, salonDataToSave);
        console.log("Update response:", response);
        if (response.success) {
          toast.success("Salon details updated successfully");
          setIsEditing(false);
          setSelectedFile(null);
          fetchSalon();
        } else {
          toast.error(response.message || "Failed to update salon");
        }
      } else {
        // Create new salon
        console.log("Creating salon:", salonDataToSave);
        const response = await salonService.createSalon(salonDataToSave);
        console.log("Create response:", response);
        if (response.success) {
          toast.success("Salon created successfully");
          setSelectedFile(null);
          fetchSalon();
        } else {
          toast.error(response.message || "Failed to create salon");
        }
      }
    } catch (error: unknown) {
      console.error("Failed to save salon:", error);
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = apiError?.response?.data?.message || apiError?.message || "Failed to save salon details";
      toast.error(errorMessage);
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["owner"]}>
        <DashboardLayout role="owner">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                You don&apos;t have a salon yet. Please create one to get started.
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
                    onValueChange={(value: "men" | "women" | "unisex") =>
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
                  <Label htmlFor="image">Salon Image</Label>
                  <div className="mt-2 space-y-4">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("image-upload")?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Image
                      </Button>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      {selectedFile && (
                        <span className="text-sm text-muted-foreground">
                          {selectedFile.name}
                        </span>
                      )}
                    </div>

                    {imagePreview && (
                      <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading Image...
                  </>
                ) : (
                  "Create Salon"
                )}
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
                  onValueChange={(value: "men" | "women" | "unisex") =>
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
                <Label htmlFor="image">Salon Image</Label>
                {isEditing ? (
                  <div className="mt-2 space-y-4">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("image-upload-edit")?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {imagePreview ? "Change Image" : "Upload Image"}
                      </Button>
                      <Input
                        id="image-upload-edit"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      {selectedFile && (
                        <span className="text-sm text-muted-foreground">
                          {selectedFile.name}
                        </span>
                      )}
                    </div>

                    {imagePreview && (
                      <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-2">
                    {formData.imageUrl ? (
                      <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.imageUrl}
                          alt="Salon"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-muted rounded-md flex items-center justify-center border border-dashed">
                        <p className="text-muted-foreground">No image available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4">
                <Button type="submit" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedFile(null);
                    fetchSalon();
                  }}
                  disabled={uploading}
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
