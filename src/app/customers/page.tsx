"use client";
import { useEffect, useState } from "react";
import { getAllCustomers } from "@/services/customer";

export default function CustomerPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllCustomers();
        setCustomers(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
  2;
  if (loading)
    return (
      <p className="text-center mt-6 text-gray-300">Loading customers...</p>
    );

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-white">Customer List</h1>
      {customers.length === 0 ? (
        <p>No customers found.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-lg">
          <table className="min-w-full border border-gray-700 bg-gray-800 text-sm">
            <thead className="bg-gradient-to-r from-gray-700 to-gray-600 text-white uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-3 border border-gray-700 text-left">
                  Name
                </th>
                <th className="px-6 py-3 border border-gray-700 text-left">
                  Email
                </th>
                <th className="px-6 py-3 border border-gray-700 text-left">
                  Contact
                </th>
                <th className="px-6 py-3 border border-gray-700 text-left">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c._id}
                  className="hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="px-6 py-3 border border-gray-700">{c.name}</td>
                  <td className="px-6 py-3 border border-gray-700">
                    {c.email}
                  </td>
                  <td className="px-6 py-3 border border-gray-700">
                    {c.contact}
                  </td>
                  <td className="px-6 py-3 border border-gray-700">
                    {c.status}
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
