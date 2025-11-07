"use client";
import { useEffect, useState } from "react";
import { getAllAppointments } from "@/services/appointment";

export default function AppointmentPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllAppointments();
        console.log("Appointments:", data);
        setAppointments(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Error loading appointments:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading)
    return (
      <p className="text-center mt-6 text-gray-300">Loading appointments...</p>
    );

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-white">Appointment List</h1>

      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-lg">
          <table className="min-w-full border border-gray-700 bg-gray-800 text-sm">
            <thead className="bg-gradient-to-r from-gray-700 to-gray-600 text-white uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-3 border border-gray-700">Customer</th>
                <th className="px-6 py-3 border border-gray-700">Service</th>
                <th className="px-6 py-3 border border-gray-700">Salon</th>
                <th className="px-6 py-3 border border-gray-700">Date</th>
                <th className="px-6 py-3 border border-gray-700">Time</th>
                <th className="px-6 py-3 border border-gray-700">Amount</th>
                <th className="px-6 py-3 border border-gray-700">Discount</th>
                <th className="px-6 py-3 border border-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr
                  key={a._id}
                  className="hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="px-6 py-3 border border-gray-700">
                    {typeof a.customerId === "object"
                      ? a.customerId?.name
                      : a.customerId}
                  </td>
                  <td className="px-6 py-3 border border-gray-700">
                    {typeof a.serviceId === "object"
                      ? a.serviceId?.name
                      : a.serviceId}
                  </td>
                  <td className="px-6 py-3 border border-gray-700">
                    {typeof a.salonId === "object"
                      ? a.salonId?.name
                      : a.salonId}
                  </td>
                  <td className="px-6 py-3 border border-gray-700">
                    {a.date ? new Date(a.date).toLocaleString() : "N/A"}
                  </td>
                  <td className="px-6 py-3 border border-gray-700">{a.time}</td>
                  <td className="px-6 py-3 border border-gray-700">
                    {a.amount}
                  </td>
                  <td className="px-6 py-3 border border-gray-700">
                    {a.discount}
                  </td>
                  <td className="px-6 py-3 border border-gray-700">
                    {a.status}
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
