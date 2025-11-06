const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getAllAppointments() {
  const res = await fetch(`${BASE_URL}/appointments`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch appointments");
  return res.json();
}
