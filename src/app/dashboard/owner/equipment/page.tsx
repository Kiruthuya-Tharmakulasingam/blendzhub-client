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
import { equipmentService } from "@/services/equipment.service";
import { Equipment } from "@/types/owner.types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadService } from "@/services/upload.service";

export default function EquipmentPage() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "available" as "available" | "in-use" | "maintenance" | "unavailable",
    lastSterlizedDate: "",
    imageUrl: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await equipmentService.getEquipment();
      if (response.success && response.data) {
        setEquipmentList(response.data);
      }
    } catch {
      toast.error("Failed to fetch equipment");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
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

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await equipmentService.updateEquipment(id, { status: status as "available" | "in-use" | "maintenance" | "unavailable" });
      toast.success("Equipment status updated");
      fetchEquipment();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEquipment) {
        await equipmentService.updateEquipment(editingEquipment._id, formData);
        toast.success("Equipment updated successfully");
      } else {
        await equipmentService.createEquipment(formData);
        toast.success("Equipment created successfully");
      }
      setIsModalOpen(false);
      resetForm();
      fetchEquipment();
    } catch {
      toast.error("Failed to save equipment");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this equipment?")) {
      try {
        await equipmentService.deleteEquipment(id);
        toast.success("Equipment deleted successfully");
        fetchEquipment();
    } catch {
      toast.error("Failed to delete equipment");
    }
    }
  };

  const handleEdit = (item: Equipment) => {
    setEditingEquipment(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      status: item.status,
      lastSterlizedDate: item.lastSterlizedDate ? new Date(item.lastSterlizedDate).toISOString().split('T')[0] : "",
      imageUrl: item.imageUrl || "",
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingEquipment(null);
    setFormData({
      name: "",
      description: "",
      status: "available",
      lastSterlizedDate: "",
      imageUrl: "",
    });
  };

  return (
    <ProtectedRoute allowedRoles={["owner"]}>
      <DashboardLayout role="owner">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Equipment</h1>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" /> Add Equipment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingEquipment ? "Edit Equipment" : "Add Equipment"}
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
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "available" | "in-use" | "maintenance" | "unavailable") =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="in-use">In Use</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lastSterlizedDate">Last Sterilized Date</Label>
                  <Input
                    id="lastSterlizedDate"
                    type="date"
                    value={formData.lastSterlizedDate}
                    onChange={(e) =>
                      setFormData({ ...formData, lastSterlizedDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="image">Equipment Image</Label>
                  <div className="space-y-2">
                    {formData.imageUrl && (
                      <div className="relative w-32 h-32">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.imageUrl}
                          alt="Equipment preview"
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
                <Button type="submit" className="w-full" disabled={isUploading}>
                  {editingEquipment ? "Update" : "Create"}
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
                <TableHead>Status</TableHead>
                <TableHead>Last Sterilized</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipmentList.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={item.status}
                      onValueChange={(value) =>
                        handleStatusChange(item._id, value)
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="in-use">In Use</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {item.lastSterlizedDate
                      ? new Date(item.lastSterlizedDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => handleDelete(item._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {equipmentList.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No equipment found
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
