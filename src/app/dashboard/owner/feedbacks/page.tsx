"use client";

import { useState, useEffect } from "react";
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
import { Star, MessageSquare } from "lucide-react";
import { feedbackService, Feedback } from "@/services/feedback.service";
import { toast } from "sonner";
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

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  // Reply state
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await feedbackService.getFeedbacks();
      if (response.success && response.data) {
        setFeedbacks(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch feedbacks");
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
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const handleOpenReply = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setReplyText("");
    setReplyModalOpen(true);
  };

  const handleSubmitReply = async () => {
    if (!selectedFeedback) return;

    try {
      setSubmittingReply(true);
      await feedbackService.replyToFeedback(selectedFeedback._id, replyText);
      toast.success("Reply submitted successfully");
      setReplyModalOpen(false);
      fetchFeedbacks(); // Refresh list to show new reply
    } catch (error) {
      toast.error("Failed to submit reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["owner"]}>
      <DashboardLayout role="owner">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Customer Feedbacks</h1>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Reply</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbacks.map((feedback) => (
                <TableRow key={feedback._id}>
                  <TableCell className="font-medium">
                    {feedback.customerId?.name || "Unknown"}
                  </TableCell>
                  <TableCell>{renderStars(feedback.rating)}</TableCell>
                  <TableCell>{feedback.comments || "-"}</TableCell>
                  <TableCell>
                    {feedback.reply ? (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-primary">Owner:</span>{" "}
                        {feedback.reply}
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {!feedback.reply && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenReply(feedback)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {feedbacks.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No feedbacks found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={replyModalOpen} onOpenChange={setReplyModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reply to Feedback</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Customer Comment</Label>
                <div className="p-3 bg-muted rounded-md text-sm">
                  {selectedFeedback?.comments || "No comments provided"}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reply">Your Reply</Label>
                <Textarea
                  id="reply"
                  placeholder="Write your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setReplyModalOpen(false)}
                disabled={submittingReply}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitReply} disabled={submittingReply}>
                {submittingReply ? "Sending..." : "Send Reply"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
