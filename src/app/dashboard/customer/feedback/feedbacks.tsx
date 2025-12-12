"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star, Pencil, Trash2 } from "lucide-react";
import { feedbackService, Feedback } from "@/services/feedback.service";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComments, setEditComments] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState<Feedback | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await feedbackService.getMyFeedbacks();
      if (response.success && response.data) {
        setFeedbacks(response.data);
      } else {
        toast.error("Failed to fetch feedbacks");
      }
    } catch (error) {
      toast.error("Failed to fetch feedbacks");
      console.error("Error fetching feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-warning text-warning"
                : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  const getSalonName = (salonId: Feedback['salonId']): string => {
    try {
      if (!salonId || salonId === null) return "N/A";
      if (typeof salonId === 'string') return "N/A";
      if (typeof salonId !== 'object') return "N/A";
      const name = salonId?.name;
      if (name === null || name === undefined || name === '') return "N/A";
      return String(name);
    } catch (error) {
      console.error('Error getting salon name:', error);
      return "N/A";
    }
  };

  const getSalonLocation = (salonId: Feedback['salonId']): string => {
    try {
      if (!salonId || salonId === null) return "N/A";
      if (typeof salonId === 'string') return "N/A";
      if (typeof salonId !== 'object') return "N/A";
      const location = salonId?.location;
      if (location === null || location === undefined || location === '') return "N/A";
      return String(location);
    } catch (error) {
      console.error('Error getting salon location:', error);
      return "N/A";
    }
  };

  const handleOpenEdit = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setEditRating(feedback.rating);
    setEditComments(feedback.comments || "");
    setEditModalOpen(true);
  };

  const handleSubmitEdit = async () => {
    if (!selectedFeedback) return;

    try {
      setSubmittingEdit(true);
      await feedbackService.updateFeedback(selectedFeedback._id, {
        rating: editRating,
        comments: editComments,
      });
      toast.success("Feedback updated successfully");
      setEditModalOpen(false);
      fetchFeedbacks();
    } catch {
      toast.error("Failed to update feedback");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleOpenDelete = (feedback: Feedback) => {
    setFeedbackToDelete(feedback);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!feedbackToDelete) return;

    try {
      setDeleting(true);
      await feedbackService.deleteFeedback(feedbackToDelete._id);
      toast.success("Feedback deleted successfully");
      setDeleteDialogOpen(false);
      setFeedbackToDelete(null);
      fetchFeedbacks();
    } catch {
      toast.error("Failed to delete feedback");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <div className="flex min-h-screen flex-col bg-background font-sans home-theme">
        <Navbar />

        <main className="flex-1 py-12 px-8 sm:px-16">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-primary">My Feedbacks</h1>
                <p className="text-muted-foreground mt-2">
                  View and manage your salon feedbacks
                </p>
              </div>
            </div>

            {loading ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground">
                    Loading feedbacks...
                  </div>
                </CardContent>
              </Card>
            ) : feedbacks.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground">
                    <Star className="h-12 w-12 mx-auto mb-4 text-muted" />
                    <p className="text-lg font-medium">No feedbacks yet</p>
                    <p className="text-sm mt-2">
                      Your feedbacks will appear here once you submit them.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Salon</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Comments</TableHead>
                      <TableHead>Owner Reply</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedbacks.map((feedback) => (
                      <TableRow key={feedback._id}>
                        <TableCell className="font-medium">
                          {getSalonName(feedback.salonId)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {getSalonLocation(feedback.salonId)}
                        </TableCell>
                        <TableCell>{renderStars(feedback.rating)}</TableCell>
                        <TableCell>
                          {feedback.comments || (
                            <span className="text-muted-foreground italic">
                              No comments
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {feedback.reply ? (
                            <div className="text-sm">
                              <span className="font-medium text-primary">
                                Owner:
                              </span>{" "}
                              <span className="text-muted-foreground">
                                {feedback.reply}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">
                              No reply yet
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(feedback.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEdit(feedback)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDelete(feedback)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </main>

        <Footer />

        {/* Edit Feedback Dialog */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="home-theme">
            <DialogHeader>
              <DialogTitle>Edit Feedback</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-rating">Rating</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= editRating
                            ? "fill-warning text-warning"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-comments">Comments</Label>
                <Textarea
                  id="edit-comments"
                  placeholder="Write your feedback..."
                  value={editComments}
                  onChange={(e) => setEditComments(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                disabled={submittingEdit}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitEdit} disabled={submittingEdit}>
                {submittingEdit ? "Updating..." : "Update Feedback"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="home-theme">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                feedback.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
}
