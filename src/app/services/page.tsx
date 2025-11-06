"use client";
import { useEffect, useState } from "react";
import { getAllServices } from "@/services/service";

export default function ServicePage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllServices();
        setServices(Array.isArray(data) ? data : data.data || []);
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
      <p className="text-center mt-6 text-gray-300">Loading services...</p>
    );

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-white">Service List</h1>
      {services.length === 0 ? (
        <p>No services found.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-lg">
          <table className="min-w-full border border-gray-700 bg-gray-800 text-sm">
            <thead className="bg-gradient-to-r from-gray-700 to-gray-600 text-white uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-3 border border-gray-700">Name</th>
                <th className="px-6 py-3 border border-gray-700">Price</th>
                <th className="px-6 py-3 border border-gray-700">Duration</th>
                <th className="px-6 py-3 border border-gray-700">Discount</th>
                <th className="px-6 py-3 border border-gray-700">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr
                  key={s._id}
                  className="hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="px-6 py-3 border border-gray-700">{s.name}</td>
                  <td className="px-6 py-3 border border-gray-700">
                    {s.price}
                  </td>
                  <td className="px-6 py-3 border border-gray-700">
                    {s.discount}
                  </td>
                  <td className="px-6 py-3 border border-gray-700">
                    {s.description}
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
