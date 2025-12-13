"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { User, Mail, Phone } from "lucide-react";
import { profileService } from "@/services/profile.service";
import { uploadService } from "@/services/upload.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Trash2 } from "lucide-react";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    image: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        image: user.image || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await profileService.updateProfile(formData);
      if (response.success && response.data) {
        await refreshUser();
        toast.success("Profile updated successfully");
        setIsEditing(false);
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      const errorMessage =
        apiError?.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const uploadResponse = await uploadService.uploadImage(file);

      if (uploadResponse.success && uploadResponse.data) {
        const imageUrl = uploadResponse.data.url;
        setFormData((prev) => ({ ...prev, image: imageUrl }));
        
        const profileResponse = await profileService.updateProfile({ ...formData, image: imageUrl });
        
        if (profileResponse.success && profileResponse.data) {
          await refreshUser();
          toast.success("Profile image updated successfully");
        }
      }
    } catch (error: unknown) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      setFormData((prev) => ({ ...prev, image: "" }));
      
      const response = await profileService.updateProfile({ ...formData, image: "" });
      
      if (response.success && response.data) {
        await refreshUser();
        toast.success("Profile image removed successfully");
      }
    } catch (error: unknown) {
      console.error("Remove image error:", error);
      toast.error("Failed to remove image");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <div className="flex min-h-screen flex-col bg-background font-sans home-theme">
        <Navbar />

        <main className="flex-1 py-12 px-8 sm:px-16">
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">My Profile</h1>
              <p className="text-muted-foreground mt-2">
                Manage your account information
              </p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Personal Information</CardTitle>
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={formData.image || undefined} alt={formData.name} />
                      <AvatarFallback>
                        <User className="h-12 w-12 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div className="absolute bottom-0 right-0 flex gap-2">
                        <Label
                          htmlFor="image-upload"
                          className="cursor-pointer bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
                        >
                          <Camera className="h-4 w-4" />
                          <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={isUploading}
                          />
                        </Label>
                        {formData.image && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 rounded-full shadow-sm"
                            onClick={handleRemoveImage}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  {isUploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
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
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        disabled={!isEditing}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-2">
                      <Button type="submit">Save Changes</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          if (user) {
                            setFormData({
                              name: user.name || "",
                              email: user.email || "",
                              phone: user.phone || "",
                              image: user.image || "",
                            });
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <span className="font-medium capitalize">{user?.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Status:</span>
                  <span className="font-medium">
                    {user?.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member Since:</span>
                  <span className="font-medium">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
