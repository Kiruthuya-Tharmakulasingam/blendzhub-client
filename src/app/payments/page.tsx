"use client";
import { useEffect, useState } from "react";
import { getAllPayments } from "@/services/payment";

export default function PaymentPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllPayments();
        setPayments(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Error loading payments:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading)
    return (
      <p className="text-center mt-6 text-gray-300">Loading payments...</p>
    );

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-white">Payment List</h1>
      {payments.length === 0 ? (
        <p>No payments found.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-lg">
          <table className="min-w-full border border-gray-700 bg-gray-800 text-sm">
            <thead className="bg-gradient-to-r from-gray-700 to-gray-600 text-white uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-3 border border-gray-700">Date</th>
                <th className="px-6 py-3 border border-gray-700">Method</th>
                <th className="px-6 py-3 border border-gray-700">Status</th>
                <th className="px-6 py-3 border border-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr
                  key={p._id}
                  className="hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="px-6 py-3 border border-gray-700">
                    {new Date(p.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 border border-gray-700">
                    {p.method}
                  </td>
                  <td className="px-6 py-3 border border-gray-700">
                    {p.status}
                  </td>
                  <td className="px-6 py-3 border border-gray-700">
                    {p.amount}
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
