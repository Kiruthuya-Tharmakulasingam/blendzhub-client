const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getAllStaffs() {
  const res = await fetch(`${BASE_URL}/staffs`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch staffs");
  return res.json();
}
