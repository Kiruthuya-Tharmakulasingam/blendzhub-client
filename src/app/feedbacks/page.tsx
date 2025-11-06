"use client";
import { useEffect, useState } from "react";
import { getAllFeedbacks } from "@/services/feedback";

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllFeedbacks();
        console.log("Feedback data:", data);
        setFeedbacks(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading)
    return (
      <p className="text-center mt-6 text-gray-300">Loading feedbacks...</p>
    );

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-white">Feedback List</h1>
      {feedbacks.length === 0 ? (
        <p>No feedbacks found.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-lg">
          <table className="min-w-full border border-gray-700 bg-gray-800 text-sm">
            <thead className="bg-gradient-to-r from-gray-700 to-gray-600 text-white uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-3 border border-gray-700 text-left">
                  Customer
                </th>
                <th className="px-6 py-3 border border-gray-700 text-left">
                  Comments
                </th>
                <th className="px-6 py-3 border border-gray-700 text-left">
                  Rating
                </th>
                <th className="px-6 py-3 border border-gray-700 text-left">
                  Salon
                </th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((f) => (
                <tr
                  key={f._id}
                  className="hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="px-6 py-3 border border-gray-700">
                    {typeof f.customerId === "object"
                      ? f.customerId?.name || "N/A"
                      : f.customerId}
                  </td>
                  <td className="px-6 py-3 border border-gray-700">
                    {f.comments}
                  </td>
                  <td className="px-6 py-3 border border-gray-700">
                    {f.rating}
                  </td>
                  <td className="px-6 py-3 border border-gray-700">
                    {typeof f.salonId === "object"
                      ? f.salonId?.salonId || "N/A"
                      : f.salonId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
