"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { serviceService } from "@/services/service.service";
import { salonService } from "@/services/salon.service";
import { Service } from "@/types/service.types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadService } from "@/services/upload.service";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    discount: "",
    imageUrl: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      // First fetch the owner's salon to get the ID
      // This is required because the backend service endpoint requires salonId
      // even for owners in some cases (due to auth middleware behavior)
      const salonResponse = await salonService.getMySalon();
      
      if (!salonResponse.success || !salonResponse.data) {
        // If no salon found, we can't fetch services
        // The backend will handle the "no salon" case for creation, 
        // but for listing we need the ID
        setServices([]);
        return;
      }
      
      const salonId = salonResponse.data._id;
      
      // Now fetch services with the explicit salonId
      const response = await serviceService.getServices({ salonId });
      if (response.success && response.data) {
        setServices(response.data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append("image", file);

      const response = await uploadService.uploadImage(file);

      if (response.success && response.data) {
        setFormData({ ...formData, imageUrl: response.data.url });
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        ...formData,
        price: Number(formData.price),
        duration: Number(formData.duration),
        discount: formData.discount ? Number(formData.discount) : undefined,
        imageUrl: formData.imageUrl || undefined,
      };

      if (editingService) {
        await serviceService.updateService(editingService._id, data);
        toast.success("Service updated successfully");
      } else {
        await serviceService.createService(data);
        toast.success("Service created successfully");
      }
      setIsModalOpen(false);
      resetForm();
      fetchServices();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = apiError?.response?.data?.message || apiError?.message || "Failed to save service";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { confirm } = useConfirmDialog();

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete Service",
      message: "Are you sure you want to delete this service? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!confirmed) return;

    try {
      await serviceService.deleteService(id);
      toast.success("Service deleted successfully");
      fetchServices();
    } catch {
      toast.error("Failed to delete service");
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      price: service.price?.toString() || "0",
      duration: service.duration?.toString() || "0",
      discount: service.discount?.toString() || "",
      imageUrl: service.imageUrl || "",
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingService(null);
    setIsSubmitting(false);
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "",
      discount: "",
      imageUrl: "",
    });
  };

  return (
    <ProtectedRoute allowedRoles={["owner"]}>
      <DashboardLayout role="owner">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Services</h1>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" /> Add Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingService ? "Edit Service" : "Add Service"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (Rs.)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (min)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="image">Service Image</Label>
                  <div className="space-y-2">
                    {formData.imageUrl && (
                      <div className="relative w-32 h-32">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.imageUrl}
                          alt="Service preview"
                          className="w-full h-full object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => setFormData({ ...formData, imageUrl: "" })}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    {isUploading && (
                      <p className="text-sm text-muted-foreground">Uploading image...</p>
                    )}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isUploading || isSubmitting}>
                  {isSubmitting ? (editingService ? "Updating..." : "Creating...") : (editingService ? "Update" : "Create")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service._id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>Rs. {service.price}</TableCell>
                  <TableCell>{service.duration} min</TableCell>
                  <TableCell>{service.discount ? `${service.discount}%` : "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(service)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => handleDelete(service._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {services.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No services found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
