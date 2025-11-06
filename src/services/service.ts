const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getAllServices() {
  const res = await fetch(`${BASE_URL}/services`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch services");
  return res.json();
}
