"use client";
import { useEffect, useState } from "react";
import { getAllEquipments } from "@/services/equipment";

export default function EquipmentPage() {
  const [equipments, setEquipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllEquipments();
        setEquipments(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Error loading equipments:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading)
    return (
      <p className="text-center mt-6 text-gray-300">Loading equipments...</p>
    );

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-white">Equipment List</h1>
      {equipments.length === 0 ? (
        <p>No equipments found.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-lg">
          <table className="min-w-full border border-gray-700 bg-gray-800 text-sm">
            <thead className="bg-gradient-to-r from-gray-700 to-gray-600 text-white uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-3 border border-gray-700">Name</th>
                <th className="px-6 py-3 border border-gray-700">Status</th>
                <th className="px-6 py-3 border border-gray-700">
                  Last Sterlized Date
                </th>
              </tr>
            </thead>
            <tbody>
              {equipments.map((e) => (
                <tr
                  key={e._id}
                  className="hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="px-6 py-3 border border-gray-700">{e.name}</td>
                  <td className="px-6 py-3 border border-gray-700">
                    {e.status}
                  </td>
                  <td className="px-6 py-3 border border-gray-700">
                    {e.lastSterlizedDate}
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
