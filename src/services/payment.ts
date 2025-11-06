const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getAllPayments() {
  const res = await fetch(`${BASE_URL}/payments`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch payments");
  return res.json();
}
