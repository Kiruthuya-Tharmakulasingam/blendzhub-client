"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ownerService } from "@/services/owner.service";
import { Owner } from "@/types/auth.types";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const [pendingOwners, setPendingOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionOwner, setActionOwner] = useState<Owner | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "delete" | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    loadPendingOwners();
  }, []);

  const loadPendingOwners = async () => {
    try {
      const response = await ownerService.getPendingOwners();
      if (response.success && response.data) {
        setPendingOwners(response.data);
      }
    } catch (error) {
      toast.error("Failed to load pending owners");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!actionOwner || !actionType) return;

    try {
      if (actionType === "approve") {
        await ownerService.approveOwner(actionOwner._id);
        toast.success(`Approved ${actionOwner.name}'s request`);
      } else if (actionType === "reject") {
        await ownerService.rejectOwner(actionOwner._id, rejectReason);
        toast.success(`Rejected ${actionOwner.name}'s request`);
      } else if (actionType === "delete") {
        await ownerService.deleteOwner(actionOwner._id);
        toast.success(`Deleted ${actionOwner.name}'s request`);
      }
      
      // Refresh list
      loadPendingOwners();
      
      // Reset state
      setActionOwner(null);
      setActionType(null);
      setRejectReason("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${actionType} owner`);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Pending Approvals</h2>
            <Button onClick={loadPendingOwners} variant="outline" size="sm">
              Refresh
            </Button>
          </div>

          <div className="rounded-md border bg-white dark:bg-zinc-900">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Owner Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : pendingOwners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                      No pending approvals found.
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingOwners.map((owner) => (
                    <TableRow key={owner._id}>
                      <TableCell className="font-medium">
                        {owner.businessName || "N/A"}
                      </TableCell>
                      <TableCell>{owner.name}</TableCell>
                      <TableCell>{owner.email}</TableCell>
                      <TableCell>{owner.phone || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          {owner.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setActionOwner(owner);
                            setActionType("approve");
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setActionOwner(owner);
                            setActionType("reject");
                          }}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          onClick={() => {
                            setActionOwner(owner);
                            setActionType("delete");
                          }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Confirmation Dialog */}
          <AlertDialog open={!!actionOwner} onOpenChange={(open) => !open && setActionOwner(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {actionType === "approve" 
                    ? "Approve Owner Request" 
                    : actionType === "reject" 
                      ? "Reject Owner Request"
                      : "Delete Owner Request"
                  }
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {actionType === "approve" 
                    ? `Are you sure you want to approve ${actionOwner?.name}? They will be able to access their dashboard immediately.`
                    : actionType === "reject"
                      ? `Are you sure you want to reject ${actionOwner?.name}? This action cannot be undone.`
                      : `Are you sure you want to DELETE ${actionOwner?.name}? This will permanently remove the owner request and user account. This cannot be undone.`
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              {actionType === "reject" && (
                <div className="py-2">
                  <Input
                    placeholder="Reason for rejection (optional)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
              )}

              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => {
                  setActionOwner(null);
                  setActionType(null);
                  setRejectReason("");
                }}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleAction}
                  className={
                    actionType === "approve" 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "bg-red-600 hover:bg-red-700"
                  }
                >
                  {actionType === "delete" ? "Delete" : "Confirm"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
