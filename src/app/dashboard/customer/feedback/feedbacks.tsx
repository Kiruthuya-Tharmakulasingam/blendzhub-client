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
import { Star } from "lucide-react";
import { feedbackService, Feedback } from "@/services/feedback.service";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

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
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
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

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <DashboardLayout role="customer">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">My Feedbacks</h1>
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
                  <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

