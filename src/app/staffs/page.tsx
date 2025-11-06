"use client";
import { useEffect, useState } from "react";
import { getAllStaffs } from "@/services/staff";

export default function StaffPage() {
  const [staffs, setStaffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllStaffs();
        setStaffs(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading)
    return <p className="text-center mt-6 text-gray-300">Loading staffs...</p>;

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-white">Staff List</h1>
      {staffs.length === 0 ? (
        <p>No staff found.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-lg">
          <table className="min-w-full border border-gray-700 bg-gray-800 text-sm">
            <thead className="bg-gradient-to-r from-gray-700 to-gray-600 text-white uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-3 border border-gray-700">Name</th>
                <th className="px-6 py-3 border border-gray-700">Role</th>
                <th className="px-6 py-3 border border-gray-700">Contact</th>
                <th className="px-6 py-3 border border-gray-700">
                  Skill Level
                </th>
                <th className="px-6 py-3 border border-gray-700">
                  Training Status
                </th>
              </tr>
            </thead>
            <tbody>
              {staffs.map((s) => (
                <tr
                  key={s._id}
                  className="hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="px-6 py-3 border border-gray-700">{s.name}</td>
                  <td className="px-6 py-3 border border-gray-700">{s.role}</td>
                  <td className="px-6 py-3 border border-gray-700">
                    {s.skillLevel}
                  </td>
                  <td className="px-6 py-3 border border-gray-700">
                    {s.trainingStatus}
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
