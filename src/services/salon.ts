const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getAllSalons() {
  const res = await fetch(`${BASE_URL}/salons`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch salons");
  return res.json();
}
