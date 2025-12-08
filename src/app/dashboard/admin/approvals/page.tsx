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
import { StatusBadge } from "@/components/ui/status-badge";

export default function ApprovalsPage() {
  const [pendingOwners, setPendingOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionOwner, setActionOwner] = useState<Owner | null>(null);
  const [actionType, setActionType] = useState<
    "approve" | "reject" | "delete" | null
  >(null);
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
    } catch {
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

      loadPendingOwners();

      setActionOwner(null);
      setActionType(null);
      setRejectReason("");
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(
        apiError?.response?.data?.message || `Failed to ${actionType} owner`
      );
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Owner Approvals</h1>
              <p className="text-muted-foreground mt-2">
                Review and approve pending owner requests
              </p>
            </div>
            <Button onClick={loadPendingOwners} variant="outline" size="sm">
              Refresh
            </Button>
          </div>

          <div className="rounded-md border border-border bg-card">
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
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
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
                        <StatusBadge
                          status={owner.status === "pending" ? "pending" : owner.status === "approved" ? "approved" : "rejected"}
                        />
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-success hover:bg-success/90 text-success-foreground"
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
                          className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
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

          <AlertDialog
            open={!!actionOwner}
            onOpenChange={(open) => !open && setActionOwner(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {actionType === "approve"
                    ? "Approve Owner Request"
                    : actionType === "reject"
                    ? "Reject Owner Request"
                    : "Delete Owner Request"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {actionType === "approve"
                    ? `Are you sure you want to approve ${actionOwner?.name}? They will be able to access their dashboard immediately.`
                    : actionType === "reject"
                    ? `Are you sure you want to reject ${actionOwner?.name}? This action cannot be undone.`
                    : `Are you sure you want to DELETE ${actionOwner?.name}? This will permanently remove the owner request and user account. This cannot be undone.`}
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
                <AlertDialogCancel
                  onClick={() => {
                    setActionOwner(null);
                    setActionType(null);
                    setRejectReason("");
                  }}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleAction}
                  className={
                    actionType === "approve"
                      ? "bg-success hover:bg-success/90 text-success-foreground"
                      : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
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
